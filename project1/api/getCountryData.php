<?php
$lat = $_GET['lat'];
$lon = $_GET['lon'];

function fetchUrl($url) {
    $output = file_get_contents($url);

    if ($output === FALSE) {
        die('Error fetching data');
    }

    return $output;
}

// Fetch country information from OpenCage
$openCageApiKey = 'd306077bac5c4cbcae564dd1fb6bbf42';
$openCageUrl = "https://api.opencagedata.com/geocode/v1/json?q=$lat+$lon&key=$openCageApiKey";
$openCageResponse = fetchUrl($openCageUrl);
$openCageData = json_decode($openCageResponse, true);
$countryCode = strtoupper($openCageData['results'][0]['components']['country_code']);
$countryName = $openCageData['results'][0]['components']['country'];

function getCountryData($countryCode) {

    $jsonFile = '../resource/restCountries.json';
    $response = file_get_contents($jsonFile);

    $countryDataResponse = json_decode($response, true);

    if ($countryDataResponse === NULL) {
        return null;
    }

    foreach ($countryDataResponse as $country) {
        if (strtoupper($country['cca2']) === $countryCode) {
            return $country;
        }
    }

    return null;
}

$countryData = getCountryData($countryCode);


// Fetch GeoNames data
$geoNamesUsername = 'jobsonokosun'; 
$encodedCountryName = urlencode($countryName);
$geoNamesUrl = "http://api.geonames.org/searchJSON?formatted=true&q=$encodedCountryName&maxRows=1&lang=en&username=$geoNamesUsername&style=full";
$geoNamesResponse = fetchUrl($geoNamesUrl);
$geoNamesData = json_decode($geoNamesResponse, true);
$geoNamesLat = $geoNamesData['geonames'][0]['lat'];
$geoNamesLng = $geoNamesData['geonames'][0]['lng'];


// Fetch weather information from WeatherAPI.com
$weatherApiKey = '8cb6f0edce1b425c816231315242107'; 
$weatherUrl = "http://api.weatherapi.com/v1/forecast.json?key=$weatherApiKey&q=$lat,$lon&days=1";
$weatherResponse = fetchUrl($weatherUrl);
$weatherData = $weatherResponse ? json_decode($weatherResponse, true) : null;



$currentWeather = $weatherData['current'] ?? null;
$forecast = $weatherData['forecast']['forecastday'][0] ?? null;
$forecastMorning = $forecast['hour'][6] ?? null; // 6 AM
$forecastAfternoon = $forecast['hour'][12] ?? null; // 12 PM
$forecastEvening = $forecast['hour'][18] ?? null;  // 6 PM

// Fetch exchange rate information
$openExchangeApiKey = '109cf71d8ab9435d9e47673a31952ac7';
$openExchangeUrl = "https://openexchangerates.org/api/latest.json?app_id=$openExchangeApiKey";
$openExchangeResponse = fetchUrl($openExchangeUrl);
$openExchangeData = json_decode($openExchangeResponse, true);

$currencyCode = array_keys($countryData['currencies'])[0];
$exchangeRate = $openExchangeData['rates'][$currencyCode];


// fetch Timezone data 
$timezoneDbApiKey = 'KZ95YA2M5HL3';
$timezoneDbUrl = "http://api.timezonedb.com/v2.1/get-time-zone?key=$timezoneDbApiKey&format=json&by=position&lat=$lat&lng=$lon";
$timezoneDbResponse = fetchUrl($timezoneDbUrl);
$timezoneData = json_decode($timezoneDbResponse);

// fetch Timezone data 
$sunriseUrl = "https://api.sunrise-sunset.org/json?lat=$lat&lng=$lon&formatted=0";
$sunriseResponse = fetchUrl($sunriseUrl);
$sunriseData = json_decode($sunriseResponse);

// Fetch local news from Newsdata.io
$newsApiKey = 'pub_49106efea1e860359460a974354b68da28a8f'; 
$newsUrl = "https://newsdata.io/api/1/news?apikey=$newsApiKey&country=" . strtolower($countryCode);
$newsResponse = fetchUrl($newsUrl);
$newsData = $newsResponse ? json_decode($newsResponse, true) : null;



$response = [
    'countryName' => $countryName,
    'flag' => $countryData['flags']['png'],
    'capital' => $countryData['capital'][0],
    'population' => number_format($countryData['population']),
    'currencyName' => $countryData['currencies'][$currencyCode]['name'],
    'currencySymbol' => $countryData['currencies'][$currencyCode]['symbol'],
    'exchangeRate' => $exchangeRate,
    'currencyCode' => $currencyCode,
    "countryCode" => $countryCode,
    "latlng" => $countryData['capitalInfo']['latlng'],
    "geoNamesLat" => $geoNamesLat,
    "geoNamesLng" => $geoNamesLng,
    "countryDataFull" => $countryData,
    "currencyExhangeDataFull" => $openExchangeData,
    "timezoneDataFull" => $timezoneData,
    "sunriseDataFull" => $sunriseData,
    "weatherForecastDataFull" => $weatherData,
    'newsData' => $newsData
];

if ($weatherData) {
    $response['currentWeather'] = $currentWeather['condition']['text'];
    $response['currentTemp'] = $currentWeather['temp_c'];
    $response['currentWeatherIcon'] = $currentWeather['condition']['icon'];
    $response['windSpeed'] = $currentWeather['wind_kph'];
    $response['humidity'] = $currentWeather['humidity'];
    $response['forecastMorning'] = [
        'temp' => $forecastMorning['temp_c'],
        'condition' => $forecastMorning['condition']['text'],
        'icon' => $forecastMorning['condition']['icon']
    ];
    $response['forecastAfternoon'] = [
        'temp' => $forecastAfternoon['temp_c'],
        'condition' => $forecastAfternoon['condition']['text'],
        'icon' => $forecastAfternoon['condition']['icon']
    ];
    $response['forecastEvening'] = [
        'temp' => $forecastEvening['temp_c'],
        'condition' => $forecastEvening['condition']['text'],
        'icon' => $forecastEvening['condition']['icon']
    ];
} else {
    $response['weatherError'] = '<h4 class="font-bold">Not available. Try again</h4><p class="text-xs mt-2 text-center">Weather Api failed to respond</p>';
}

echo json_encode($response);
