import { map } from "./main.js";
import { defaultPositionMap } from "./main.js"
import { defaultObserverPoint } from "./main.js"

import { loadData } from "./helpers.js";

export async function loadProducers() {
  console.log("hey user, hi!");

  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  });

  function description(feature) {
    const name = feature.properties.name;
    const adress = feature.properties.adress;
    const type = feature.properties.type;

    return `
            <div class="image-container">
            </div>
            <div class="label-container">
              <span>${name}</span>
              <div class="label-container_button">
                <span class="label-container_button-label">Look At</span>
                <span class="label-container_button-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0,0,500,500">
                    <rect fill="#bdade2" x="135" y="135" width="225" height="225" rx="15" transform="rotate(-45 250 250)"/>
                    <g transform="translate(160, 160), scale(0.65)" fill="white" fill-rule="nonzero" stroke="none" stroke-width="10" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(8.53333,8.53333)"><path x="100" y="100" d="M13,3c-5.511,0 -10,4.489 -10,10c0,5.511 4.489,10 10,10c2.39651,0 4.59738,-0.85101 6.32227,-2.26367l5.9707,5.9707c0.25082,0.26124 0.62327,0.36648 0.97371,0.27512c0.35044,-0.09136 0.62411,-0.36503 0.71547,-0.71547c0.09136,-0.35044 -0.01388,-0.72289 -0.27512,-0.97371l-5.9707,-5.9707c1.41266,-1.72488 2.26367,-3.92576 2.26367,-6.32227c0,-5.511 -4.489,-10 -10,-10zM13,5c4.43012,0 8,3.56988 8,8c0,4.43012 -3.56988,8 -8,8c-4.43012,0 -8,-3.56988 -8,-8c0,-4.43012 3.56988,-8 8,-8z"></path></g></g>
                    </svg>
                </span>
              </div>
            </div>
            <div class="description-container">
              <div class="description-container_adress">${
                adress ? adress : "check information from administrator"
              }</div> 
              <div class="description-container_type"> ${type}</div>
            </div>
            <hr>
            <div class="text-container"> Simple text for filling empty space in new popup</div>
    `;
  }

  function normalize(string) {
    return string.trim().toLowerCase();
  }

  function getUniqueFeatures(features, comparatorProperty) {
    const uniqueIds = new Set();
    const uniqueFeatures = [];
    for (const feature of features) {
      const id = feature[comparatorProperty];
      if (!uniqueIds.has(id)) {
        uniqueIds.add(id);
        uniqueFeatures.push(feature);
      }
    }
    return uniqueFeatures;
  }

  function getBoundingBox() {
    const b = {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
    };

    const viewPort = { x: window.innerWidth, y: window.innerHeight };
    const leftSidebar = document.querySelector(".sidebar#left");
    const rightSidebar = document.querySelector(".sidebar#right");

    b.y1 = 0;
    b.y2 = viewPort.y;
    b.x1 = leftSidebar.classList.contains("collapsed") ? 0 : 300;
    b.x2 = rightSidebar.classList.contains("collapsed")
      ? viewPort.x
      : viewPort.x - 300;

    return [
      [b.x1, b.y1],
      [b.x2, b.y2],
    ];
  }

  const listingEl = document.querySelector(".sidebar-content-list.right");

  const filterEl = document.querySelector("#feature-filter");

  let idAnimation = null;

  loadData("producers.json").then((producers) => {
    // console.log(producers);
    // console.log("Say hi!!");

    let quered = [];

    // hookahlocator.5icxs210

    // map.addSource("admin-3", {
    //   type: "geojson",
    //   data: producers,
    //   promoteId: "name",
    // });

    map.addSource("admin-3", {
      type: "vector",
      url: "mapbox://hookahlocator.0khrm9z0",
      promoteId: "name",
    });

    map.addLayer({
      id: "3d-buildings",
      source: "composite",
      "source-layer": "building",
      filter: ["==", "extrude", "true"],
      type: "fill-extrusion",
      minzoom: 15,
      paint: {
        "fill-extrusion-color": "#aaa",

        // use an 'interpolate' expression to add a smooth transition effect to the
        // buildings as the user zooms in
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          15.05,
          ["get", "height"],
        ],
        "fill-extrusion-base": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15,
          0,
          15.05,
          ["get", "min_height"],
        ],
        "fill-extrusion-opacity": 0.6,
      },
    });

    map.addLayer({
      id: "admin-3-producers",
      type: "circle",
      source: "admin-3",
      'source-layer': 'producers',  
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 23, 10],
        "circle-stroke-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          0.5,
          3,
          1,
          23,
          3.5,
        ],
        "circle-color": "blueviolet",
        "circle-stroke-color": "white",
      },
    });

    // console.log("check after new source");

    let source = map.getSource("admin-3");
    if (source) {
      console.log("Source is working");
      console.log(source);
    } else {
      console.log("Source is not working");
    }

    // POPUP

    map.on("mouseenter", "admin-3-producers", (e) => {
      // Change the cursor style as a UI indicator.
      map.getCanvas().style.cursor = "pointer";

      // console.log("enter symbol");

      // Copy coordinates array.
      const coordinates = e.features[0].geometry.coordinates.slice();
      // const description = e.features[0].properties.name;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Populate the popup and set its coordinates
      // based on the feature found.
      popup
        .setLngLat(coordinates)
        .setHTML(description(e.features[0]))
        .addTo(map);

      popupZoom(coordinates);
    });

    map.on("mouseleave", "admin-3-producers", () => {
      map.getCanvas().style.cursor = "";
      popup.remove();
    });

    // LISTING

    map.on("movestart", () => {
      map.setFilter("admin-3-producers", ["has", "name"]);

      filterEl.value = "";

      // reset features filter as the map starts moving
      // map.setFilter('airport', ['has', 'abbrev']);
    });

    map.on("moveend", () => {
      const bbox = getBoundingBox();

      // console.log(bbox)

      const features = map.queryRenderedFeatures(bbox, {
        layers: ["admin-3-producers"],
      });

      // console.log(features);

      if (features) {
        const uFeatures = getUniqueFeatures(features, "id");

        renderListing(uFeatures);
        quered = [...uFeatures];
      }
    });

    filterEl.addEventListener("keyup", (e) => {
      const value = normalize(e.target.value);

      const renderedFeatures = map.queryRenderedFeatures({
        layers: ["admin-3-producers"],
      });

      const features = getUniqueFeatures(renderedFeatures, "id");

      const filtered = [];

      for (const feature of quered) {
        const name = normalize(feature.properties.name);
        // const code = normalize(feature.properties.abbrev);
        if (name.includes(value)) {
          filtered.push(feature);
        }
      }

      if (filtered) {
        map.setFilter("admin-3-producers", [
          "match",
          ["get", "name"],
          filtered.map((feature) => {
            return feature.properties.name;
          }),
          true,
          false,
        ]);
      }

      renderListing(filtered);

      // map.setFilter('producers', ['match', ['get', 'name']])
    });
  });

  function renderListing(data) {
    listingEl.innerHTML = "";

    const features = data.sort((a, b) => a.properties.name > b.properties.name)

    if (features.length == 0) {
      const empty = document.createElement("p");

      empty.classList.add("producer-link_empty");
      empty.textContent = "Empty results";

      listingEl.appendChild(empty);
    } else {
      for (const feature of features) {
        const itemLink = document.createElement("a");
        const label = `${feature.properties.name}`;
        const adress = `${feature.properties.adress}`;

        itemLink.textContent = label;
        itemLink.classList.add("producer-link");

        itemLink.addEventListener("click", () => {
          let bounds = new mapboxgl.LngLatBounds();
          bounds.extend(feature.geometry.coordinates);

          cleanLayers();

          map.flyTo({
            center: feature.geometry.coordinates,
            zoom: 16,
            pitch: 40,
          });

          // setTimeout(() => {
          //   idAnimation = requestAnimationFrame(rotateCamera);
          //   console.log("animation start");
          //   console.log(idAnimation);
          // }, 5000);

          map.once("moveend", () => {
            // map.setCenter(feature.geometry.coordinates);

            // idAnimation = requestAnimationFrame(rotateCamera);
            // idAnimation = requestAnimationFrame(rotateCamera);
            console.log(idAnimation);
          });

          // cancelAnimationFrame(idAnimation)

          setTimeout(() => {
            // console.log("times is over");
            // cancelAnimationFrame(idAnimation);
          }, 15000);
        });

        itemLink.addEventListener("mouseenter", () => {
          // Highlight corresponding feature on the map
          popup
            .setLngLat(feature.geometry.coordinates)
            // .setText(label)
            .setHTML(description(feature))
            .addTo(map);
        });

        itemLink.addEventListener("mouseleave", () => {
          popup.remove();
        });

        listingEl.appendChild(itemLink);
      }
    }

    
    const returnButton = document.createElement("a");
    returnButton.classList.add("producer-link_return");
    returnButton.textContent = "return ⏎";

    returnButton.addEventListener('click', returnToBase)

    listingEl.appendChild(returnButton)
  }

  function popupZoom(coordinates) {
    const button = document.querySelector(".label-container_button");
    button.coordinates = coordinates;

    button.addEventListener("click", clickHandler);
  }

  function rotateCamera(timestamp) {
    map.rotateTo((timestamp / 100) % 360, { duration: 0 });

    idAnimation = requestAnimationFrame(rotateCamera);
  }

  function clickHandler(e) {
    cleanLayers();

    map.flyTo({
      center: e.currentTarget.coordinates,
      zoom: 16,
      pitch: 40,
    });

    console.log(e.target.coordinates);
    console.log(e.currentTarget.coordinates);
  }

  function cleanLayers() {
    map.setLayoutProperty("admin-2-fill-countries", "visibility", "none");
    map.setLayoutProperty("admin-2-fill-regions", "visibility", "none");
    map.setLayoutProperty("admin-2-fill-subregions", "visibility", "none");
  }

  function returnToBase() {
    // map.rotateTo(90, { duration: 1000 });
    defaultPositionMap()

    // map.flyTo({ ...defaultObserverPoint })

    map.setLayoutProperty("admin-2-fill-countries", "visibility", "visible");
    map.setLayoutProperty("admin-2-fill-regions", "visibility", "none");
    map.setLayoutProperty("admin-2-fill-subregions", "visibility", "visible");
  }
}
