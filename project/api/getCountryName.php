<?php
// getCountryName.php

// Simulate a delay for demonstration purposes
sleep(1);

// Load the country borders data from the JSON file
$jsonFilePath = '../resource/countryBorders.geo.json';
$countryBordersData = file_get_contents($jsonFilePath);

// Decode the JSON data
$countryBorders = json_decode($countryBordersData, true);

// Check if decoding was successful
if ($countryBorders === null) {
    echo json_encode(array("status" => array("name" => "error"), "message" => "Failed to decode JSON data"));
    exit;
}

// Extract the relevant data from the JSON, assuming it has a structure similar to the provided JavaScript code
$countries = array_map(function ($country) {
    return array("iso_a2" => $country['properties']['iso_a2'], "name" => $country['properties']['name']);
}, $countryBorders['features']);

// Sort the countries alphabetically by name
usort($countries, function ($a, $b) {
    return strcasecmp($a['name'], $b['name']);
});

// Return the data as JSON
echo json_encode(array("status" => array("name" => "ok"), "data" => $countries));
?>