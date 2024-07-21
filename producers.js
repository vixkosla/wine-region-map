import { map } from "./main.js";
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
              ${name}
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
      x1: 0, y1: 0, x2: 0, y2: 0
    }

    const viewPort = { x: window.innerWidth, y: window.innerHeight };
    const leftSidebar = document.querySelector(".sidebar#left");
    const rightSidebar = document.querySelector(".sidebar#left");

    b.y1 = 0;
    b.y2 = viewPort.y;
    b.x1 = leftSidebar.classList.contains('collapsed') ? 0 : 300
    b.x2 = rightSidebar.classList.contains('collapsed') ? viewPort.x : viewPort.x - 300
    
     

    return [
      [b.x1, b.y1],
      [b.x2, b.y2],
    ];
  }

  const listingEl = document.querySelector(".sidebar-content-list.right");

  const filterEl = document.querySelector("#feature-filter");

  loadData("producers.json").then((producers) => {
    console.log(producers);
    console.log("Say hi!!");

    let quered = [];

    map.addSource("admin-3", {
      type: "geojson",
      data: producers,
      promoteId: "name",
    });

    map.addLayer({
      id: "admin-3-producers",
      type: "circle",
      source: "admin-3",
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

    console.log("check after new source");

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

      console.log("enter symbol");

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

      console.log(bbox)

      const features = map.queryRenderedFeatures(bbox, {
        layers: ["admin-3-producers"],
      });

      console.log(features);

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

  function renderListing(features) {
    listingEl.innerHTML = "";

    if (features.length == 0) {
      const empty = document.createElement("p");

      empty.textContent = "Empty results";
      listingEl.appendChild(empty);
    } else {
      for (const feature of features) {
        const itemLink = document.createElement("a");
        const label = `${feature.properties.name}`;
        const adress = `${feature.properties.adress}`;

        itemLink.textContent = label;
        itemLink.classList.add("producer-link");

        // itemLink.addEventListener('onclick', clickHandler)

        itemLink.addEventListener("mouseover", () => {
          // Highlight corresponding feature on the map
          popup
            .setLngLat(feature.geometry.coordinates)
            // .setText(label)
            .setHTML(description(feature))
            .addTo(map);
        });

        listingEl.appendChild(itemLink);
      }
    }
  }

  // function clickHandler(e) {
  //   console.log(e.target)
  // }
}
