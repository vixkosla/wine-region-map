mapboxgl.accessToken = 'pk.eyJ1IjoiaG9va2FobG9jYXRvciIsImEiOiI5WnJEQTBBIn0.DrAlI7fhFaYr2RcrWWocgw';

const map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    // style: "mapbox://styles/hookahlocator/clsox9viv009f01pk1mf40pwu",
    // style: "mapbox://styles/mapbox/satellite-streets-v12",
    style: "mapbox://styles/mapbox/dark-v10",

    // style: "mapbox://styles/hookahlocator/clsumxbp8002g01pihdv4290g",
    center: [2.2932, 48.86069], // starting position [lng, lat]
    zoom: 15.1, // starting zoom
    // pitch: 62, // starting pitch
    // bearing: -20 // starting bearing,
    //            maxBounds: bounds
});

map.on('style.load', () => {
    // map.setConfigProperty('basemap', 'lightPreset', 'dusk');
});

map.on('style.load', () => {
    map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
    });
    // add the DEM source as a terrain layer with exaggerated height
    // map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
});

let color = d3.scaleOrdinal(d3.schemeTableau10)

async function loadData() {
    let response = await fetch('./test4.geojson')
    let data = await response.json()

    return data
}

loadData().then(data => {

    let features = data.features.map((feature, i) => {
        // feature.properties.admin_level == '6'
        feature.properties['id'] = i;
        feature.properties['color'] = color(feature.properties.id)
        return feature
    })

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
        filter: ['==', ['get', 'admin_level'], 6],
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