// Default region coordinates if location is not allowed;
const regionDefaultCoordinates = [54.0, -2.0]

// Jquery start function if script is properly downloaded and loaded
$(function() {

    if ($('#countries').length) {
        $('#countries').on('change', getCountryInformationOnChange);
    }

    $('.close').each(function() {
        $(this).on('click', function() {
            $(this).parent().parent().parent().css('display', 'none');
        });
    });

    // Reduce zoom level for PC and smaller devices
    if(window.matchMedia('(max-width: 800px)').matches) {
        zoomLevel = 5

    } else if(window.matchMedia('(max-width: 1400px)').matches) {
        zoomLevel = 6
    }

    appendSelectCountries();
    setGeolocationFromNavigator();
});

// Request location from user, we expect success or rejection
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

// If user location request is successfull, initialize map or set map if it already exist
function handleGeolocationSuccess(position) {
    const { latitude, longitude } = position.coords;
    if (!map) {
        initializeMap([latitude, longitude]);
    } else {
        map.setView([latitude, longitude], zoomLevel);
    }

    initializeGeoLocation(regionDefaultCoordinates);
    addMarker(latitude, longitude);
    fetchCountryData(latitude, longitude);
}

// If user location is rejected, we initialize our map with our default region coordinates
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

    addMarker(...coordinates);

    getCountryBorders()
    .done(function(data){
        countryBordersLayer = L.geoJson(data, {
            onEachFeature: function (feature, layer) {
                allCountryBorders[feature.properties.iso_a2] = layer;
            }
        });
    })
}

// Map initialization with different layers.
// layers include default, street, satellite, outdoor, darkmap etc
// also add leafleat easy-buttons to help us switch between a selected country information modals 
function initializeMap(coordinates) {
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

    map = L.map('map', {
        center: coordinates,
        zoom: zoomLevel,
        layers: [defaultMap] 
    });

    const baseMaps = {
        "Default Map": defaultMap,
        "Street Map": streetMap,
        "Satellite Map": satelliteMap,
        "Outdoors Map": outdoorsMap,
        "Dark Map": darkMap
    };

    L.control.layers(baseMaps).addTo(map);

    // Add EasyButtons for modal popups
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
}

// Marker
// Add a pin location icon to map to show the capital city of the selected country
function addMarker(lat, lon) {
    const redIcon = L.icon({
        iconUrl: 'https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    currentMarker = L.marker([lat, lon], { icon: redIcon }).addTo(map)
        .bindPopup(`Latitude: ${lat}, Longitude: ${lon}`)
        .openPopup();
}

// Fetches and append our iso countires from the restcountries api to our map
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

// When a user geo location is known, or a country is selected from the options, we pull all country's information from our api
// information from api includes, country data, currency, weather, wikipedia, timezone data etc
// appendCountryModalContents function inject respective information into thier respective modals
function fetchCountryData(lat, lon) {
    loader('block');

    getCountryData(lat, lon)
    .done(function(data) {
        data = JSON.parse(data)
        $('#countries').val(`${data.latlng[0]},${data.latlng[1]},${data.countryCode}`);

        if (!autoSetCountry) {
            autoSetCountry = true;
            getCountryInformationOnChange();
        }

        appendCountryModalContents(data);
        exchangeRates = data.currencyExhangeDataFull.rates;
        fetchWikipediaContent(data.countryName);
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

// Triggered when a user selects a country from the country select box
// We pull the respective country data and re-initialize the map
async function getCountryInformationOnChange() {
    const select = $('#countries');
    const [latitude, longitude, countryCode] = select.val().split(',');
    fetchCountryData(latitude, longitude);
    initializeGeoLocation([latitude, longitude]);

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

    loader('none');
}

// Inject respective information into thier respective modals
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
    $('#country-info-modal .content').html(countryInformation)

    const weatherInformation = `
    <div class="bg-center bg-no-repeat h-[100px] w-full bg-cover mb-5 bg-green-200" style="background-size: 150px; background-image:url('https://openweathermap.org/img/wn/${data.weatherDataFull.weather[0].icon}@2x.png')"></div>
    <div class="flex flex-col divide-y divide-gray-200 p-5">
        <div class="flex gap-5 items-center py-2">
            <div>
                <h1 class="font-bold text-sm">Main</h1>
                <span class="text-sm text-gray-500">${data.weatherDataFull.weather[0].main}</span>
            </div>
        </div>
        <div class="flex gap-5 items-center py-2">
            <div>
                <h1 class="font-bold text-sm">Weather</h1>
                <span class="text-sm text-gray-500">${data.weatherDataFull.weather[0].description}</span>
            </div>
        </div>
        <div class="flex gap-5 items-center py-2">
            <div>
                <h1 class="font-bold text-sm">Temperature</h1>
                <span class="text-sm text-gray-500">${data.weatherDataFull.main.temp} °C</span>
            </div>
        </div>
        <div class="flex gap-5 items-center py-2">
            <div>
                <h1 class="font-bold text-sm">Wind Speed</h1>
                <span class="text-sm text-gray-500">${data.weatherDataFull.wind.speed} m/s</span>
            </div>
        </div>
    </div>`;
    $('#weather-info-modal .content').html(weatherInformation)

    const options = Object.keys(exchangeRates).map(item => `<option value="${item}">${item}</option>`).join('')
    const correncyInformation = `
        <div class="flex flex-col gap-3 divide-y py-2">
            <div>
                <h1 class="font-bold text-sm">Amount: </h1>
                <div class="flex gap-1">
                    <input type="number" id="from-amount" placeholder="Amount" class="text-black  bg-white !outlined-none ring-0 p-2 rounded-sm flex-1">
                </div>
            </div>
            <div>
                <h1 class="font-bold text-sm">From - To </h1>
                <div class="flex gap-1">
                    <select id="from-currency" class="bg-white text-black !outlined-none p-2 rounded-sm flex-1">${options}</select>
                    <select id="to-currency" class="bg-white text-black !outlined-none p-2 rounded-sm flex-1">${options}</select>
                </div>
            </div>
            <div>
                <h1 class="font-bold text-sm"></h1>
                <div class="flex gap-1">
                    <input readonly type="number" id="to-amount" placeholder="Exchange" class="text-black  bg-white !outlined-none ring-0 p-2 rounded-sm flex-1">
                </div>
            </div>
        </div>
        <button onclick="convertCurrency()" class="rounded-sm bg-amber-600 text-white text-sm font-semibold text-center w-full px-5 py-3 mt-5">Convert</button>
    `
    $('#currency-info-modal .content').html(correncyInformation)

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
    $('#timezone-info-modal .content').html(timezoneinformation)
}

