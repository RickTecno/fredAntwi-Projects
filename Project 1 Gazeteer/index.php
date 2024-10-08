<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gazetteer</title>

    <link rel="stylesheet" href="./index.css">
    <link rel="stylesheet" href="./vendor/leaflet/dist/leaflet.css">
    <link rel="stylesheet" href="./vendor/leaflet-easybutton/src/easy-button.css">
    <link rel="stylesheet" href="./vendor/leaflet-extra-markers/leaflet.extra-markers.min.css">
    <link rel="stylesheet" href="./vendor/marker-cluster/markercluster.default.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

</head>
<body class="w-full h-screen overflow-hidden">
    
    <div class="h-screen w-full relative z-10">
        <div id="map" class="w-full h-full"></div>
    </div>

    <div class="w-[50%] max-w-[200px] lg:w-[80%] lg:max-w-[800px] z-20 p-3 flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 top-0">
        <select id="countries" class="form-select shadow-sm !outline-none p-2 max-w-[200px]" name="countries"></select> 
    </div>

    <div id="country-info-modal" class="modal">
        <div class="modal-content">
            <div class="w-full lg:w-[500px] overflow-hidden bg-white bg-opacity-90">
                <span class="close">&times;</span>
                <div class="bg-slate-700 text-white text-center p-3">Country Information</div>
                <div class="content p-5"></div>
            </div>
        </div>
    </div>

    <div id="weather-info-modal" class="modal">
        <div class="modal-content">
            <div class="w-full lg:w-[500px] overflow-hidden bg-white bg-opacity-90">
                <span class="close">&times;</span>
                <div class="bg-slate-700 text-white text-center p-3">Weather Forecast</div>
                <div class="content"></div>
            </div>
        </div>
    </div>

    <div id="currency-info-modal" class="modal">
        <div class="modal-content">
            <div class="w-full lg:w-[500px] overflow-hidden bg-white bg-opacity-90">
                <span class="close">&times;</span>
                <div class="bg-slate-700 text-white text-center p-3">Currency Calculator</div>
                <div class="content p-5"></div>
            </div>
        </div>
    </div>

    <div id="timezone-info-modal" class="modal">
        <div class="modal-content">
            <div class="w-full lg:w-[500px] overflow-hidden bg-white bg-opacity-90">
                <span class="close">&times;</span>
                <div class="bg-slate-700 text-white text-center p-3">Time Zone Information </div>
                <div class="content"></div>
            </div>
        </div>
    </div>

    <div id="wiki-info-modal" class="modal">
        <div class="modal-content">
            <div class="w-full lg:w-[500px] overflow-hidden bg-white bg-opacity-90">
                <span class="close">&times;</span>
                <div class="bg-slate-700 text-white text-center p-3">Wikipedia Information </div>
                <div class="content"></div>
            </div>
        </div>
    </div>

    <div id="local-news-modal" class="modal">
        <div class="modal-content">
            <div class="w-full lg:w-[500px] overflow-hidden bg-white bg-opacity-90">
                <span class="close">&times;</span>
                <div class="bg-slate-700 text-white text-center p-3">Today's Headlines</div>
                <div class="content"></div>
            </div>
        </div>
    </div>

    <div id="spinner-modal" class="modal-spinner">
        <div class="modal-content">
            <div class="flex items-center justify-center w-full flex-col gap-1 p-3">
                <img class="loader "src="./images/loader.gif" alt="Walking loader">
                <span class="text-xs mt-2">Loading...</span>
            </div>
        </div>
    </div>

    <script src="./vendor/leaflet/dist/leaflet.js"></script>
    <script src="./vendor/leaflet-easybutton/src/easy-button.js"></script>
    <script src="./vendor/leaflet-extra-markers/leaflet.extra-markers.min.js"></script>
    <script src="./vendor/marker-cluster/leaflet.markercluster.js"></script>
    <script src="./vendor/jquery/dist/jquery.min.js"></script>
    <script src="./index.js"></script>
</body>
</html>
