<?php

// Remove for production
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

// Check if latitude and longitude are set
if(isset($_POST['latitude']) && isset($_POST['longitude'])) {
    $latitude = $_POST['latitude'];
    $longitude = $_POST['longitude'];

    $url= 'http://api.geonames.org/findNearestAddressJSON?formatted=true&lat=' . $latitude . '&lng=' . $longitude . '&username=fantwi100&style=full';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL, $url);

    $result = curl_exec($ch);
    curl_close($ch);

    $decode = json_decode($result, true);

    // Check if address data exists in the response
    if(isset($decode['address'])) {
        $address = $decode['address'];
        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['status']['description'] = "success";
        $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
        $output['data'] = array(
            'street' => $address['street'],
            'streetNumber' => $address['streetNumber']
        );
    } else {
        $output['status']['code'] = "400";
        $output['status']['name'] = "error";
        $output['status']['description'] = "No address data found";
        $output['data'] = null;
    }
} else {
    $output['status']['code'] = "400";
    $output['status']['name'] = "error";
    $output['status']['description'] = "Latitude and longitude are required";
    $output['data'] = null;
}

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output); 

?>

