// CLEAR OR FILTER WINE REGIONS FOR THIRD STEP CLICKING 

// import {getCountryOSMID} from './overpass.js'
import { toggleSidebar } from './sidebar.js'
import { chooseLanguage } from './sidebar.js'
import { changeProjection } from './sidebar.js'
import { changeLayer } from './sidebar.js'



import { loadProducers } from './producers.js'
import { loadData } from './helpers.js'

mapboxgl.accessToken =
  'pk.eyJ1IjoiaG9va2FobG9jYXRvciIsImEiOiI5WnJEQTBBIn0.DrAlI7fhFaYr2RcrWWocgw'

const defaultObserverPoint = {
  center: [-9.1963944, 38.4093151],
  zoom: 3.1,
  pitch: 0
}

export const control = new mapboxgl.ScaleControl()

export const map = new mapboxgl.Map({
  container: 'map',
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  // style: "mapbox://styles/hookahlocator/clsox9viv009f01pk1mf40pwu",
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  // style: 'mapbox://styles/mapbox/satellite-v8',
  // style: 'mapbox://styles/mapbox/dark-v11',
  // style: "mapbox://styles/mapbox/dark-v10?optimize=true",
  // style: "mapbox://styles/hookahlocator/clg82vae6008501mpb46y0kwc?optimize=true",

  // style: "mapbox://styles/hookahlocator/clsumxbp8002g01pihdv4290g",
  center: defaultObserverPoint.center, // starting position [lng, lat]
  zoom: defaultObserverPoint.zoom, // starting zoom,
  attributionControl: false,
  // pitch: 62, // starting pitch
  // bearing: -20 // starting bearing,
  //            maxBounds: bounds
  projection: 'globe',
  minZoom: 0.5,
  maxZoom: 12
})

// mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.1.0/mapbox-gl-rtl-text.js');

export const mapboxLanguage = new MapboxLanguage({
  defaultLanguage: 'ru'
});

// map.addControl(mapboxLanguage);


map.on('style.load', () => {
  // map.setConfigProperty('basemap', 'lightPreset', 'dusk');
})

