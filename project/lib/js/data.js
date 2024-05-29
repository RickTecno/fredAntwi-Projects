function getCountryData(latitude, longitude) {
    return $.ajax({
        url: `../api/getCountryData.php`,
        method: 'GET',
        data: { lat: latitude, lon: longitude }
    });
}

function getCountryBorders() {
    return $.ajax({
        url: '../resource/countryBorders.geo.json',
        method: 'GET'
    });
}

function getRestCountries() {
    return $.ajax({
        url: '../api/getRestCountries.php',
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
