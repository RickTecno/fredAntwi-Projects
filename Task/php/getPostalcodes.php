<?php
    // remove for production
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $url = 'http://api.geonames.org/findNearbyPostalCodesJSON?formatted=true&postalcode=' . $_REQUEST['PostalCode'] . '&country=' . $_REQUEST['CountryCodes'] . '&radius=10&username=fantwi100&style=full';

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);
    
    $result = curl_exec($ch);
    
    if ($result === false) {
        $output['status']['code'] = "500";
        $output['status']['name'] = "Internal Server Error";
        $output['status']['description'] = "Error fetching data from the API";
    } else {
        $decode = json_decode($result, true);
    
        if (json_last_error() == JSON_ERROR_NONE) {
            $output['status']['code'] = "200";
            $output['status']['name'] = "ok";
            $output['status']['description'] = "success";
            $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
            $output['data'] = $decode['postalCodes'];
        } else {
            $output['status']['code'] = "400";
            $output['status']['name'] = "Bad Request";
            $output['status']['description'] = "Invalid or unexpected data in the API response";
        }
    
        // Log additional information for debugging
        $output['debug']['json_last_error'] = json_last_error();
        $output['debug']['decoded_data'] = $decode;
    }
    
    header('Content-Type: application/json; charset=UTF-8');
    
    echo json_encode($output);
    