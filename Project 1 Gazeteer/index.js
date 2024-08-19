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


$(function() {

    if ($('#countries').length) {
        $('#countries').on('change', function() {
            loader('block');
            getCountryInformationOnChange(true)
        });
    }

    $('.close').each(function() {
        $(this).on('click', function() {
            $(this).parent().parent().parent().css('display', 'none');
        });
    });

    if(window.matchMedia('(max-width: 800px)').matches) {
        zoomLevel = 5

    } else if(window.matchMedia('(max-width: 1400px)').matches) {
        zoomLevel = 6
    }
       

    appendSelectCountries();
    setGeolocationFromNavigator();
});

function setGeolocationFromNavigator() {
    loader('block')
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => handleGeolocationSuccess(position),
            error => handleGeolocationError(error)
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
}

function handleGeolocationSuccess(position) {
    const { latitude, longitude } = position.coords;
    if (!map) {
        initializeMap([latitude, longitude]);
    } else {
        map.setView([latitude, longitude], zoomLevel);
    }

    initializeGeoLocation([latitude, longitude]);
    fetchCountryData(latitude, longitude);
}

function handleGeolocationError(error) {
    initializeGeoLocation(regionDefaultCoordinates);
    fetchCountryData(...regionDefaultCoordinates);
}

function initializeGeoLocation(coordinates) {
    if (!map) {
        initializeMap(coordinates);
    } else {
        map.setView(coordinates, zoomLevel);
    }

    getCountryBorders()
    .done(function(data){
        countryBordersLayer = L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                allCountryBorders[feature.properties.iso_a2] = layer;
            }
        });
    })
}

function initializeMap(coordinates) {

    map = L.map('map', {
        center: coordinates,
        zoom: zoomLevel,
        layers: [defaultMap]
    });

    L.easyButton('fa-info-circle', function() {
        openModal('country-info-modal');
    }, 'Country Information').addTo(map);

    L.easyButton('fas fa-cloud-sun', function() {
        openModal('weather-info-modal');
    }, 'Weather Information').addTo(map);

    L.easyButton('fas fa-dollar-sign', function() {
        openModal('currency-info-modal');
    }, 'Currency Information').addTo(map);

    L.easyButton('fas fa-clock', function() {
        openModal('timezone-info-modal');
    }, 'Timezone Information').addTo(map);

    L.easyButton('fab fa-wikipedia-w', function() {
        openModal('wiki-info-modal');
    }, 'Wikipedia Information').addTo(map);

    L.easyButton('fas fa-newspaper', function() {
        openModal('local-news-modal');
    }, 'Local News').addTo(map);

    map.addLayer(markers);
}

function addMarker(lat, lon, capitalCity) {

    lat = parseFloat(lat);
    lon = parseFloat (lon);

    resetMarkers()

    currentMarker = L.marker([lat, lon], { icon: currentPositionIcon }).addTo(map)
    .bindPopup(`Capital City: <strong>${capitalCity}</strong> |  Latitude: ${lat}, Longitude: ${lon}`)
    .openPopup();

    let airport = L.marker([lat + CLUSTER_OFFSET, lon], { icon: airportIcon }).bindPopup('Airport'),
    airports2 = L.marker([lat + CLUSTER_OFFSET + 0.05, lon], { icon: airportIcon }),
    airports3 = L.marker([lat + CLUSTER_OFFSET + 0.03, lon], { icon: airportIcon });

    let city = L.marker([lat - CLUSTER_OFFSET + 0.03, lon], { icon: cityIcon }).bindPopup('City'),
    city2 = L.marker([lat - CLUSTER_OFFSET - 0.05, lon], { icon: cityIcon });

    let university = L.marker([lat, lon + CLUSTER_OFFSET + 0.03], { icon: universityIcon }).bindPopup('University'),
    university2 = L.marker([lat, lon + CLUSTER_OFFSET - 0.009], { icon: universityIcon });

    let stadiumn = L.marker([lat, lon - CLUSTER_OFFSET], { icon: stadiumIcon }).bindPopup('Stadium')

    airportGroup = L.layerGroup([airport, airports2, airports3]);
    cityGroup = L.layerGroup([city, city2]);
    stadiumGroup = L.layerGroup([stadiumn]);
    universityGroup = L.layerGroup([university, university2])

    markers.addLayer(airportGroup)
    markers.addLayer(cityGroup)
    markers.addLayer(universityGroup)
    markers.addLayer(stadiumGroup)
    
    
    const overlayMaps = {
        "Airports": airportGroup,
        "Cities": cityGroup,
        "Universities": universityGroup,
        "Stadiums": stadiumGroup,
    };
        
    layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
    map.addLayer(markers);
}

