import observation from 'can-observation-recorder';
import queues from 'can-queues';
import canReflect from 'can-reflect';

// key to store canjs handles on the accessor object
export const CANJS_KEY = Symbol('can.handles');


/**
 * when a value gets unbound, remove its watch handle and the handler
 * @param {String} key The property name
 * @param {Function} handle The function to call
 */
function offKeyValue(key, handle) {
  console.log('offKeyValue', key);
  const handlers = this[CANJS_KEY] = this[CANJS_KEY] || {
  };
  if (!handlers[key]) {
    handlers[key] = {
      key: key,
      watch: null,
      handlers: [],
    };
  }

  const handler = handlers[key];
  if (handler && handler.handlers.length) {
    // remove the handler
    const index = handler.handlers.indexOf(handle);
    handler.handlers.splice(index, 1);
  }

  // clean up the watch handle if no handlers
  if (!handler.handlers.length && handler.listener) {
    this.un(key, handler.listener);
    handler.listener = null;
  }
}

/**
 * when a value gets bound, register its handler using `watch`
 * @param {String} key The property to observe
 * @param {Function} handler The function to call when the property changes
 */
function onkeyValue(key, handler) {
  console.log('onKeyValue', key);
  const handlers = this[CANJS_KEY] = this[CANJS_KEY] || {
  };

  if (!handlers[key]) {
    handlers[key] = {
      listener: null,
      handlers: [],
    };
  }
  // register one single watcher
  if (!handlers[key].listener) {
    const listener = function(event) {
      const newValue = event.target.get(key);
      const oldValue = event.oldValue;

      queues.batch.start();
      handlers[key].handlers.forEach((handle) => {
        handle(newValue, oldValue);
      });
      queues.batch.stop();
    };
    Object.assign(handlers[key], {
      key: this.on('change:' + key, listener),
      listener,
    });
  }

  // push the handler into the stack
  handlers[key].handlers.push(handler);
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
  console.log('setKeyValue', key);
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
