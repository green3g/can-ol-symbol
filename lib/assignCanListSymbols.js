import canReflect from 'can-reflect';
import observation from 'can-observation-recorder';
import assignCanSymbols, {initCanKey} from './assignCanSymbols';

function getValue() {
  canReflect.getKeyValue(this, length);
  observation.add(this, 'length');
  return this.getArray();
}

function onValue(handler) {
  console.log('onValue');
}

function getValueDependencies() {
  console.log('deps');
}

function size() {
  console.log('size');
  return canReflect.getKeyValue(this, 'length');
}

function offPatches(handler) {
  const keyProps = initCanKey(this, 'patches');
  keyProps.handlers.splice(keyProps.indexOf(handler), 1);

  if (!keyProps.handlers.length) {
    this.un('add', keyProps.watch.add);
    this.un('remove', keyProps.watch.remove);
    keyProps.watch = null;
  }
}


function onPatches(handler, queue) {
  const keyProps = initCanKey(this, 'patches');

  if (!keyProps.watch) {
    keyProps.watch = {
      add: this.on('add', (collectionevent) => {
        keyProps.handlers.forEach((handle) => {
          handle([{
            type: 'add',
            key: this.getArray().indexOf(collectionevent.element),
            value: collectionevent.element,
          }]);
        });
      }),
      remove: this.on('remove', (collectionevent) => {
        keyProps.handlers.forEach((handle) => {
          handle([{
            type: 'delete',
            key: this.getArray().indexOf(collectionevent.element),
            value: collectionevent.element,
          }]);
        });
      }),
    };
  }

  keyProps.handlers.push(handler);
}

/**
 *
 * @param {Object} prototype The prototype to add symbols
 */
export default function assignCanListSymbols(prototype) {
  assignCanSymbols(prototype);
  canReflect.assignSymbols(prototype, {
    'can.onPatches': onPatches,
    'can.offPatches': offPatches,
    'can.isListLike': true,
    'can.getValue': getValue,
    'can.onValue': onValue,
    'can.getValueDependencies': getValueDependencies,
    'can.size': size,
  });
}
