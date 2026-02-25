mapboxgl.accessToken =
    'pk.eyJ1IjoiZmFyaGFzcyIsImEiOiJjbWwxbWs4aTYwYTNqM2Rwdnh1b2NoaWxqIn0.Qe13DZxRshOkPNEd5cPcww';
let map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom: 3.2, // starting zoom
    minZoom: 4, // minimum zoom level of the map
    center: [-96, 37.5] // starting center
    projection: 'albers'
});
const grades = [4, 5, 6],
    colors = ['rgb(208,209,230)', 'rgb(103,169,207)', 'rgb(1,108,89)'],
    radii = [5, 15, 20];
//load data to the map as new layers.
//map.on('load', function loadingData() {
map.on('load', () => { //simplifying the function statement: arrow with brackets to define a function
    // when loading a geojson, there are two steps
    // add a source of the data and then add the layer out of the source
    map.on('load', () => {
        map.addSource('covid-rates', {
            type: 'json',
            data: 'assets/us-covid-2020-rates.json'
        });
    
        map.addLayer({
            id: 'rates-fill',
            type: 'fill',
            source: 'covid-rates',
            paint: {
              'fill-color': [
                'interpolate',
                ['linear'],
                ['get', 'rates'],
                0, '#f7fbff',
                10, '#c6dbef',
                25, '#6baed6',
                50, '#2171b5',
                100, '#08306b'
              ],
              'fill-opacity': 0.8
            }
        });

        map.addLayer({
            id: 'rates-outline',
            type: 'line',
            source: 'covid-rates',
            paint: { 'line-color': 'rgba(0,0,0,0.25)', 'line-width': 0.5 }
            });
        });
    // click on tree to view magnitude in a popup
    map.on('click', 'earthquakes-point', (event) => {
        new mapboxgl.Popup()
            .setLngLat(event.features[0].geometry.coordinates)
            .setHTML(`<strong>Magnitude:</strong> ${event.features[0].properties.mag}`)
            .addTo(map);
    });
});
// create legend
const legend = document.getElementById('legend');
//set up legend grades and labels
var labels = ['<strong>Magnitude</strong>'],
    vbreak;
//iterate through grades and create a scaled circle and label for each
for (var i = 0; i < grades.length; i++) {
    vbreak = grades[i];
    // you need to manually adjust the radius of each dot on the legend 
    // in order to make sure the legend can be properly referred to the dot on the map.
    dot_radii = 2 * radii[i];
    labels.push(
        '<p class="break"><i class="dot" style="background:' + colors[i] + '; width: ' + dot_radii +
        'px; height: ' +
        dot_radii + 'px; "></i> <span class="dot-label" style="top: ' + dot_radii / 2 + 'px;">' + vbreak +
        '</span></p>');
}
const source =
    '<p style="text-align: right; font-size:10pt">Source: <a href="https://earthquake.usgs.gov/earthquakes/">USGS</a></p>';
legend.innerHTML = labels.join('') + source;