import observation from 'can-observation-recorder';
import queues from 'can-queues';
import canReflect from 'can-reflect';

// key to store canjs handles on the accessor object
export const CANJS_KEY = Symbol('can.handles');

export function initCanKey(obj, key) {
  const handlers = obj[CANJS_KEY] = obj[CANJS_KEY] || {};
  handlers[key] = handlers[key] || {
    handlers: [],
    watch: null,
    key,
  };

  return obj[CANJS_KEY][key];
}


/**
 * when a value gets unbound, remove its watch handle and the handler
 * @param {String} key The property name
 * @param {Function} handle The function to call
 */
function offKeyValue(key, handle) {
  console.log('offKeyValue', key);
  const keyProps = initCanKey(this, key);
  if (keyProps && keyProps.handlers.length) {
    // remove the handler
    const index = keyProps.handlers.indexOf(handle);
    keyProps.handlers.splice(index, 1);
  }

  // clean up the watch handle if no handlers
  if (!keyProps.handlers.length && keyProps.watch) {
    this.un(keyProps.key, handler.watch);
    keyProps.watch = null;
  }
}

/**
 * when a value gets bound, register its handler using `watch`
 * @param {String} key The property to observe
 * @param {Function} handler The function to call when the property changes
 */
function onkeyValue(key, handler) {
  console.log('onKeyValue', key);
  const keyProps = initCanKey(this, key);

  // register one single watcher
  if (!keyProps.watch) {
    keyProps.watch = function(event) {
      const newValue = event.target.get(key);
      const oldValue = event.oldValue;

      queues.batch.start();
      keyProps.handlers.forEach((handle) => {
        handle(newValue, oldValue);
      });
      queues.batch.stop();
    };
  }

  // push the handler into the stack
  keyProps.handlers.push(handler);
}

/**
 * when a value is gotten, or set, call observation.add
 * @param {String} key The property to get
 * @return {Any}
 */
function getKeyValue(key) {
  console.log('getKeyValue', key);
  observation.add(this, key);
  return this.get ? this.get(key) : this[key];
}

/**
 *
 * @param {String} key The property to set
 * @param {Any} value The value
 */
function setKeyValue(key, value) {
  observation.add(this, key);
  if (this.set) {
    this.set(key, value);
  } else {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('No set method to call on object', this);
    }
    this[key] = value;
  }
}

/**
 * Decorate esri's observable type with canjs methods
 * @example assignCanSymbols(Observable.prototype)
 * @param {ol.Observable} prototype The Observable prototype to decorate
 * @return {undefined}
 */
export default function assignCanSymbols(prototype) {
  const symbols = {
    'can.isMapLike': true,
    'can.offKeyValue': offKeyValue,
    'can.onKeyValue': onkeyValue,
    'can.getKeyValue': getKeyValue,
    'can.setKeyValue': setKeyValue,
    'can.getOwnEnumerableKeys': prototype.getKeys,
    'can.serialize': prototype.getProperties,
  };

  canReflect.assignSymbols(prototype, symbols);
}