function appendSelectCountries() {
    getRestCountries()
    .done(function(result) {
        result = JSON.parse(result)
        if (result.countries) {
            const sortedCountries = result.countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
            sortedCountries.forEach(country => {
                const $option = $('<option>', {
                    value: country.capitalInfo.latlng + ',' + country.cca2,
                    text: country.name.common
                });
                $('#countries').append($option);
            });
        }
    })
}

function fetchCountryData(lat, lon) {
    loader('block');

    getCountryData(lat, lon)
    .done(async function(data) {
        data = JSON.parse(data)
        $('#countries').val(`${data.latlng[0]},${data.latlng[1]},${data.countryCode}`);

        if (!autoSetCountry) {
            autoSetCountry = true;
            getCountryInformationOnChange();
        }

        appendCountryModalContents(data);
        fetchWikipediaContent(data.countryName);

        const geoNamesLat = data.latlng[0]
        const geoNamesLng = data.latlng[1]

        resetMarkers();
        initializeGeoLocation([geoNamesLat, geoNamesLng]);
        addMarker(geoNamesLat, geoNamesLng, data.capital);
        resetMapLayers(data.countryCode);

        setTimeout(() => loader('none'), 1000);
    })
}

async function fetchWikipediaContent(countryName) {
    try {
        const data = await getWikipediaContent(countryName);
        if (data) {
            const wikiInformation = `
                <h1 class="font-bold capitalize p-5 text-lg">About ${countryName}</h1>
                <div class="text-sm mb-12 px-5">${data.extract.substr(0, 370)} (...)</div>
                <div class="p-5">
                    <p>Keep Reading: <a class="text-blue-500" href="${data.content_urls.desktop.page}" target="_blank">${data.content_urls.desktop.page.replace('https://', '')}</a></p>
                </div>
            `;
            $('#wiki-info-modal .content').html(wikiInformation);
        } else {
            $('#wiki-info-modal .content').html('<p class="text-sm text-gray-500">No information available</p>');
        }
    } catch (error) {
        console.error('Error fetching Wikipedia content:', error);
        $('#wiki-info-modal .content').html('<p class="text-sm text-gray-500">Unable to load Wikipedia content</p>');
    }
}

async function getCountryInformationOnChange(fetchData=false) {
    const select = $('#countries');
    const [latitude, longitude, countryCode] = select.val().split(',');

    if(fetchData){
        fetchCountryData(latitude, longitude);
    }

    resetMapLayers(countryCode)
}

function resetMapLayers(countryCode) {
    if (countryBordersLayer) {
        map.eachLayer(layer => {
            if (layer.feature) {
                map.removeLayer(layer);
            }
        });

        if (allCountryBorders[countryCode]) {
            const selectedCountryLayer = allCountryBorders[countryCode];
            selectedCountryLayer.addTo(map);

            const countryBounds = selectedCountryLayer.getBounds();
            const center = countryBounds.getCenter();
            map.setView(center, zoomLevel);
        }
    }
}

function resetMarkers() {
    markers.clearLayers();
    layerControl?.remove()
    Array.from(document.querySelector('.leaflet-pane.leaflet-marker-pane').children).forEach( item => item.remove())
    Array.from(document.querySelector('.leaflet-pane.leaflet-shadow-pane').children).forEach( item => item.remove())
}

