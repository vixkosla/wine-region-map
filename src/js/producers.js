import { map } from '../../main.js'
import { loadData } from './helpers.js'

export async function loadProducers() {

  console.log('hey user, hi!')

  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  const listingEl = document.querySelector('.sidebar-content-list.right')

  loadData('../../producers.json').then(producers => {

    console.log(producers)
    console.log('Say hi!!')

    map.addSource('admin-3', {
      type: 'geojson',
      data: producers
      // promoteId: 'web_id'
    })

    console.log('check after new source')

    let source = map.getSource('admin-3');
    if (source) {
      console.log('Source is working');
      console.log(source)
    } else {
      console.log('Source is not working');
    }

    map.addLayer({
      id: 'admin-3-producers',
      type: 'circle',
      source: 'admin-3',
      // filter: ['==', ['get', 'level'], 3],
      // layout: {
      // visibility: 'none'
      // },
      paint: {
        // 'fill-color': ['get', 'color'],
        // 'fill-opacity-transition': { duration: 3500 },
        // 'fill-color': '#32a852',
        // 'fill-opacity': [
        //   'case',
        //   ['boolean', ['feature-state', 'hover'], false],
        //   0.8,
        //   0.2
        // ]
        'circle-radius': 4,
        'circle-stroke-width': 2,
        'circle-color': 'red',
        'circle-stroke-color': 'white'
      }
    })

    // POPUP



    map.on('mouseenter', 'admin-3-producers', (e) => {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = 'pointer';

      console.log('enter symbol')

      // Copy coordinates array.
      const coordinates = e.features[0].geometry.coordinates.slice();
      const description = e.features[0].properties.name;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Populate the popup and set its coordinates
      // based on the feature found.
      popup.setLngLat(coordinates).setHTML(description).addTo(map);
    });

    map.on('mouseleave', 'admin-3-producers', () => {
      map.getCanvas().style.cursor = '';
      popup.remove();
    });


    // LISTING

    map.on('movestart', () => {
      // reset features filter as the map starts moving
      // map.setFilter('airport', ['has', 'abbrev']);
    });

    map.on('moveend', () => {
      const features = map.queryRenderedFeatures({ layers: ['admin-3-producers'] });

      console.log(features)



      if (features) {
        renderListing(features)

        // elListing = 
        // const uniqueFeatures = getUniqueFeatures(features, 'iata_code');
        // Populate features for the listing overlay.
        // renderListings(uniqueFeatures);

        // Clear the input container
        // filterEl.value = '';

        // Store the current features in sn `airports` variable to
        // later use for filtering on `keyup`.
        // airports = uniqueFeatures;
      }
    });


  });

  function renderListing(features) {
    listingEl.innerHTML = ''

    for (const feature of features) {
      const itemLink = document.createElement('a');
      const label = `${feature.properties.name}`

      itemLink.textContent = label

      itemLink.addEventListener('mouseover', () => {
        // Highlight corresponding feature on the map
        popup
          .setLngLat(feature.geometry.coordinates)
          .setText(label)
          .addTo(map);
      });


      listingEl.appendChild(itemLink)

    }

  }




}