const fs = require('fs')

const nomination = require('./overpass.js');

fs.readFile('./result5.json', 'utf-8', (err, data) => {
    if (err) {
        console.log('Error reading JSON file:', err)
        return;
    }

    const jsonData = JSON.parse(data)

    const answers = []
    const count = jsonData.length
    let line = 0


    for (let i = 0; i < count; i++) {


        jsonData[i].children.forEach((child, index) => {



            console.log(line)

            setTimeout(() => {
                let answer = null
                console.log(child['name'])
                answer = nomination.getRegionPolygon(child['name'])
                answers.push(answer)
                console.log(answer)
            }, line * 1000 + index * 1000)

        })

        line += jsonData[i].children.length
    }

    setTimeout(() => {
        Promise.all(answers).then(answer => {
            console.log(answer)

            const jsonDataUpdated = jsonData.map((item, index) => {
                return {
                    webid: item["webid"],
                    id: item["id"],
                    name: item["name"],
                    children: item["children"],
                    geojson: answer[index]
                }
            })

            const jsonString = JSON.stringify(answer, null, 2)

            fs.writeFile('./result6.json', jsonString, (err) => {
                if (err) {
                    console.error('Error writing JSON to file:', err);
                } else {
                    console.log('JSON object has been written to file successfully.');
                }
            })
        })
    }, line * 1000)


})
