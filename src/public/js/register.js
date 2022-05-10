var country = $('#country');
var subcountry = $('#subcountry');
var city = $('#city');

country.change(() => {
  subcountry.prop('disabled', false);
});

subcountry.change(() => {
  city.prop('disabled', false);
});

city.prop('disabled', true);
subcountry.prop('disabled', true);
