// import { map } from './main.js'
import { map } from './main.js'
import { mapboxLanguage } from './main.js'
import { control } from './main.js'

const overlayToggle = document.querySelector('.map-overlay')


export function toggleSidebar(id) {
    console.log('start click event')
    const elem = document.getElementById(id);
    // Add or remove the 'collapsed' CSS class from the sidebar element.
    // Returns boolean "true" or "false" whether 'collapsed' is in the class list.
    const collapsed = elem.classList.toggle('collapsed');
    const padding = {};
    // 'id' is 'right' or 'left'. When run at start, this object looks like: '{left: 300}';
    padding[id] = collapsed ? 0 : 300; // 0 if collapsed, 300 px if not. This matches the width of the sidebars in the .sidebar CSS class.
    // Use `map.easeTo()` with a padding option to adjust the map's center accounting for the position of sidebars.
    map.easeTo({
        padding: padding,
        duration: 1000 // In ms. This matches the CSS transition duration property.
    });

    collapsed ? map.addControl(control) : map.removeControl(control)
    collapsed ? overlayToggle.classList.remove('hidden') : overlayToggle.classList.add('hidden')
}


export function chooseLanguage() {
    const languages = ['en', 'fr', 'ru']

    console.log('Hello World')

    const languagesContainer = document.getElementById('languages');

    for (const language of languages) {
        const languageButton = document.createElement('button')
        languageButton.textContent = language

        languageButton.addEventListener( "click" ,() => {
            map.setStyle(mapboxLanguage.setLanguage(map.getStyle(), language));
            // map.setLayoutProperty('country-label', 'text-field', ['get', `name_${language}`])
            // map.setLayoutProperty('state-label', 'text-field', ['get', `name_${language}`])
            // map.setLayoutProperty('town-label', 'text-field', ['get', `name_${language}`])
            // map.setLayoutProperty('water-point-label', 'text-field', ['get', `name_${language}`])
        })

        languagesContainer.appendChild(languageButton)
    }
}

export function changeProjection() {
    // const projections = ['']

    const projection = document.getElementById('projection');

    projection.addEventListener( 'change', (event) => {
        map.setProjection(event.target.value)
        console.log(event.target.value)
    })
}



