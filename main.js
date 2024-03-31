// import {getCountryOSMID} from './overpass.js'
import { toggleSidebar } from './sidebar.js'

mapboxgl.accessToken =
  'pk.eyJ1IjoiaG9va2FobG9jYXRvciIsImEiOiI5WnJEQTBBIn0.DrAlI7fhFaYr2RcrWWocgw'

const defaultObserverPoint = {
  center: [-9.1963944, 38.4093151],
  zoom: 1.1
}

export const map = new mapboxgl.Map({
  container: 'map',
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  // style: "mapbox://styles/hookahlocator/clsox9viv009f01pk1mf40pwu",
  style: 'mapbox://styles/mapbox/satellite-streets-v9',
  // style: "mapbox://styles/mapbox/dark-v10?optimize=true",
  // style: "mapbox://styles/hookahlocator/clg82vae6008501mpb46y0kwc?optimize=true",

  // style: "mapbox://styles/hookahlocator/clsumxbp8002g01pihdv4290g",
  center: [-9.1963944, 38.4093151], // starting position [lng, lat]
  zoom: 1.1 // starting zoom
  // pitch: 62, // starting pitch
  // bearing: -20 // starting bearing,
  //            maxBounds: bounds
})

map.on('style.load', () => {
  // map.setConfigProperty('basemap', 'lightPreset', 'dusk');
})

map.on('style.load', () => {
  // map.addSource('mapbox-dem', {
  //     'type': 'raster-dem',
  //     'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
  //     'tileSize': 512,
  //     'maxzoom': 14
  // });
  // add the DEM source as a terrain layer with exaggerated height
  // map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
})

let color = d3.scaleOrdinal(d3.schemeTableau10)

async function loadData (filename) {
  let response = await fetch(filename)
  let data = await response.json()

  return data
}

async function loadImage (url, name) {
  map.loadImage(url, (err, image) => {
    if (err) throw err
    map.addImage(name, image)
  })
}

