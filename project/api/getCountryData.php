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
        die('Error decoding JSON');
    }

    foreach ($countryDataResponse as $country) {
        if (strtoupper($country['cca2']) === $countryCode) {
            return $country;
        }
    }

    die('Country data not found');
}

$countryData = getCountryData($countryCode);

// Fetch weather information
$openWeatherApiKey = '2f720e51f5355e66f37546f2f49119ef';
$openWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?lat=$lat&lon=$lon&appid=$openWeatherApiKey";
$openWeatherResponse = fetchUrl($openWeatherUrl);
$openWeatherData = json_decode($openWeatherResponse, true);
$weather = $openWeatherData['weather'][0]['description'];
$weatherIcon = $openWeatherData['weather'][0]['icon'];

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

$response = json_encode([
    'countryName' => $countryName,
    'flag' => $countryData['flags']['png'],
    'capital' => $countryData['capital'][0],
    'population' => number_format($countryData['population']),
    'currencyName' => $countryData['currencies'][$currencyCode]['name'],
    'currencySymbol' => $countryData['currencies'][$currencyCode]['symbol'],
    'exchangeRate' => $exchangeRate,
    'weather' => $weather,
    "countryCode" => $countryCode,
    "latlng" => $countryData['capitalInfo']['latlng'],
    "countryDataFull" => $countryData,
    "weatherDataFull" => $openWeatherData,
    "currencyExhangeDataFull" => $openExchangeData,
    "timezoneDataFull" => $timezoneData,
    "sunriseDataFull" => $sunriseData
]);

echo $response;
