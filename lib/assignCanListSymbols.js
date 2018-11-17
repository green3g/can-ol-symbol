import canReflect from 'can-reflect';
import observation from 'can-observation-recorder';
import assignCanSymbols, {initCanKey} from './assignCanSymbols';
import queues from 'can-queues';

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
  console.log('offpatches', handler);
  const keyProps = initCanKey(this, 'patches');
  keyProps.handlers.splice(keyProps.indexOf(handler), 1);

  if (!keyProps.handlers.length) {
    this.un('add', keyProps.watch.add);
    this.un('remove', keyProps.watch.remove);
    keyProps.watch = null;
  }
}


function onPatches(handler, queue) {
  console.log('onpatches', handler);
  const keyProps = initCanKey(this, 'patches');

  if (!keyProps.watch) {
    keyProps.watch = {
      add: this.on('add', (collectionevent) => {
        queues.batch.start();
        keyProps.handlers.forEach((handle) => {
          handle([{
            type: 'splice',
            index: this.getArray().indexOf(collectionevent.element),
            insert: [collectionevent.element],
          }]);
        });
        queues.batch.stop();
      }),
      remove: this.on('remove', (collectionevent) => {
        queues.batch.start();
        keyProps.handlers.forEach((handle) => {
          handle([{
            type: 'splice',
            deleteCount: 1,
            index: 0,
            // delete: [collectionevent.element],
          }]);
        });
        queues.batch.stop();
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
    'can.getKeyValue': function(key) {
      return this.getArray()[key];
    },
    'can.onPatches': onPatches,
    'can.offPatches': offPatches,
    'can.isListLike': true,
    'can.size': size,
  });

  // add length getter
  Object.defineProperty(prototype, 'length', {
    get() {
      return this.getLength();
    },
  });
}
