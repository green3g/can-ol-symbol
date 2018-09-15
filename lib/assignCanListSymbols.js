// import {CANJS_KEY} from './assignCanSymbols';
import canReflect from 'can-reflect';
import queues from 'can-queues';

/**
 * returns this collection's length
 * @return {Number}
 */
function size() {
  return this.length;
}

/**
 * Returns the array value of this collection
 * @return {Array}
 */
function value() {
  canReflect.getKeyValue(this, 'length');
  return this.getArray();
}

/**
 * Handles change event handlers in this collection
 * @param {Function} handler Handler function when this collection changes
 */
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
