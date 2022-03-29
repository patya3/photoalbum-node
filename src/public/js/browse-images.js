var countryID = $('#country').val();
var countyID = $('#county').val();
var cityID = $('#city').val();

$('#country').change( () => {
    countryID = $('#country').val();
    console.log(countryID)
    if (countryID != 20) {
        $('#county').attr('disabled', true);
    } else {
        $('#county').attr('disabled', false);
    }
    $('#city>option').each( function() {
        if ($(this).data('country-id') != countryID && $(this).val() != -1) {
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
        if ($(this).data('county-id') != countyID && $(this).val() != -1) {
            $(this).css("display","none");
            $(this).attr("disabled", true);
        } else {
            $(this).css("display","block");
            $(this).attr("disabled", false);
        }
    });
});


lc_lightbox('.elem', {
    wrap_class: 'lcl_fade_oc',
    gallery : true, 
    thumb_attr: 'data-lcl-thumb', 
    skin: 'dark',
    // more options here
});

$(function() { 
    $('.list-group-item').on('click', function() {
        $('.fas', this)
        .toggleClass('fa-chevron-right')
        .toggleClass('fa-chevron-down');
    });
});