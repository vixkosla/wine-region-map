const axios = require('axios');

async function getCountryPolygon(countryName) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(countryName)}&format=json&polygon_geojson=1`)
        console.log(response.data)
        console.log('CORRECT')
    } catch (error) {
        console.log('Error fetch polygon data', error)
    }
}

getCountryPolygon('spain')



// console.log()