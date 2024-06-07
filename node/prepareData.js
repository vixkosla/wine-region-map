const nomination  = require('./overpass.js');
const fs = require('fs');
const axios = require('axios');

// import {getCountryPolygon} from 'overpass.mjs'

// nomination.getCountryPolygon('spain').then(e => console.log(e, 'yeah'))

async function readData() {
    fs.readFile('./resultt.json', 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return;
        }

        const jsonData = JSON.parse(data);
        console.log(jsonData)

        // console.log(e)
        const countries = jsonData.array.filter((item) => item[1] == 0)
        console.log(countries)
        const countriesList = countries.map((item, index) => {


            return {
                webid: item[0],
                id: index + 1,
                name: item[2],
                children: [],
                geojson: null
            }
        })

        countriesList.forEach(country => {

            nomination.getCountryPolygon(country.name).then((e) => {
                console.log(country.name)
                console.log(e)
                country.geojson = e
            })
        })

        countriesList.forEach(country => {
            jsonData.array.forEach(xml => {
                if (xml[1] == country.webid)
                    country.children.push(
                        {
                            webid: xml[0],
                            id: country.children.length + 1,
                            parentid: country.webid,
                            name: xml[2],
                            children: []
                        })
            })

            jsonData.array.forEach(xml => {
                country.children.forEach(child => {
                    if (xml[1] == child.webid)
                        child.children.push({
                            webid: xml[0],
                            id: child.children.length + 1,
                            parentid: child.webid,
                            name: xml[2]
                        })
                })
            })
        })

        const jsonString = JSON.stringify(countriesList, null, 2); // The second argument (null) is for the replacer function, and the third argument (2) is for indentation (optional, for better readability)

        // Write the JSON string to a file
        fs.writeFile('result2.json', jsonString, (err) => {
            if (err) {
                console.error('Error writing JSON to file:', err);
            } else {
                console.log('JSON object has been written to file successfully.');
            }
        }); 

        console.log(countriesList)

        console.log('promise resolve')
    })
}

async function fetchData() {
    console.log('lopo')

    const response = await fetch("./resultt.json");
    const data = await response.json();
    // console.log(data);

    return data;
}

// const object = fetchData()
readData()

// console.log(object)

// const data = object['array']

// console.log(object)


// const items = data

// items.resolve().then(() => console.log('resolved'))
// console.log(items)


