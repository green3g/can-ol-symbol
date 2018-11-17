import canReflect from 'can-reflect';
import observation from 'can-observation-recorder';
import assignCanSymbols, {initCanKey} from './assignCanSymbols';

function getValue() {
  console.log('getValue');
  canReflect.getKeyValue(this, length);
  observation.add(this, 'length');
  console.log(this.getArray());
  console.log(this);
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


function onPatches(handler, queue) {
  const keyProps = initCanKey(this, 'patches');
  console.log('onPatches', arguments);

  if (!keyProps.watch) {
    keyProps.watch = {
      add: this.on('add', (collectionevent) => {
        console.log('on add', arguments);
        keyProps.handlers.forEach((handle) => {
          handle([{
            type: 'add',
            key: this.getArray().indexOf(collectionevent.element),
            value: collectionevent.element,
          }]);
        });
      }),
      remove: this.on('remove', (collectionevent) => {
        console.log('on remove', arguments);
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
    'can.isListLike': true,
    'can.getValue': getValue,
    'can.onValue': onValue,
    'can.getValueDependencies': getValueDependencies,
    'can.size': size,
  });
}
