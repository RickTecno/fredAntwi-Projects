let map;
let currentMarker = null;
let airportMarker;
let cityMarker;
let universityMarker;
let stadiumMarker;
let countryBordersLayer;
let allCountryBorders = {};
let autoSetCountry = false;
let zoomLevel = 7;
let exchangeRates = {};
const mapBoxToken = 'pk.eyJ1Ijoiam9ic29ub2tvc3VuIiwiYSI6ImNsd21zZHd0dDFwYW4ya285Zm42OHBjMXgifQ._SlaQjOxmOaMyV4wn13pnw'
const DEFAULT_BASE_CURRENCY = 'USD'
const CLUSTER_OFFSET = 0.05;
const regionDefaultCoordinates = [54.0, -2.0]
let markers = L.markerClusterGroup();
let layerControl;


const defaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});

const streetMap = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${mapBoxToken}`, {
    attribution: 'Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    zoomOffset: -1
});

const satelliteMap = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${mapBoxToken}`, {
    attribution: 'Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    zoomOffset: -1
});

const outdoorsMap = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/{z}/{x}/{y}?access_token=${mapBoxToken}`, {
    attribution: 'Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    zoomOffset: -1
});

const darkMap = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=${mapBoxToken}`, {
    attribution: 'Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
    tileSize: 512,
    zoomOffset: -1
});

const airportIcon = L.ExtraMarkers.icon({
    icon: 'fa-plane',
    markerColor: 'blue',
    shape: 'circle',
    prefix: 'fa'
});

const cityIcon = L.ExtraMarkers.icon({
    icon: 'fa-city',
    markerColor: 'green',
    shape: 'circle',
    prefix: 'fa'
});

const universityIcon = L.ExtraMarkers.icon({
    icon: 'fa-university',
    markerColor: 'red',
    shape: 'circle',
    prefix: 'fa'
});

const stadiumIcon = L.ExtraMarkers.icon({
    icon: 'fa-futbol',
    markerColor: 'yellow',
    shape: 'circle',
    prefix: 'fa'
});

const currentPositionIcon = L.ExtraMarkers.icon({
    icon: 'fa-star',
    markerColor: 'orange-dark',
    shape: 'star',
    prefix: 'fa'
});

const baseMaps = {
    "Default Map": defaultMap,
    "Street Map": streetMap,
    "Satellite Map": satelliteMap,
    "Outdoors Map": outdoorsMap,
    "Dark Map": darkMap
};

