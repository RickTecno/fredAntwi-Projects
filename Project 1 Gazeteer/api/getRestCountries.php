<?php 
    function countries() {
        $jsonFile = '../resource/restCountries.json';
        $response = file_get_contents($jsonFile);
        $countryDataResponse = json_decode($response, true);
        return $countryDataResponse;
    }
    
    $countryList = countries();
    echo json_encode(['countries' => $countryList]);
?>