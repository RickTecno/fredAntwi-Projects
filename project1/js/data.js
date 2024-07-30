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