function appendCountryModalContents(data) {
    const countryInformation = `
    <div class="bg-no-repeat h-[100px] w-full bg-cover mb-5" style="background-image:url('${data.flag}')"></div>
    <div class="flex flex-col divide-y divide-gray-200 ">
        <div class="flex gap-5 items-center py-2">
            <div>
                <h1 class="font-bold text-sm">Country</h1>
                <span class="text-sm text-gray-500">${data.countryName}</span>
            </div>
        </div>
        <div class="flex gap-5 items-center py-2">
            <div>
                <h1 class="font-bold text-sm">Continent</h1>
                <span class="text-sm text-gray-500">${data.countryDataFull.continents[0]}</span>
            </div>
        </div>
        <div class="flex gap-5 items-center py-2">
            <div>
                <h1 class="font-bold text-sm">Capital City</h1>
                <span class="text-sm text-gray-500">${data.capital}</span>
            </div>
        </div>
        <div class="flex gap-5 items-center py-2">
            <div>
                <h1 class="font-bold text-sm">Current Population</h1>
                <span class="text-sm text-gray-500">${data.population}</span>
            </div>
        </div>
        <div class="flex gap-5 items-center py-2">
            <div>
                <h1 class="font-bold text-sm">Currency</h1>
                <span class="text-sm text-gray-500">${data.currencyName} (${data.currencySymbol})</span>
            </div>
        </div>
        <div class="flex gap-5 items-center py-2">
            <div>
                <h1 class="font-bold text-sm">Area</h1>
                <span class="text-sm text-gray-500">${formatAreaToSquareKilometers(data.countryDataFull.area)}</span>
            </div>
        </div>
        <div class="flex gap-5 items-center py-2">
            <div>
                <h1 class="font-bold text-sm">Languages</h1>
                <span class="text-sm text-gray-500">${getLanguagesFromObject(data.countryDataFull.languages)}</span>
            </div>
        </div>
    </div>
    `;
    
    const weatherInfo = data.weatherError ? `
        <div class="flex flex-col gap-5 items-center justify-center p-10 ">
            <span class="material-symbols-outlined text-red-500" style="font-size: 40px">error</span>
            <span class="">${data.weatherError}</span>
        </div>
    ` : `
        <div class="p-5 text-sm font-medium">
            <div class="flex items-start justify-between">
                <span class="font-bold">${data.capital}, <br>${ data.countryName }</span>
                <span class="flex flex-col justify-center items-center">
                    <span class="flex items-end">
                        <img src="${data.currentWeatherIcon}" alt="${data.currentWeather}">
                        <span class="font-semibold text-5xl">${data.currentTemp}<span class="font-normal text-sm">°C</span></span>
                    </span>
                    <span>${data.currentWeather}</span>
                </span>
                <span class="h-full flex flex-col justify-between gap-5">
                    <span>Humidity <br> ${data.humidity}%</span>
                    <span>Wind <br> ${data.windSpeed} kph</span>
                </span>
            </div>
            <div class="flex justify-between items-start gap-3 my-5">
                <div>
                    <div class="font-bold">Morning</div>
                    <span class="flex items-end text-xs">
                        <img src="${data.forecastMorning.icon}" alt="${data.forecastMorning.condition}" class="w-1/2">
                        <span>${data.forecastMorning.temp}°C <br> ${data.forecastMorning.condition}</span>
                    </span>
                </div>
                <div>
                    <div class="font-bold">Afternoon</div>
                    <span class="flex items-end text-xs">
                        <img src="${data.forecastAfternoon.icon}" alt="${data.forecastAfternoon.condition}" class="w-1/2">
                        <span>${data.forecastAfternoon.temp}°C <br> ${data.forecastAfternoon.condition}</span>
                    </span>
                </div>
                <div>
                    <div class="font-bold">Evening</div>
                    <span class="flex items-end text-xs">
                        <img src="${data.forecastEvening.icon}" alt="${data.forecastEvening.condition}" class="w-1/2">
                        <span>${data.forecastEvening.temp}°C <br> ${data.forecastEvening.condition}</span>
                    </span>
                </div>
            </div>
        </div>
    `

    exchangeRates = data.currencyExhangeDataFull.rates;
    const options = Object.keys(exchangeRates).map(item => `<option value="${item}">${item}</option>`).join('')
    const correncyInformation = `
        <div class="flex flex-col gap-3 divide-y py-2">
            <div>
                <h1 class="font-bold text-sm my-2">Amount: ${DEFAULT_BASE_CURRENCY}</h1>
                <div class="flex gap-1">
                    <input type="number" id="from-amount" placeholder="Amount" class="text-black  bg-white !outline-none ring-0 p-2 rounded-sm flex-1">
                </div>
            </div>
            <div class="hidden">
                <h1 class="font-bold text-sm my-2">From - To </h1>
                <div class="flex gap-1">
                    <select id="from-currency" class="bg-white text-black !outlined-none p-2 rounded-sm flex-1">${options}</select>
                    <select id="to-currency" class="bg-white text-black !outlined-none p-2 rounded-sm flex-1">${options}</select>
                </div>
            </div>
            <div>
                <h1 class="font-bold text-sm my-2">Exhange: ${data.currencyCode}</h1>
                <div class="flex gap-1">
                    <input readonly type="number" id="to-amount" placeholder="Exchange" class="text-black  bg-white outline-none ring-0 p-2 rounded-sm flex-1">
                </div>
            </div>
        </div>
        <button onclick="convertCurrency()" hidden class="rounded-sm bg-amber-600 text-white text-sm font-semibold text-center w-full px-5 py-3 mt-5">Convert</button>
    `

    const timezoneinformation = `
    <div class="grid grid-cols-2 gap-5 p-3 bg-white bg-opacity-70">
        <div class="flex gap-5 items-center py-2">
            <span class="rounded-full h-14 w-14 bg-gray-100 flex items-center justify-center">
                <span class="material-symbols-outlined text-gray-500">schedule</span>
            </span>
            <div class="flex-1">
                <h1 class="font-bold text-sm">Time Zone</h1>
                <span class="text-sm text-gray-500">${data.timezoneDataFull.zoneName}</span>
            </div>
        </div>
        <div class="flex gap-5 items-center py-2">
            <span class="rounded-full h-14 w-14 bg-gray-100 flex items-center justify-center">
                <span class="material-symbols-outlined text-gray-500">date_range</span>
            </span>
            <div class="flex-1">
                <h1 class="font-bold text-sm">Current Date</h1>
                <span class="text-sm text-gray-500">${ new Date(data.timezoneDataFull.formatted).toLocaleString()  }</span>
            </div>
        </div>
        <div class="flex gap-5 items-center py-2">
            <span class="rounded-full h-14 w-14 bg-gray-100 flex items-center justify-center">
                <span class="material-symbols-outlined  text-gray-500">sunny</span>
            </span>
            <div class="flex-1">
                <h1 class="font-bold text-sm">Sunrise</h1>
                <span class="text-sm text-gray-500 capitalize">${new Date(data.sunriseDataFull.results.sunrise).toLocaleTimeString() }</span>
            </div>
        </div>
        <div class="flex gap-5 items-center py-2">
            <span class="rounded-full h-14 w-14 bg-gray-100 flex items-center justify-center">
                <span class="material-symbols-outlined  text-gray-500">bedtime</span>
            </span>
            <div class="flex-1">
                <h1 class="font-bold text-sm">Sunset</h1>
                <span class="text-sm text-gray-500 capitalize">${new Date(data.sunriseDataFull.results.sunset).toLocaleTimeString() }</span>
            </div>
        </div>
    </div>
    `
    const newsMap = data.newsData?.results?.map( item => `
        <div class="p-5 py-2 flex flex-col gap-2">
            <div class="flex gap-2">
                <img src="${ item.image_url }" alt="Image" class="w-[40px] h-auto ${ item.image_url ?? 'hidden'}">
                <h4 class="flex-1 font-semibold text-xs">${ item.title }</h4>
            </div>
            <div class="flex flex-row justify-between">
                <span class="text-xs opacity-75"> ${  formatDate( item.pubDate) } </span>
                <a href="${item.link}" class="text-blue-500 text-xs" target="_blank">Read more...</a>
            </div>
        </div>
    `).join('')
    
    const newsInformation = (!(data.newsData?.results?.length)) ? `
        <div class="flex flex-col gap-5 items-center justify-center p-10">
            <span class="material-symbols-outlined text-red-500" style="font-size: 40px">error</span>
            <span class="">
                <h4 class="font-bold">Not available. Try again</h4>
                <p class="text-xs mt-2 text-center">Local news Api failed to respond</p>
            </span>
        </div>
    `:`
    <div class="flex flex-col divide-y  !h-[70vh] overflow-y-auto">${ newsMap }</div>
    `
    $('#country-info-modal .content').html(countryInformation)
    $('#weather-info-modal .content').html(weatherInfo)
    $('#timezone-info-modal .content').html(timezoneinformation)
    $('#local-news-modal .content').html(newsInformation)
    $('#currency-info-modal .content').html(correncyInformation)
    $('#from-currency').val(DEFAULT_BASE_CURRENCY);
    $('#to-currency').val(data.currencyCode);
    $('#from-amount, #from-currency, #to-currency').on('input change', convertCurrency);
}

