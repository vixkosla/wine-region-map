const fs = require('fs')

fs.readFile('./data/manufactures.json', 'utf-8', (err, data) => {
    if (err) {
        console.log('reading file is error', err)
    }

    const jsonData = JSON.parse(data)

    const items = []

    console.log(jsonData)

    jsonData.forEach(item => {
        const coordinates = item.Coordinates.replace(/\[|\]/g, '').split(',')
        const xy = coordinates.map(coordinate => +coordinate).reverse()

        items.push({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": xy
            },
            "properties": {
                "name": item.Name,
                "type": item.Type,
                "adress": item.Adress
            }
        })
    })

    const geojson = {
        "type" : "FeatureCollection",
        "features" : items
    }

    const jsonString = JSON.stringify(geojson)

    fs.writeFile('./producers.json', jsonString, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('There is no error, data written to the file, congrat!')
        }
    })
})