const fs = require('fs')

async function getCountryPolygon (countryName) {
  try {
    // Query Nominatim API to search for the country
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        countryName
      )}&polygon_geojson=1&polygon_threshold=0.01&limit=1&email=tomcool@yandex.ru`
    )
    const data = await response.json()

    // Check if data contains results
    // console.log(data)
    if (data.length > 0) {
      // Extract the OSM ID from the response
      const geojson = data[0].geojson
      return geojson
    } else {
      console.error(`No data found for country "${countryName}"`)
      return null
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    return null
  }
}

async function getRegionPolygon (regionName, iso, level) {
  try {
    let url = null

    // console.log(regionName, iso, level)

    switch (level) {
      case 1:
        url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          regionName
        )}&namedetails=1&polygon_geojson=1&polygon_threshold=0.01&limit=1&email=tomcool@yandex.ru&format=geojson&featureType=country`
        break;
      case 2:
        url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          regionName
        )}&namedetails=1&featureType=state&countrycodes=${encodeURIComponent(
          iso
        )}&polygon_geojson=1&polygon_threshold=0.005&limit=1&email=tomcool@yandex.ru&format=geojson`

        break;
      case 3:
        url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          regionName
        )}&countrycodes=${encodeURIComponent(
          iso
        )}&namedetails=1&polygon_geojson=1&polygon_threshold=0.001&limit=1&email=tomcool@yandex.ru&format=geojson&featureType=settleme`
        break;
    }
    // const response = await fetch(`https://nomination.openstreetmap.org/search?q=${encodeURIComponent(regionName)}&format=json&featureType=state&polygon_geojson=1&polygon_threshold=0.01&limit=1&email=tomcool@yandex.ru`)
    // console.log(url)
    // console.log(level)
    const response = await fetch(url)
    const data = await response.json()

    // console.log(data)

    if (data.features.length > 0) {
      // Extract the OSM ID from the response
      const geojson = data.features[0]
      return geojson
    } else {
      console.error(`No data found for country "${regionName}, ${level}"`)
      // return {
      //   type: 'Feature',
      //   properties: {}
      // }
      return null
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    return {
      type: 'Feature',
      properties: {}
    }
  }
}

module.exports = { getCountryPolygon, getRegionPolygon }

// console.log(getRegionPolygon('moscow'))
// getCountryPolygon('spain').then(e => console.log(e))

const countries = [
  'spain',
  'germany',
  'france',
  'denmark',
  'united kingdom',
  'russia',
  'armenia'
]

const promises = []
const json = []

countries.forEach((country, index) => {
  // setTimeout(() => {
  // promises.push(getCountryPolygon(country))
  // }, index * 2000)
})

// console.log(promises)

Promise.all(promises).then(data => {
  const jsonString = JSON.stringify(data, null, 2) // The second argument (null) is for the replacer function, and the third argument (2) is for indentation (optional, for better readability)

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
