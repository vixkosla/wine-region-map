// import {getCountryOSMID} from './overpass.js'
import {toggleSidebar} from './sidebar.js'


mapboxgl.accessToken = 'pk.eyJ1IjoiaG9va2FobG9jYXRvciIsImEiOiI5WnJEQTBBIn0.DrAlI7fhFaYr2RcrWWocgw';

export const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    // style: "mapbox://styles/hookahlocator/clsox9viv009f01pk1mf40pwu",
    // style: "mapbox://styles/mapbox/satellite-streets-v12",
    style: "mapbox://styles/mapbox/dark-v10?optimize=true",

    // style: "mapbox://styles/hookahlocator/clsumxbp8002g01pihdv4290g",
    center: [-9.1963944,
        38.4093151], // starting position [lng, lat]
    zoom: 4.1, // starting zoom
    // pitch: 62, // starting pitch
    // bearing: -20 // starting bearing,
    //            maxBounds: bounds
});

map.on('style.load', () => {
    // map.setConfigProperty('basemap', 'lightPreset', 'dusk');
});

map.on('style.load', () => {
    // map.addSource('mapbox-dem', {
    //     'type': 'raster-dem',
    //     'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
    //     'tileSize': 512,
    //     'maxzoom': 14
    // });
    // add the DEM source as a terrain layer with exaggerated height
    // map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
});

let color = d3.scaleOrdinal(d3.schemeTableau10)

async function loadData(filename) {
    let response = await fetch(filename)
    let data = await response.json()

    return data
}

loadData('./result5.json').then(data => {
        let features = data.map((item, i) => {
            
            let feature = turf.multiPolygon(item.geojson.coordinates)
            feature.properties['id'] = i;
            feature.properties['color'] = color(i)

            return feature
        })

        const polygons = {
            type: 'FeatureCollection',
            features: features
        }

        map.addSource('admin-2-countries', {
            type: 'geojson',
            data: polygons,
            generateId: true
        })

        // map.addLayer({
        //     id: 'admin-2-fill-country',
        //     type: 'fill',
        //     source: 'admin-2-countries',
        //     // filter: ['==', ['get', 'admin_level'], 6],
        //     paint: {
        //         'fill-color': ['get', 'color'],
        //         'fill-opacity': [
        //             'case',
        //             ['boolean', ['feature-state', 'hover'], false],
        //             0.6,
        //             0.3
        //         ]
        //     }
        // })

})

loadData('./result7.json').then(data => {

    console.log(data)
    
    let features = []

    data.forEach((item, i) => {
        if (item != null) {
            // let feature = turf.multiPolygon(item.coordinates)
            let feature = item
            feature.properties['id'] = i;
            feature.properties['color'] = color(i)
    
            features.push(feature)
        } 
    })


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

    const polygons = {
        type: 'FeatureCollection',
        features: features
    }

    console.log(polygons)

    map.addSource('admin-2', {
        type: 'geojson',
        data: polygons,
        generateId: true
    })

    map.addLayer({
        id: 'admin-2-fill',
        type: 'fill',
        source: 'admin-2',
        // filter: ['==', ['get', 'admin_level'], 6],
        paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.6,
                0.3
            ]
        }
    })


})



map.on('load', () => {
    toggleSidebar('left');
});

const sidebarArrow = document.querySelector('#arrow')
sidebarArrow.addEventListener('onclick', toggleSidebar('left'))


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