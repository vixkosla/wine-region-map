const fs = require('fs');

// Read data from JSON file
fs.readFile('region.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading JSON file:', err);
        return;
    }

    // Parse JSON data
    const jsonData = JSON.parse(data);

    const countries = jsonData.filter((item) => item['uf_parent'] == 0)
    console.log(countries)

    const countriesList = jsonData.map((item, index) => {
        return [
            // id: index + 1,
            item['id'],
            item['uf_parent'],
            item.uf_name,
            // children: []
        ]
    })

    // const countriesList = countries.map((item, index) => {
    //     return {
    //         id: index + 1,
    //         webid: item['id'],
    //         name: item.uf_name,
    //         children: []
    //     }
    // })

    // countriesList.forEach((country, index)=> {
    //     jsonData.forEach(xml => {
    //         if (xml['uf_parent'] == country.webid)
    //             country.children.push(
    //                 { 
    //                     id: country.children.length + 1,
    //                     webid: xml.id, 
    //                     name: xml['uf_name'],
    //                     children: []
    //                 })
    //     })

    //     jsonData.forEach(xml => {
    //         country.children.forEach((child, index) => {
    //             if (xml['uf_parent'] == child.webid)
    //             child.children.push({
    //                 id: child.children.length + 1,
    //                 webid: xml.id,
    //                 name: xml['uf_name']
    //             })
    //         })
    //     })
    // })

    // Convert JSON object back to a string
    const jsonString = JSON.stringify(countriesList, null, 2); // The second argument (null) is for the replacer function, and the third argument (2) is for indentation (optional, for better readability)

    // Write JSON data to another file
    fs.writeFile('resultt.json', jsonString, (err) => {
        if (err) {
            console.error('Error writing JSON to file:', err);
            return;
        }
        console.log('JSON data has been written to output.json');
    });
});