map.on('style.load', () => {

  map.addSource('mapbox-dem', {
    type: 'raster-dem',
    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
    tileSize: 512,
    maxzoom: 14
  })
  // add the DEM source as a terrain layer with exaggerated height
  map.setTerrain({ source: 'mapbox-dem', exaggeration: 3.5 })

  loadData('./result9.json').then(data => {
    console.log(data)

    let features = []

    data.forEach((item, i) => {
      if (item != null) {
        // let feature = turf.multiPolygon(item.coordinates)
        let feature = item
        feature.properties['id'] = i
        feature.properties['color'] = color(i)

        features.push(feature)
      }
    })

    console.log(features)

    let countries = data
      .filter(item => item.properties.parent_id == 0)
      .sort((a, b) => a.properties.namedetails["name:ru"] > b.properties.namedetails["name:ru"])
    console.log(countries)

    const menu = document.querySelector('.sidebar-content-list.left')

    const ul = document.createElement('ul')
    ul.classList.add('rounded-rect')
    ul.classList.add('countries')

    for (let country of countries) {
      const li = document.createElement('li')

      li.textContent = country.properties.namedetails["name:ru"]
      li.classList.add('non-active')
      li.classList.add('country')

      li.onclick = function (e) {

        defaultListCountry(ul, li)
        changeCountry(data, country.properties.web_id, country)

        const regions = data.filter(
          item => country.properties.web_id == item.properties.parent_id
        )

        if (li.classList.contains('active')) {

          li.classList.replace('active', 'non-active')

        } else if (li.classList.contains('non-active')) {

          li.classList.replace('non-active', 'active')

          if (!li.classList.contains('full')) {
            if (regions.length > 0) {
              const ulRegion = document.createElement('ul')
              ulRegion.classList.add('visible')
              ulRegion.classList.add('regions')

              for (let region of regions) {
                const liRegion = document.createElement('li')
                liRegion.textContent = region.properties.namedetails["name:ru"]
                liRegion.classList.add('non-active')
                liRegion.classList.add('region')

                regionHover(liRegion, region)

                liRegion.onclick = function (e) {
                  e.stopPropagation()

                  map.setLayoutProperty(
                    'admin-2-fill-regions',
                    'visibility',
                    'none'
                  )

                  map.setPaintProperty('admin-2-line-regions', 'line-width', 1)

                  const subRegions = data.filter(
                    item => region.properties.web_id == item.properties.parent_id
                  )

                  if (subRegions.length > 0) {
                    const ulSubregion = document.createElement('ul')
                    ulSubregion.classList.add('visible')
                    ulSubregion.classList.add('subregions')

                    if (liRegion.classList.contains('active')) {
                      console.log(liRegion.childNodes[1].classList)

                      if (
                        liRegion.childNodes[1] &&
                        liRegion.childNodes[1].classList.contains('visible')
                      ) {
                        liRegion.childNodes[1].style.display = 'none'
                        liRegion.childNodes[1].classList.replace(
                          'visible',
                          'non-visible'
                        )

                        map.fitBounds(country.bbox, {
                          padding: 20
                        })

                        map.setLayoutProperty(
                          'admin-2-fill-regions',
                          'visibility',
                          'visible'
                        )
                      }

                      liRegion.classList.replace('active', 'non-active')
                    } else if (liRegion.classList.contains('non-active')) {
                      map.fitBounds(region.bbox, {
                        padding: 20
                      })

                      // changeCountry(data, region.properties.web_id)

                      // console.log(liRegion.childNodes[1].classList)

                      liRegion.classList.replace('non-active', 'active')

                      if (
                        liRegion.childNodes[1] &&
                        liRegion.childNodes[1].classList.contains('non-visible')
                      ) {
                        liRegion.childNodes[1].style.display = 'block'
                        liRegion.childNodes[1].classList.replace(
                          'non-visible',
                          'visible'
                        )
                      } else {
                        for (let subRegion of subRegions) {
                          const liSubregion = document.createElement('li')

                          liSubregion.classList.add('non-active')
                          liSubregion.classList.add('subregion')
                          liSubregion.textContent = subRegion.properties.web_name

                          liSubregion.onclick = function (e) {
                            e.stopPropagation()

                            // map.setPitch(60).

                            map.fitBounds(subRegion.bbox, {
                              padding: 20,
                              pitch: 60,
                            })
                          }

                          ulSubregion.appendChild(liSubregion)
                        }

                        liRegion.appendChild(ulSubregion)
                      }
                    }
                  } else {
                    map.fitBounds(region.bbox, {
                      padding: 20
                    })

                    // changeCountry(data, region.properties.web_id)
                  }
                }

                ulRegion.appendChild(liRegion)
              }
              li.appendChild(ulRegion)
            }
            li.classList.add('full')
          }
          // }

          li.classList.replace('non-active', 'active')
        }
        // } else {

        // changeCountry(data, country.properties.web_id)
        // }
      }

      ul.appendChild(li)
    }

    menu.appendChild(ul)

    addMapboxHoverListener('admin-2-fill-regions')
    addMapboxHoverListener('admin-2-fill-subregions')

    function defaultListCountry(ul, li) {
      ul.childNodes.forEach(child => {
        // console.log(child.classList)
        if (child.classList.contains('active') && child != li) {
          console.log('yes')
          console.log(child, li)
          child.classList.replace('active', 'non-active')
        }
      })
    }

    function addMapboxHoverListener(layer) {
      let idHoveredPolygon = null

      map.on('mousemove', layer, e => {
        // console.log(e.features[0].id)
        // console.log(e.features[0])

        if (e.features.length > 0) {
          if (idHoveredPolygon === null) {
            idHoveredPolygon = e.features[0].id

            map.setFeatureState(
              {
                source: 'admin-2',
                // layer: 'admin-2-fill-regions',
                id: idHoveredPolygon
              },
              { hover: true }
            )
          } else {
            if (idHoveredPolygon !== e.features[0].id) {
              map.setFeatureState(
                {
                  source: 'admin-2',
                  // layer: 'admin-2-fill-regions',
                  id: idHoveredPolygon
                },
                { hover: false }
              )

              idHoveredPolygon = e.features[0].id

              map.setFeatureState(
                {
                  source: 'admin-2',
                  // layer: 'admin-2-fill-regions',
                  id: idHoveredPolygon
                },
                { hover: true }
              )
            }
          }
        }
      })

      map.on('mouseleave', layer, e => {
        if (idHoveredPolygon !== null) {
          map.setFeatureState(
            {
              source: 'admin-2',
              // layer: 'admin-2-fill-regions',
              id: idHoveredPolygon
            },
            { hover: false }
          )

          idHoveredPolygon = null
        }
      })
    }

    function regionHover(liRegion, region) {
      liRegion.onmouseover = function (e) {
        map.setFeatureState(
          {
            source: 'admin-2',
            // layer: 'admin-2-fill-regions',
            id: region.properties.web_id
          },
          { hover: true }
        )

        console.log(
          'You should found out how to change hover fill property from mapbox docs'
        )
      }

      liRegion.onmouseout = function (e) {
        map.setFeatureState(
          {
            source: 'admin-2',
            // layer: 'admin-2-fill-regions',
            id: region.properties.web_id
          },
          { hover: false }
        )

        console.log(
          'You should found out how to change hover fill property from mapbox docs'
        )
      }
    }

    let lastIdContainer = null

    function defaultPositionMap() {
      map.setFilter('admin-2-fill-countries', ['==', ['get', 'parent_id'], 0])
      map.setFilter('admin-2-line-countries', ['==', ['get', 'parent_id'], 0])

      map.setLayoutProperty('admin-2-line-regions', 'visibility', 'none')
      map.setLayoutProperty('admin-2-fill-regions', 'visibility', 'none')

      map.flyTo({ ...defaultObserverPoint })

      map.setPaintProperty('admin-2-fill-countries', 'fill-opacity', 0.25)
      map.setPaintProperty('admin-2-line-countries', 'line-gap-width', 0)

      lastIdContainer = null
    }

    function changeCountry(data, id, country) {
      let features = []
      // let currentId = id

      features = data.filter(
        item => item.properties.web_id == id || item.properties.parent_id == id
      )

      if (lastIdContainer == id) {
        defaultPositionMap()
      } else {
        // regions
        if (features.length > 0) {
          console.log(features.length)

          map.setLayoutProperty('admin-2-line-regions', 'visibility', 'visible')
          map.setLayoutProperty('admin-2-fill-regions', 'visibility', 'visible')

          map.setFilter('admin-2-fill-regions', ['==', ['get', 'parent_id'], id])
          map.setFilter('admin-2-line-regions', ['==', ['get', 'parent_id'], id])
        }

        map.fitBounds(country.bbox, {
          padding: 20
        })

        //countries
        map.setFilter('admin-2-fill-countries', ['==', ['get', 'web_id'], id])
        map.setFilter('admin-2-line-countries', ['==', ['get', 'web_id'], id])

        map.setPaintProperty('admin-2-fill-countries', 'fill-opacity', 0.05)
        map.setPaintProperty('admin-2-line-countries', 'line-gap-width', 1)

        lastIdContainer = id
      }


      // return features
    }

    const polygons = {
      type: 'FeatureCollection',
      features: features
    }

    console.log(polygons)


    map.addSource('admin-2', {
      type: 'geojson',
      data: polygons,
      promoteId: 'web_id'
    })

    loadProducers()

    map.addLayer({
      id: 'admin-2-fill-subregions',
      type: 'fill',
      source: 'admin-2',
      filter: ['==', ['get', 'level'], 3],
      layout: {
        // visibility: 'none'
      },
      paint: {
        // 'fill-color': ['get', 'color'],
        'fill-opacity-transition': { duration: 3500 },
        'fill-color': '#32a852',
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.8,
          0.2
        ]
      }
    })

    map.addLayer({
      id: 'admin-2-line-subregions',
      type: 'line',
      source: 'admin-2',
      filter: ['==', ['get', 'level'], 3],
      layout: {
        // visibility: 'none'
      },
      paint: {
        'line-color': '#32a852',
        'line-width': 1,
        'line-blur': 0,
        // 'line-dasharray': 0,
      }
    })

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
        'fill-opacity-transition': { duration: 3500 },
        'fill-color': '#BDADE2',
        // 'fill-opacity': [
        //     'case',
        //     ['boolean', ['feature-state', 'hover'], false],
        //     0.6,
        //     1
        // ],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.8,
          0.2
        ]
        // "fill-emissive-strength": 0.1
      }
    })

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
        // 'line-blur': 1,
        // 'line-offset':
        // 'line-outline-width': 1,
        // 'line-outline-color': 'yellow',
        // "line-gap-width ": 1,
        'line-dasharray': {
          stops: [[1, [5, 1]], [5, [7, 3]]]
        }
        // 'line-opacity': 1
        // 'line-opacity': [
        //     'case',
        //     ['boolean', ['feature-state', 'hover'], false],
        //     0.6,
        //     0.4
        // ]
      }
    })

    map.addLayer({
      id: 'admin-2-fill-countries',
      type: 'fill',
      source: 'admin-2',
      filter: ['==', ['get', 'level'], 1],
      paint: {
        // 'fill-color': ['get', 'color'],
        'fill-opacity-transition': { duration: 3500 },
        'fill-color': '#B94560',
        // 'fill-opacity': [
        //     'case',
        //     ['boolean', ['feature-state', 'hover'], false],
        //     0.6,
        //     1
        // ],
        'fill-opacity': 0.25
        // "fill-emissive-strength": 0.1
      }
    })

    map.addLayer({
      id: 'admin-2-line-countries',
      type: 'line',
      source: 'admin-2',
      filter: ['==', ['get', 'level'], 1],
      // visibility: 'none',
      layout: {
        // "visibility": 'none'
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
        'line-opacity': 0.7,
        // 'line-opacity': [
        //     'case',
        //     ['boolean', ['feature-state', 'hover'], false],
        //     0.6,
        //     0.4
        // ]
      }
    })


    loadImage('./images/pattern(4).png', 'pattern').then(() => {
      // map.addLayer({
      // id: 'admin-2-fill-pattern',
      // type: 'fill',
      // source: 'admin-2',
      // paint: {
      //     'fill-pattern': 'pattern'
      // }
      // })
    })


  })
})

let color = d3.scaleOrdinal(d3.schemeTableau10)



async function loadImage(url, name) {
  map.loadImage(url, (err, image) => {
    if (err) throw err
    map.addImage(name, image)
  })
}



// SETUP POINTS AND SORT OUTPUT LIST 


// map.on('load', () => {
// toggleSidebar('left')
// })

const sidebarArrow = document.querySelector('#arrow')
// console.log(sidebarArrow)
sidebarArrow.addEventListener('click', () => {
  toggleSidebar('left')
})

const sidebarArrowRight = document.querySelector('#arrow.right')

sidebarArrowRight.addEventListener('click', () => {
  toggleSidebar('right')
})

// SETUP LANGUAGE TOOGLER 
chooseLanguage()

// SETUP PROJECTION CHANGE
changeProjection()

// SETUP LAYERS CHANGE

changeLayer()