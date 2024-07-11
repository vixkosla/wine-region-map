export async function loadData(filename) {
    let response = await fetch(filename)
    let data = await response.json()
  
    return data
  }