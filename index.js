
import Observable from 'ol/Observable';
import Collection from 'ol/Collection';
import stache from 'can-stache';

import assignCanSymbols from './lib/assignCanSymbols';
import assignCanListSymbols from './lib/assignCanListSymbols';

assignCanSymbols(Observable.prototype);
assignCanListSymbols(Collection.prototype);

const array = new Collection(['hi', 'hey', 'hello']);

document.body.appendChild(stache(`
  {{#for(a of array)}}<li>{{a}}</li>{{/for}}
`)({
  array,
}));

console.log(array);

array.push('hola');

setTimeout(() => {
  array.removeAt(2);
}, 2000);

setTimeout(() => {
  array.clear();
}, 10000);
