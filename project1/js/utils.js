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
        $('#to-amount').val('');
        return;
    }

    // Ensure both currencies are selected and exchange rates are available
    if (fromCurrency && toCurrency && exchangeRates[fromCurrency] && exchangeRates[toCurrency]) {
        const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
        const toAmount = (fromAmount * rate).toFixed(2);
        $('#to-amount').val(toAmount);
    } else {
        $('#to-amount').val('');
    }
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

function formatDate(dateString) {
    const date = new Date(dateString);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayName = days[date.getUTCDay()];
    const monthName = months[date.getUTCMonth()];
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();

    return `${dayName}, ${monthName} ${day} ${year}`;
}