
import Observable from 'ol/Observable';
import Collection from 'ol/Collection';
import Map from 'ol/Map';
import Tile from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import {fromLonLat} from 'ol/proj';
import stache from 'can-stache';
import Component from 'can-component';
import 'ol/ol.css';
import can from 'can-debug';
window.can = can;

import assignCanSymbols from './lib/assignCanSymbols';
import assignCanListSymbols from './lib/assignCanListSymbols';

assignCanSymbols(Observable.prototype);
assignCanListSymbols(Collection.prototype);

const map = new Map({
  target: 'map',
  layers: [
    new Tile({
      title: 'OSM',
      source: new OSM(),
    }),
  ],
  view: new View({
    center: fromLonLat([37.41, 8.82]),
    zoom: 4,
  }),
});

Component.extend({
  tag: 'lat-lon',
  view: `
  <ul>
  <li>Center: {{map.view.center.0}}, {{map.view.center.1}}</li>
  <li>Resolution: {{map.view.resolution}}</li>
  {{#for(layer of map.layergroup.layers)}}<li>{{layer.title}}</li>{{/for}}
  </ul>
<p>{{map.layergroup.layers.length}}</p>
  `,
  ViewModel: {
    map: {},
  },
});


setTimeout(() => {
  map.getLayers().push(new Tile({
    source: new OSM(),
  }));
}, 10000);

document.body.appendChild(stache('<lat-lon map:from="map" />')({
  map,
}));

setTimeout(() => {
  map.get('layergroup').get('layers').push(new Tile({
    title: 'OSM',
    source: new OSM(),
  }));
}, 1000);


console.log(map);
