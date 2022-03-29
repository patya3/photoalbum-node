var countryID = $('#country').val();
var countyID = $('#county').val();
var cityID = $('#city').val();

$('#country').change( () => {
    countryID = $('#country').val();
    if (countryID != 20) {
        $('#county').attr('disabled', true);
    } else {
        $('#county').attr('disabled', false);
    }
    $('#city>option').each( function() {
        if ($(this).data('country-id') != countryID) {
            $(this).css("display","none");
            $(this).attr("disabled", true);
        } else {
            $(this).css("display","block");
            $(this).attr("disabled", false);
        }
    });
});

$('#county').change(() => {
    countyID = $('#county').val();
    $('#city>option').each(function() {
        if ($(this).data('county-id') != countyID) {
            $(this).css("display","none");
            $(this).attr("disabled", true);
        } else {
            $(this).css("display","block");
            $(this).attr("disabled", false);
        }
    });
});