"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.map = void 0;

var _sidebar = require("./sidebar.js");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

mapboxgl.accessToken = 'pk.eyJ1IjoiaG9va2FobG9jYXRvciIsImEiOiI5WnJEQTBBIn0.DrAlI7fhFaYr2RcrWWocgw';
var defaultObserverPoint = {
  center: [-9.1963944, 38.4093151],
  zoom: 3.1
};
var map = new mapboxgl.Map({
  container: 'map',
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  // style: "mapbox://styles/hookahlocator/clsox9viv009f01pk1mf40pwu",
  style: 'mapbox://styles/mapbox/satellite-streets-v9',
  // style: "mapbox://styles/mapbox/dark-v10?optimize=true",
  // style: "mapbox://styles/hookahlocator/clg82vae6008501mpb46y0kwc?optimize=true",
  // style: "mapbox://styles/hookahlocator/clsumxbp8002g01pihdv4290g",
  center: defaultObserverPoint.center,
  // starting position [lng, lat]
  zoom: defaultObserverPoint.zoom,
  // starting zoom,
  attributionControl: false // pitch: 62, // starting pitch
  // bearing: -20 // starting bearing,
  //            maxBounds: bounds

});
exports.map = map;
map.on('style.load', function () {// map.setConfigProperty('basemap', 'lightPreset', 'dusk');
});
map.on('style.load', function () {
  map.addSource('mapbox-dem', {
    type: 'raster-dem',
    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
    tileSize: 512,
    maxzoom: 14
  }); // add the DEM source as a terrain layer with exaggerated height

  map.setTerrain({
    source: 'mapbox-dem',
    exaggeration: 3.5
  });
});
var color = d3.scaleOrdinal(d3.schemeTableau10);

function loadData(filename) {
  var response, data;
  return regeneratorRuntime.async(function loadData$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(fetch(filename));

        case 2:
          response = _context.sent;
          _context.next = 5;
          return regeneratorRuntime.awrap(response.json());

        case 5:
          data = _context.sent;
          return _context.abrupt("return", data);

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
}

function loadImage(url, name) {
  return regeneratorRuntime.async(function loadImage$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          map.loadImage(url, function (err, image) {
            if (err) throw err;
            map.addImage(name, image);
          });

        case 1:
        case "end":
          return _context2.stop();
      }
    }
  });
}

