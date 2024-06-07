const nomination = require('./overpass.js');
const fs = require('fs');


fs.readFile('./result2.json', 'utf-8', (err, data) => {
    if (err) {
        console.error('Error reading JSON file:', err);
        return;
    }

    const jsonData = JSON.parse(data);
    // console.log(jsonData)


    // Write the JSON string to a file
    // console.log(nomination.getCountryPolygon('russia').then(e => console.log(e)) )

    const answers = []
    // const dataAnswers = []

    jsonData.forEach((country, index) => {

        // console.log(country.name, index)

        // setTimeout(() => {
        // const answer = nomination.getCountryPolygon(country.name)
        // if (answer) {
        // console.log(answer)

        // answers.push(answer)
        // }
        // }, 100)


    })

    // let intervalID = setInterval(() => {
    //     const res = await fetch(`https://jsonplaceholder.typicode.com/posts`);
    // }, 2000);

    // if (condition) {
    //     clearInterval(intervalID); // Stop the interval if the condition holds true
    // }

    let count = jsonData.length

    for (let i = 0; i < count; i++) {
        setTimeout(async () => {
            console.log(jsonData[i]['name'])
            let answer = null
            answer = nomination.getCountryPolygon(jsonData[i].name)
            answers.push(answer)
            console.log(answer)
        }, 1000 * i)
        


        // nomination.getCountryPolygon(jsonData[i]['name']).then(e => console.log(e)) 
    }

    // console.log(answers)

    setTimeout(() => {


        Promise.all(answers).then(answer => {
            // jsonData.map(country => {
            // country.geojson = answer
            // })


            // console.log(answer)
            // dataAnswers.push(answer)
            const jsonDataUpdated = jsonData.map((item, index) => {
                

                return {
                    webid: item["webid"],
                    id: item["id"],
                    name: item["name"],
                    children: item["children"],
                    geojson: answer[index]
                }
            })

            const jsonString = JSON.stringify(jsonDataUpdated, null, 2); // The second argument (null) is for the replacer function, and the third argument (2) is for indentation (optional, for better readability)


            fs.writeFile('result5.json', jsonString, (err) => {
                if (err) {
                    console.error('Error writing JSON to file:', err);
                } else {
                    console.log('JSON object has been written to file successfully.');
                }
            });



        })
    }, count * 1000)


    // console.log(dataAnswers)





})