const fs = require('fs')
const nomination = require('./overpass.js')
// const { json } = require('stream/consumers')

fs.readFile('./resultt.json', 'utf-8', (err, data) => {
  if (err) {
    console.log('reading file is error', err)
  }

  const jsonData = JSON.parse(data)

  const answers = []
  const items = []
  let count = jsonData.array.length
//   let count = 300

  for (let i = 0; i < count; i++) {
    setTimeout(async () => {
      let answer = null
      // console.log(jsonData['array'][i][2])

      let level = null
      let item = jsonData['array'][i]

      if (item[1] === 0) {
        level = 1
      } else {
        let parent = jsonData['array'].find(el => el[0] === item[1])
        // console.log(parent)
        if (parent[1] === 0) {
          level = 2
        } else {
          level = 3
        }
      }

      item.push(level)

    //   console.log(item[2])
    //   console.log(level)

      if (level === 1 || level === 2 || level === 3) {
        console.log(item)
        answer = await nomination.getRegionPolygon(
          jsonData['array'][i][2],
          jsonData['array'][i][3],
          level
        )

        if (answer != null) {
            answers.push(answer)
            items.push(item)
        }
      }
    }, 1000 * i)
  }

//   let promises = answers.push

  setTimeout(() => {
    Promise.all(answers).then(answer => {
      const jsonDataUpdated = []

      answer.forEach((el, index) => {
        let feature = el

        feature.properties.web_id = items[index][0]
        feature.properties.parent_id = items[index][1]
        feature.properties.web_name = items[index][2]
        feature.properties.level = items[index][4]
        feature.properties.iso_parent = items[index][3]

        // console.log(feature)

        jsonDataUpdated.push(feature)
      })

      // console.log(jsonDataUpdated)

      const jsonString = JSON.stringify(answer)

      fs.writeFile('./result9.json', jsonString, err => {
        if (err) {
          console.log('Error writing file', err)
        } else {
          console.log('Data written in file, very good')
        }
      })
    })
  }, 1000 * count)
})