loadData('./result9.json').then(function (data) {
  console.log(data);
  var features = [];
  data.forEach(function (item, i) {
    if (item != null) {
      // let feature = turf.multiPolygon(item.coordinates)
      var feature = item;
      feature.properties['id'] = i;
      feature.properties['color'] = color(i);
      features.push(feature);
    }
  });
  console.log(features);
  var countries = data.filter(function (item) {
    return item.properties.parent_id == 0;
  }).sort(function (a, b) {
    return a.properties.web_name > b.properties.web_name;
  });
  console.log(countries);
  var menu = document.querySelector('#sidebar-content-list');
  var ul = document.createElement('ul');
  ul.classList.add('rounded-rect');
  ul.classList.add('countries');
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var country = _step.value;
      var li = document.createElement('li');
      li.textContent = country.properties.namedetails["name:ru"];
      li.classList.add('non-active');
      li.classList.add('country');

      li.onclick = function (e) {
        defaultListCountry(ul, li);
        changeCountry(data, country.properties.web_id, country);
        var regions = data.filter(function (item) {
          return country.properties.web_id == item.properties.parent_id;
        });

        if (li.classList.contains('active')) {
          li.classList.replace('active', 'non-active');
        } else if (li.classList.contains('non-active')) {
          li.classList.replace('non-active', 'active');

          if (!li.classList.contains('full')) {
            if (regions.length > 0) {
              var ulRegion = document.createElement('ul');
              ulRegion.classList.add('visible');
              ulRegion.classList.add('regions');
              var _iteratorNormalCompletion2 = true;
              var _didIteratorError2 = false;
              var _iteratorError2 = undefined;

              try {
                var _loop2 = function _loop2() {
                  var region = _step2.value;
                  var liRegion = document.createElement('li');
                  liRegion.textContent = region.properties.web_name;
                  liRegion.classList.add('non-active');
                  liRegion.classList.add('region');
                  regionHover(liRegion, region);

                  liRegion.onclick = function (e) {
                    e.stopPropagation();
                    map.setLayoutProperty('admin-2-fill-regions', 'visibility', 'none');
                    map.setPaintProperty('admin-2-line-regions', 'line-width', 1);
                    var subRegions = data.filter(function (item) {
                      return region.properties.web_id == item.properties.parent_id;
                    });

                    if (subRegions.length > 0) {
                      var ulSubregion = document.createElement('ul');
                      ulSubregion.classList.add('visible');
                      ulSubregion.classList.add('subregions');

                      if (liRegion.classList.contains('active')) {
                        console.log(liRegion.childNodes[1].classList);

                        if (liRegion.childNodes[1] && liRegion.childNodes[1].classList.contains('visible')) {
                          liRegion.childNodes[1].style.display = 'none';
                          liRegion.childNodes[1].classList.replace('visible', 'non-visible');
                          map.fitBounds(country.bbox, {
                            padding: 20
                          });
                          map.setLayoutProperty('admin-2-fill-regions', 'visibility', 'visible');
                        }

                        liRegion.classList.replace('active', 'non-active');
                      } else if (liRegion.classList.contains('non-active')) {
                        map.fitBounds(region.bbox, {
                          padding: 20
                        }); // changeCountry(data, region.properties.web_id)
                        // console.log(liRegion.childNodes[1].classList)

                        liRegion.classList.replace('non-active', 'active');

                        if (liRegion.childNodes[1] && liRegion.childNodes[1].classList.contains('non-visible')) {
                          liRegion.childNodes[1].style.display = 'block';
                          liRegion.childNodes[1].classList.replace('non-visible', 'visible');
                        } else {
                          var _iteratorNormalCompletion3 = true;
                          var _didIteratorError3 = false;
                          var _iteratorError3 = undefined;

                          try {
                            var _loop3 = function _loop3() {
                              var subRegion = _step3.value;
                              var liSubregion = document.createElement('li');
                              liSubregion.classList.add('non-active');
                              liSubregion.classList.add('subregion');
                              liSubregion.textContent = subRegion.properties.web_name;

                              liSubregion.onclick = function (e) {
                                e.stopPropagation();
                                map.fitBounds(subRegion.bbox, {
                                  padding: 20
                                });
                              };

                              ulSubregion.appendChild(liSubregion);
                            };

                            for (var _iterator3 = subRegions[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                              _loop3();
                            }
                          } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                          } finally {
                            try {
                              if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                                _iterator3["return"]();
                              }
                            } finally {
                              if (_didIteratorError3) {
                                throw _iteratorError3;
                              }
                            }
                          }

                          liRegion.appendChild(ulSubregion);
                        }
                      }
                    } else {
                      map.fitBounds(region.bbox, {
                        padding: 20
                      }); // changeCountry(data, region.properties.web_id)
                    }
                  };

                  ulRegion.appendChild(liRegion);
                };

                for (var _iterator2 = regions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  _loop2();
                }
              } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                    _iterator2["return"]();
                  }
                } finally {
                  if (_didIteratorError2) {
                    throw _iteratorError2;
                  }
                }
              }

              li.appendChild(ulRegion);
            }

            li.classList.add('full');
          } // }


          li.classList.replace('non-active', 'active');
        } // } else {
        // changeCountry(data, country.properties.web_id)
        // }

      };

      ul.appendChild(li);
    };

    for (var _iterator = countries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  menu.appendChild(ul);

  function defaultListCountry(ul, li) {
    ul.childNodes.forEach(function (child) {
      // console.log(child.classList)
      if (child.classList.contains('active') && child != li) {
        console.log('yes');
        console.log(child, li);
        child.classList.replace('active', 'non-active');
      }
    });
  }

  function addMapboxHoverListener() {
    var idHoveredPolygon = null;
    map.on('mousemove', 'admin-2-fill-regions', function (e) {
      // console.log(e.features[0].id)
      // console.log(e.features[0])
      if (e.features.length > 0) {
        if (idHoveredPolygon === null) {
          idHoveredPolygon = e.features[0].id;
          map.setFeatureState({
            source: 'admin-2',
            // layer: 'admin-2-fill-regions',
            id: idHoveredPolygon
          }, {
            hover: true
          });
        } else {
          if (idHoveredPolygon !== e.features[0].id) {
            map.setFeatureState({
              source: 'admin-2',
              // layer: 'admin-2-fill-regions',
              id: idHoveredPolygon
            }, {
              hover: false
            });
            idHoveredPolygon = e.features[0].id;
            map.setFeatureState({
              source: 'admin-2',
              // layer: 'admin-2-fill-regions',
              id: idHoveredPolygon
            }, {
              hover: true
            });
          }
        }
      }
    });
    map.on('mouseleave', 'admin-2-fill-regions', function (e) {
      if (idHoveredPolygon !== null) {
        map.setFeatureState({
          source: 'admin-2',
          // layer: 'admin-2-fill-regions',
          id: idHoveredPolygon
        }, {
          hover: false
        });
        idHoveredPolygon = null;
      }
    });
  }

  function regionHover(liRegion, region) {
    liRegion.onmouseover = function (e) {
      map.setFeatureState({
        source: 'admin-2',
        // layer: 'admin-2-fill-regions',
        id: region.properties.web_id
      }, {
        hover: true
      });
      console.log('You should found out how to change hover fill property from mapbox docs');
    };

    liRegion.onmouseout = function (e) {
      map.setFeatureState({
        source: 'admin-2',
        // layer: 'admin-2-fill-regions',
        id: region.properties.web_id
      }, {
        hover: false
      });
      console.log('You should found out how to change hover fill property from mapbox docs');
    };
  }

  var lastIdContainer = null;

  function defaultPositionMap() {
    map.setFilter('admin-2-fill-countries', ['==', ['get', 'parent_id'], 0]);
    map.setFilter('admin-2-line-countries', ['==', ['get', 'parent_id'], 0]);
    map.setLayoutProperty('admin-2-line-regions', 'visibility', 'none');
    map.setLayoutProperty('admin-2-fill-regions', 'visibility', 'none');
    map.flyTo(_objectSpread({}, defaultObserverPoint));
    map.setPaintProperty('admin-2-fill-countries', 'fill-opacity', 0.25);
    map.setPaintProperty('admin-2-line-countries', 'line-gap-width', 0);
    lastIdContainer = null;
  }

  function changeCountry(data, id, country) {
    var features = []; // let currentId = id

    features = data.filter(function (item) {
      return item.properties.web_id == id || item.properties.parent_id == id;
    });

    if (lastIdContainer == id) {
      defaultPositionMap();
    } else {
      // regions
      if (features.length > 0) {
        console.log(features.length);
        map.setLayoutProperty('admin-2-line-regions', 'visibility', 'visible');
        map.setLayoutProperty('admin-2-fill-regions', 'visibility', 'visible');
        map.setFilter('admin-2-fill-regions', ['==', ['get', 'parent_id'], id]);
        map.setFilter('admin-2-line-regions', ['==', ['get', 'parent_id'], id]);
      }

      map.fitBounds(country.bbox, {
        padding: 20
      }); //countries

      map.setFilter('admin-2-fill-countries', ['==', ['get', 'web_id'], id]);
      map.setFilter('admin-2-line-countries', ['==', ['get', 'web_id'], id]);
      map.setPaintProperty('admin-2-fill-countries', 'fill-opacity', 0.05);
      map.setPaintProperty('admin-2-line-countries', 'line-gap-width', 1);
      lastIdContainer = id;
    } // return features

  }

  var polygons = {
    type: 'FeatureCollection',
    features: features
  };
  console.log(polygons);
  map.addSource('admin-2', {
    type: 'geojson',
    data: polygons,
    promoteId: 'web_id'
  });
  loadImage('./images/pattern(4).png', 'pattern').then(function () {// map.addLayer({
    // id: 'admin-2-fill-pattern',
    // type: 'fill',
    // source: 'admin-2',
    // paint: {
    //     'fill-pattern': 'pattern'
    // }
    // })
  });
  map.addLayer({
    id: 'admin-2-fill-subregions',
    type: 'fill',
    source: 'admin-2',
    filter: ['==', ['get', 'level'], 3],
    layout: {// visibility: 'none'
    },
    paint: {
      // 'fill-color': ['get', 'color'],
      'fill-opacity-transition': {
        duration: 3500
      },
      'fill-color': '#32a852',
      'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.8, 0.2]
    }
  });
  map.addLayer({
    id: 'admin-2-line-subregions',
    type: 'line',
    source: 'admin-2',
    filter: ['==', ['get', 'level'], 3],
    layout: {// visibility: 'none'
    },
    paint: {
      'line-color': '#32a852',
      'line-width': 1,
      'line-blur': 0 // 'line-dasharray': 0,

    }
  });
  map.addLayer({
    id: 'admin-2-fill-regions',
    type: 'fill',
    source: 'admin-2',
    filter: ['==', ['get', 'level'], 2],
    layout: {
      visibility: 'none'
    },
    paint: {
      // 'fill-color': ['get', 'color'],
      'fill-opacity-transition': {
        duration: 3500
      },
      'fill-color': '#BDADE2',
      // 'fill-opacity': [
      //     'case',
      //     ['boolean', ['feature-state', 'hover'], false],
      //     0.6,
      //     1
      // ],
      'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.8, 0.2] // "fill-emissive-strength": 0.1

    }
  });
  map.addLayer({
    id: 'admin-2-line-regions',
    type: 'line',
    source: 'admin-2',
    filter: ['==', ['get', 'level'], 2],
    // visibility: 'none',
    layout: {
      visibility: 'none'
    },
    paint: {
      // 'line-color': ['get', 'color'],
      'line-color': '#BDADE2',
      'line-width': {
        stops: [[1, 0.5], [5, 2.5]]
      },
      // "line-gap-width" : 1,
      // 'line-join': 'round',
      // 'line-cap': 'round',
      //   "line-round-limit" :50,
      // "line-emissive-strength": 0.01,
      'line-blur': 1,
      // 'line-offset':
      // 'line-outline-width': 1,
      // 'line-outline-color': 'yellow',
      // "line-gap-width ": 1,
      'line-dasharray': {
        stops: [[1, [5, 1]], [5, [7, 3]]]
      } // 'line-opacity': 1
      // 'line-opacity': [
      //     'case',
      //     ['boolean', ['feature-state', 'hover'], false],
      //     0.6,
      //     0.4
      // ]

    }
  });
  map.addLayer({
    id: 'admin-2-fill-countries',
    type: 'fill',
    source: 'admin-2',
    filter: ['==', ['get', 'level'], 1],
    paint: {
      // 'fill-color': ['get', 'color'],
      'fill-opacity-transition': {
        duration: 3500
      },
      'fill-color': '#B94560',
      // 'fill-opacity': [
      //     'case',
      //     ['boolean', ['feature-state', 'hover'], false],
      //     0.6,
      //     1
      // ],
      'fill-opacity': 0.25 // "fill-emissive-strength": 0.1

    }
  });
  map.addLayer({
    id: 'admin-2-line-countries',
    type: 'line',
    source: 'admin-2',
    filter: ['==', ['get', 'level'], 1],
    // visibility: 'none',
    layout: {// "visibility": 'none'
    },
    paint: {
      // 'line-color': ['get', 'color'],
      'line-color': '#B92D40',
      'line-width': {
        stops: [[0, 0], [2, 0.5], [5, 3], [10, 4]]
      },
      // 'line-gap-width': {
      // stops: [[0, 0], [5, 0], [5, 1]]
      // }
      'line-join': 'round',
      // "line-round-limit" : 10,
      // "line-emissive-strength": 0.01,
      // 'line-blur': 5.9,
      // 'line-offset':
      // 'line-cap': 'butt',
      // 'line-outline-width': 1,
      // 'line-outline-color': 'yellow',
      // "line-gap-width ": 1,
      'line-dasharray': {
        stops: [[1, [10, 2]], [3, [20, 1]], [5, [40, 0]]]
      },
      'line-opacity': 0.7 // 'line-opacity': [
      //     'case',
      //     ['boolean', ['feature-state', 'hover'], false],
      //     0.6,
      //     0.4
      // ]

    }
  });
});
map.on('load', function () {
  (0, _sidebar.toggleSidebar)('left');
});
var sidebarArrow = document.querySelector('#arrow'); // console.log(sidebarArrow)

sidebarArrow.addEventListener('click', function () {
  (0, _sidebar.toggleSidebar)('left');
});