function _addMarker_(lat, lon) {

    lat = parseFloat(lat);
    lon = parseFloat (lon);

    resetMarkers()

    currentMarker = L.marker([lat, lon], { icon: currentPositionIcon }).addTo(map)
    .bindPopup(`Latitude: ${lat}, Longitude: ${lon}`)
    .openPopup();

    airportMarker = L.marker([lat + CLUSTER_OFFSET, lon], { icon: airportIcon }).addTo(map).bindPopup('Airport');
    cityMarker = L.marker([lat - CLUSTER_OFFSET, lon], { icon: cityIcon }).addTo(map).bindPopup('City');
    universityMarker = L.marker([lat, lon + CLUSTER_OFFSET], { icon: universityIcon }).addTo(map).bindPopup('University');
    stadiumMarker = L.marker([lat, lon - CLUSTER_OFFSET], { icon: stadiumIcon }).addTo(map).bindPopup('Stadium')

    // airportGroup = L.layerGroup([airportMarker])
    // cityGroup = L.layerGroup([cityMarker])
    // universityGroup = L.layerGroup([universityMarker])
    // stadiumGroup = L.layerGroup([stadiumMarker])

    
    layerControl.addOverlay(airportMarker, 'Airports')
    layerControl.addOverlay(cityMarker, 'Cities')
    layerControl.addOverlay(universityMarker, 'Universities')
    layerControl.addOverlay(stadiumMarker, 'Stadiums')

    // markers.addLayer(currentMarker);
    // markers.addLayer(airportMarker);
    // markers.addLayer(universityMarker);
    // markers.addLayer(stadiumMarker);
    // markers.addLayer(cityMarker);
}

