	console.log("inside js file");

	$('#btnRun').click(function() {

	    $.ajax({
	        url: "php/getCountryInfo.php",
	        type: 'POST',
	        dataType: 'json',
	        data: {
	            country: $('#selCountry').val(),
	            lang: $('#selLanguage').val()
	        },
	        success: function(result) {

	            console.log(JSON.stringify(result));

	            if (result.status.name == "ok") {

	                $('#txtContinent').html(result['data'][0]['continent']);
	                $('#txtCapital').html(result['data'][0]['capital']);
	                $('#txtLanguages').html(result['data'][0]['languages']);
	                $('#txtPopulation').html(result['data'][0]['population']);
	                $('#txtArea').html(result['data'][0]['areaInSqKm']);

	            }

	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	            console.error('AJAX Error:', textStatus, errorThrown);
	        }
	    });

	});

	$('#btnRun1').click(function() {

	    console.log('clicked');

	    $.ajax({
					url: "php/getCountryCode.php",
	        type: 'POST',
	        dataType: 'json',
	        data: {
	            latitude: $('#lat').val(),
	            longitude: $('#lng').val()
	        },
	        success: function(result) {

	            console.log(JSON.stringify(result));

	            if (result.status.name == "ok") {
	                $('#txtCode').text(result.data.countryCode);

	            }

	        },
	        error: function(jqXHR, textStatus, errorThrown) {
	            console.error('AJAX Error:', textStatus, errorThrown);
	        }

	    });

	});


	$('#btnRun2 ').click(function() {
	    console.log('clicked');
	    $.ajax({
	        url: "php/getPostalcodes.php",
	        type: 'POST',
	        dataType: 'json',
	        data: {
	            PostalCode: $('#PostalCode').val(),
	            CountryCodes: $('#CountryCodes').val()
	        },
	        success: function(result) {
	            console.log(JSON.stringify(result));
	            if (result.status.name == "ok") {
	                $('#txtCountryCode').html(result['data'][0]['countryCode']);
	                $('#txtpostCode').html(result['data'][0]['postalCode']);
	                $('#txtplaceName').html(result['data'][0]['placeName']);
	            }
	        },
	        error: function(jqXHR, textStatus, errorThrown) {

	            console.error('AJAX Error:', textStatus, errorThrown);
	        }
	    });
	});


	console.log("inside js file");

	
	$('#btnRun3').click(function() {
		$.ajax({
			url: "php/getNearestAddress.php",
			type: 'POST',
			dataType: 'json',
			data: {
				latitude: $('#NearAddress').val(),
				longitude: $('#streetNo').val()
			},
			success: function(result) {
				console.log(JSON.stringify(result));
	
				if (result.status.code === "200" && result.data) {
					var nearestAddress = result.data;
	
					// Update the HTML elements with street name and street number
					if (nearestAddress.street) {
						$('#txtNearestAddress').text(nearestAddress.street);
					} else {
						$('#txtNearestAddress').text("Street: Not Available");
						console.error('Street property is missing in the response.');
					}
	
					if (nearestAddress.streetNumber) {
						$('#txtstreetNumber').text(nearestAddress.streetNumber);
					} else {
						$('#txtstreetNumber').text("Street Number: Not Available");
						console.error('StreetNumber property is missing in the response.');
					}
				} else {
					console.error('Invalid or missing data in the response.');
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				console.error(`AJAX Error: ${textStatus}`, errorThrown);
				$('#divResults3').html('An error occurred while processing your request.');
			}
		});
	});
	
	