let map;
let currentMarker;
let countryBordersLayer;
let allCountryBorders = {}; 
let autoSetCountry = false;
let zoomLevel = 7;
let exchangeRates = {};
const mapBoxToken = 'pk.eyJ1Ijoiam9ic29ub2tvc3VuIiwiYSI6ImNsd21zZHd0dDFwYW4ya285Zm42OHBjMXgifQ._SlaQjOxmOaMyV4wn13pnw'

function formatAreaToSquareKilometers(area) {
    if (typeof area !== 'number' || isNaN(area)) {
        throw new Error('Input must be a valid number');
    }
    const formattedArea = area.toFixed(2);
    return `${formattedArea} km²`;
}

function convertCurrency() {
    const fromCurrency = $('#from-currency').val();
    const toCurrency = $('#to-currency').val();
    const fromAmount = parseFloat($('#from-amount').val());

    if (isNaN(fromAmount)) {
        alert('Please enter a valid amount.');
        return;
    }

    const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
    const toAmount = (fromAmount * rate).toFixed(2);

    $('#to-amount').val(toAmount);
}


function getLanguagesFromObject(obj) {
    const str = Object.keys(obj).map(item => obj[item]).join(',');
    return str;
}


function openModal(modalId) {
    $(`#${modalId}`).css('display', 'block');
}

function loader(state) {
    $('#spinner-modal').css('display', state);
}