//helper functions
function formatAreaToSquareKilometers(area) {
    if (typeof area !== 'number' || isNaN(area)) {
        throw new Error('Input must be a valid number');
    }
    const formattedArea = area.toFixed(2);
    return `${formattedArea} km²`;
}

function convertCurrency() {
    const fromCurrency = $('#from-currency').val();
    const toCurrency = $('#to-currency').val();
    const fromAmount = parseFloat($('#from-amount').val());

    if (isNaN(fromAmount)) {
        $('#to-amount').val('');
        return;
    }

    // Ensure both currencies are selected and exchange rates are available
    if (fromCurrency && toCurrency && exchangeRates[fromCurrency] && exchangeRates[toCurrency]) {
        const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
        const toAmount = (fromAmount * rate).toFixed(2);
        $('#to-amount').val(toAmount);
    } else {
        $('#to-amount').val('');
    }
}

function getLanguagesFromObject(obj) {
    const str = Object.keys(obj).map(item => obj[item]).join(',');
    return str;
}

function openModal(modalId) {
    $(`#${modalId}`).css('display', 'block');
}

function loader(state) {
    $('#spinner-modal').css('display', state);
}

function formatDate(dateString) {
    const date = new Date(dateString);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayName = days[date.getUTCDay()];
    const monthName = months[date.getUTCMonth()];
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();

    return `${dayName}, ${monthName} ${day} ${year}`;
}

// api services
function getCountryData(latitude, longitude) {
    return $.ajax({
        url: `./api/getCountryData.php`,
        method: 'GET',
        data: { lat: latitude, lon: longitude }
    });
}

function getCountryBorders() {
    return $.ajax({
        url: './resource/countryBorders.geo.json',
        method: 'GET'
    });
}

function getRestCountries() {
    return $.ajax({
        url: './api/getRestCountries.php',
        method: 'GET'
    });
}

async function getWikipediaContent(countryName) {
    try {
        const response = await $.ajax({
            url: `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(countryName)}`,
            method: 'GET'
        });
        return response;
    } catch (error) {
        console.error('Error fetching Wikipedia content:', error);
        throw error;
    }
}

function fetchCoordinatesFromGeonames(countryName) {
    const username = 'jobsonokosun'; // Replace with your Geonames username
    const url = `http://api.geonames.org/searchJSON?formatted=true&q=${countryName}&maxRows=1&lang=en&username=${username}&style=full`;

    return $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            if (data.geonames && data.geonames.length > 0) {
                return {
                    lat: data.geonames[0].lat,
                    lng: data.geonames[0].lng
                };
            } else {
                return null;
            }
        },
        error: function(error) {
            console.error('Error fetching coordinates from Geonames:', error);
            return null;
        }
    });
}


