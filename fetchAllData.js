const fs = require('fs')
const nomination = require('./overpass.js')
// const { json } = require('stream/consumers')

fs.readFile('./resultt.json', 'utf-8', (err, data) => {
    if (err) {
        console.log('reading file is error', err)
    }

    const jsonData = JSON.parse(data)

    const answers = []
    let count = jsonData.array.length
    // let count = 50

    for (let i = 0; i < count; i++) {
        setTimeout(async () => {

            let answer = null
            console.log(jsonData['array'][i][2])
            answer = await nomination.getRegionPolygon(jsonData["array"][i][2])
            answers.push(answer)

        }, 1000 * i)
    }

    setTimeout(() => {
        Promise.all(answers).then((answer) => {


            const jsonDataUpdated = []

            answer.forEach((item, index) => {
                let feature = item


                feature.properties.web_id = jsonData['array'][index][0]
                feature.properties.parent_id = jsonData['array'][index][1]
                feature.properties.web_name = jsonData['array'][index][2]

                jsonDataUpdated.push(feature)
            })

            console.log(jsonDataUpdated)

            const jsonString = JSON.stringify(answer)

    
            fs.writeFile('./result7.json', jsonString, (err) => {
                if (err) {
                    console.log('Error writing file', err)
                } else {
                    console.log('Data written in file, very good')
                }
            })
        })
    }, 1000 * count)


})