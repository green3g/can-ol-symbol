import canReflect from 'can-reflect';
import queues from 'can-queues';
import assignCanSymbols, {CANJS_KEY} from './assignCanSymbols';

function getValue() {
  console.log('getValue');
  canReflect.getKeyValue(this, length);
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

/**
 *
 * @param {Object} prototype The prototype to add symbols
 */
export default function assignCanListSymbols(prototype) {
  assignCanSymbols(prototype);
  canReflect.assignSymbols(prototype, {
    'can.isMapLike': true,
    'can.getValue': getValue,
    'can.onValue': onValue,
    'can.getValueDependencies': getValueDependencies,
    'can.size': size,
  });
}