function addMapboxHoverListener () {
  let idHoveredPolygon = null

  map.on('mousemove', 'admin-2-fill-regions', e => {
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

  map.on('mouseleave', 'admin-2-fill-regions', e => {
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
    .sort((a, b) => a.properties.web_name > b.properties.web_name)
  console.log(countries)

  const menu = document.querySelector('#sidebar-content-list')

  const ul = document.createElement('ul')
  ul.classList.add('rounded-rect')
  ul.classList.add('countries')

  for (let country of countries) {
    const li = document.createElement('li')

    li.textContent = country.properties.web_name
    li.classList.add('non-active')
    li.classList.add('country')

    li.onclick = function (e) {

      
      const regions = data.filter(
        item => country.properties.web_id == item.properties.parent_id
      )

      console.log(regions)

      if (regions.length > 0) {
        map.setLayoutProperty('admin-2-line-regions', 'visibility', 'visible')
        map.setLayoutProperty('admin-2-fill-regions', 'visibility', 'visible')

        if (li.classList.contains('active')) {
          if (
            li.childNodes[1] &&
            li.childNodes[1].classList.contains('visible')
          ) {
            console.log(li.childNodes[1])
            li.childNodes[1].style.display = 'none'
            li.childNodes[1].classList.replace('visible', 'non-visible')

            console.log('non-visible')
          }

          li.classList.replace('active', 'non-active')
          map.setFilter('admin-2-fill-countries', ['==', ['get', 'parent_id'], 0])
          map.setFilter('admin-2-line-countries', ['==', ['get', 'parent_id'], 0])

          console.log('already')
        } else if (li.classList.contains('non-active')) {
          map.fitBounds(country.bbox, {
            padding: 20
          })

          changeSourceData(data, country.properties.web_id)

          console.log('not yet')
          li.classList.replace('non-active', 'active')

          console.log(li.childNodes[1])

          if (
            li.childNodes[1] &&
            li.childNodes[1].classList.contains('non-visible')
          ) {
            li.childNodes[1].style.display = 'block'
            li.childNodes[1].classList.replace('non-visible', 'visible')

            console.log('visible')
          } else {
            const ulRegion = document.createElement('ul')
            ulRegion.classList.add('visible')
            ulRegion.classList.add('regions')

            for (let region of regions) {
              const liRegion = document.createElement('li')
              liRegion.textContent = region.properties.web_name
              liRegion.classList.add('non-active')
              liRegion.classList.add('region')

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

                    // changeSourceData(data, region.properties.web_id)

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

                          map.fitBounds(subRegion.bbox, {
                            padding: 20
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

                  // changeSourceData(data, region.properties.web_id)
                }
              }

              ulRegion.appendChild(liRegion)
            }

            li.appendChild(ulRegion)
          }
        }
      } else {
        map.fitBounds(country.bbox, {
          padding: 20
        })

        changeSourceData(data, country.properties.web_id)
      }
    }

    ul.appendChild(li)
  }

  menu.appendChild(ul)

  // let features = data.map((item, i) => {
  //     let feature = turf.multiPolygon(item.geojson.coordinates)
  //     feature.properties['id'] = i;
  //     feature.properties['color'] = color(i)

  //     return feature
  // })

  // let features = data.features.map((feature, i) => {
  //     // feature.properties.admin_level == '6'
  //     feature.properties['id'] = i;
  //     feature.properties['color'] = color(i)
  //     return feature
  // })

  // let feature = data.features.filter(feature => feature.properties.admin_level == 4)

  addMapboxHoverListener()

  let lastIdContainer = null

  function defaultPositionMap() {
    map.setFilter('admin-2-fill-countries', ['==', ['get', 'parent_id'], 0])
    map.setFilter('admin-2-line-countries', ['==', ['get', 'parent_id'], 0])

    map.setLayoutProperty('admin-2-line-regions', 'visibility', 'none')
    map.setLayoutProperty('admin-2-fill-regions', 'visibility', 'none')

    map.flyTo({...defaultObserverPoint})

    map.setPaintProperty('admin-2-fill-countries', 'fill-opacity', 0.4)
  }

  function changeSourceData (data, id) {
    let features = []
    // let currentId = id

    features = data.filter(
      item => item.properties.web_id == id || item.properties.parent_id == id
    )

    // map.getSource('admin-2').setData({
    //     "type": "FeatureCollection",
    //     "features": features
    // })

    if (lastIdContainer === id) {
      defaultPositionMap()
    } else {
      if (features.length > 0) {
        map.setFilter('admin-2-fill-regions', ['==', ['get', 'parent_id'], id])
        map.setFilter('admin-2-line-regions', ['==', ['get', 'parent_id'], id])
      }
  
      map.setFilter('admin-2-fill-countries', ['==', ['get', 'web_id'], id])
      map.setFilter('admin-2-line-countries', ['==', ['get', 'web_id'], id])
  
      map.setPaintProperty('admin-2-fill-countries', 'fill-opacity', 0.05)
    }



    lastIdContainer = id

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

  // map.addLayer({
  //     id: 'admin-2-fill',
  //     type: 'fill',
  //     // source: 'admin-2',
  //     filter: ['!=', ['get', 'parent_id'], 0],
  //     paint: {
  //         'fill-color': ['get', 'color'],
  //         'fill-opacity': [
  //             'case',
  //             ['boolean', ['feature-state', 'hover'], false],
  //             0.6,
  //             0.1
  //         ]
  //     }
  // })

  map.addLayer({
    id: 'admin-2-fill-regions',
    type: 'fill',
    source: 'admin-2',
    filter: ['!=', ['get', 'parent_id'], 0],
    layout: {
      visibility: 'none'
    },
    paint: {
      // 'fill-color': ['get', 'color'],
      'fill-opacity-transition': { duration: 5500 },
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
    filter: ['!=', ['get', 'parent_id'], 0],
    // visibility: 'none',
    layout: {
      visibility: 'none'
    },
    paint: {
      // 'line-color': ['get', 'color'],
      'line-color': '#BDADE2',
      'line-width': 1,
      // "line-gap-width" : 1,

      //   'line-join': 'round',
      //   'line-cap': 'round',
      //   "line-round-limit" :50,
      // "line-emissive-strength": 0.01,
      'line-blur': 1,
      // 'line-offset':
      // 'line-outline-width': 1,
      // 'line-outline-color': 'yellow',
      // "line-gap-width ": 1,
      'line-dasharray': [4, 1]
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
    filter: ['==', ['get', 'parent_id'], 0],
    paint: {
      // 'fill-color': ['get', 'color'],
      'fill-opacity-transition': { duration: 5500 },
      'fill-color': '#B94560',
      // 'fill-opacity': [
      //     'case',
      //     ['boolean', ['feature-state', 'hover'], false],
      //     0.6,
      //     1
      // ],
      'fill-opacity': 0.4
      // "fill-emissive-strength": 0.1
    }
  })

  map.addLayer({
    id: 'admin-2-line-countries',
    type: 'line',
    source: 'admin-2',
    filter: ['==', ['get', 'parent_id'], 0],
    // visibility: 'none',
    layout: {
      // "visibility": 'none'
    },
    paint: {
      // 'line-color': ['get', 'color'],
      'line-color': '#B94560',
      'line-width': 1.5,
      'line-gap-width': 1

      // 'line-join': 'round',
      // "line-round-limit" : 10,
      // "line-emissive-strength": 0.01,
      // 'line-blur': 5.9,
      // 'line-offset':
      // 'line-cap': 'butt',
      // 'line-outline-width': 1,
      // 'line-outline-color': 'yellow',
      // "line-gap-width ": 1,
      // 'line-dasharray': [10, 1],
      // 'line-opacity': 1
      // 'line-opacity': [
      //     'case',
      //     ['boolean', ['feature-state', 'hover'], false],
      //     0.6,
      //     0.4
      // ]
    }
  })

  // map.addLayer({
  //     id: 'admin-2-line-states',
  //     type: 'line',
  //     // source: 'admin-2',
  //     filter: ['==', ['get', 'addresstype'], 'state'],
  //     paint: {
  //         // 'line-color': ['get', 'color'],
  //         // 'line-color': '#B94560',
  //         'line-width': 2,
  //         'line-dasharray': [20, 1],
  //         'line-opacity': 0.5
  //         // 'line-opacity': [
  //         //     'case',
  //         //     ['boolean', ['feature-state', 'hover'], false],
  //         //     0.6,
  //         //     0.5
  //         // ]
  //     }
  // })
})

map.on('load', () => {
  toggleSidebar('left')
})

const sidebarArrow = document.querySelector('#arrow')
// console.log(sidebarArrow)
sidebarArrow.addEventListener('click', () => {
  toggleSidebar('left')
})
// console.log(sidebarArrow)

// // Example usage
// const countryName = 'Germany';
// getCountryOSMID(countryName)
//     .then(geojson => {
//         if (geojson) {
//             console.log(`The geojson for ${countryName} is:`, geojson);

//             const feature = turf.multiPolygon(geojson.coordinates)

//             const polygons = {
//                 type: 'FeatureCollection',
//                 features: feature
//             }

//             console.log(polygons)

//             map.addSource('admin-2-germany', {
//                 type: 'geojson',
//                 data: feature,
//                 generateId: true
//             })

//             map.addLayer({
//                 id: 'admin-2-fill-germany',
//                 type: 'fill',
//                 source: 'admin-2-germany',
//                 // filter: ['==', ['get', 'admin_level'], 6],
//                 paint: {
//                     'fill-color': '#03fdfe',
//                     'fill-opacity': [
//                         'case',
//                         ['boolean', ['feature-state', 'hover'], false],
//                         0.6,
//                         0.3
//                     ]
//                 }
//             })

//         } else {
//             console.log(`Could not find OSM ID for ${countryName}`);
//         }
//     })
//     .catch(error => console.error('Error:', error));
