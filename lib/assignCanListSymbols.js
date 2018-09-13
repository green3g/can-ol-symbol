// import {CANJS_KEY} from './assignCanSymbols';
import canReflect from 'can-reflect';

/**
 * An iterator function for openlayers collections
 * @return {Object}
 */
function iterator() {
  let data = this.getArray();
  let index = 0;
  canReflect.getKeyValue(this, 'length');
  return {
    // this is the iterator object,
    next: () => {
      if (
        index < data.length) {
        return {value: data[index++], done: false};
      } else {
        // If we would like to iterate over this
        // again without forcing manual update of the index
        index = 0;
        return {done: true};
      }
    },
  };
};

/**
 *
 * @param {Object} prototype The prototype to add symbols
 */
export default function assignCanListSymbols(prototype) {
  canReflect.assignSymbols(prototype, {
    'can.isListLike': true,
  });
  prototype[Symbol.iterator] = iterator;
}
