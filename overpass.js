const fs = require('fs');

async function getCountryPolygon(countryName) {
    try {
        // Query Nominatim API to search for the country
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(countryName)}&polygon_geojson=1&polygon_threshold=0.01&limit=1&email=tomcool@yandex.ru`);
        const data = await response.json();

        // Check if data contains results
        // console.log(data)
        if (data.length > 0) {
            // Extract the OSM ID from the response
            const geojson = data[0].geojson
            return geojson;
        } else {
            console.error(`No data found for country "${countryName}"`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function getRegionPolygon(regionName) {
    try {
        // const response = await fetch(`https://nomination.openstreetmap.org/search?q=${encodeURIComponent(regionName)}&format=json&featureType=state&polygon_geojson=1&polygon_threshold=0.01&limit=1&email=tomcool@yandex.ru`)
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(regionName)}&polygon_geojson=1&polygon_threshold=0.01&limit=1&email=tomcool@yandex.ru&format=geojson`);
        const data = await response.json();

        // console.log(data)

        if (data) {
            // Extract the OSM ID from the response
            const geojson = data.features[0]
            return geojson;
        } else {
            console.error(`No data found for country "${regionName}"`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

module.exports = { getCountryPolygon, getRegionPolygon }

console.log(getRegionPolygon('moscow'))
// getCountryPolygon('spain').then(e => console.log(e))

const countries = ['spain', 'germany', 'france', 'denmark', 'united kingdom', 'russia', 'armenia']

const promises = []
const json = []

countries.forEach((country, index) => {

    // setTimeout(() => {
        // promises.push(getCountryPolygon(country))
    // }, index * 2000)
})

// console.log(promises)

Promise.all(promises).then(data => {
    const jsonString = JSON.stringify(data, null, 2); // The second argument (null) is for the replacer function, and the third argument (2) is for indentation (optional, for better readability)

    // console.log(data)

    // fs.writeFile('result4.json', jsonString, (err) => {
    //     if (err) {
    //         console.error('Error writing JSON to file:', err);
    //     } else {
    //         console.log('JSON object has been written to file successfully.');
    //     }
    // });
})

// Promise.allSettled(promises).then(e => {
    // console.log(promises)
// })




// getCountryOSMID('spain').then( (e) => console.log(e))


// console.log()