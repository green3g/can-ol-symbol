// import {CANJS_KEY} from './assignCanSymbols';
import canReflect from 'can-reflect';
import queues from 'can-queues';


function size() {
  return this.length;
}

function value() {
  canReflect.getKeyValue(this, 'length');
  return this.getArray();
}

function onPatches(handler) {
  this.on(['add', 'remove'], (event) => {
    queues.batch.start();
    console.log(event);
    const el = event.el;
    const array = this.getArray();
    handler([{type: 'values', key: array.indexOf(el), insert: [el]}]);
    queues.batch.stop();
  });
}

/**
 *
 * @param {Object} prototype The prototype to add symbols
 */
export default function assignCanListSymbols(prototype) {
  canReflect.assignSymbols(prototype, {
    'can.isListLike': true,
    'can.isMoreListLikeThanMapLike': true,
    'can.size': size,
    'can.getValue': value,
    'can.onPatches': onPatches,
  });
}
