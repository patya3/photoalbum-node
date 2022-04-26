$('.modifyButton').on('click', function () {
  let $this = $(this);
  $('#modifyModal #modalImage').attr('src', $this.data('img'));
  $('#modifyModal #id_title').val($this.data('title'));
  $('#modifyModal #id_description').val($this.data('description'));
  $('#modifyModal #id_category>option').each(function (index, element) {
    if (JSON.parse($(element).val()).id == $this.data('category-id').id) {
      $('#modifyModal #id_category').val($(element).val());
      return false;
    }
  });

  const country = $this.data('country-id');
  const countryDefault = new Option(
    country.name,
    JSON.stringify(country),
    true,
    true
  );
  $('#modifyModal #id_country').append(countryDefault).trigger('change');

  const subcountry = $this.data('subcountry-id');
  const subcountryDefault = new Option(
    subcountry.name,
    JSON.stringify(subcountry),
    true,
    true
  );
  $('#modifyModal #id_subcountry').append(subcountryDefault).trigger('change');

  const city = $this.data('city-id');
  const cityDefault = new Option(city.name, JSON.stringify(city), true, true);
  $('#modifyModal #id_city').append(cityDefault).trigger('change');

  let actionPath = $('#modifyForm').attr('action').split('/');
  actionPath[actionPath.length - 1] = $this.data('id');
  $('#modifyForm').attr('action', actionPath.join('/'));
});

$('.deleteButton').on('click', function () {
  let $this = $(this);
  $('#confirmDelete').click(function () {
    $.ajax({
      url: '/images/delete_image/' + $this.data('id'),
      type: 'GET',
      success: function () {
        $('#confirmDeleteModal').modal('toggle');
        $('#successDeleteModal').modal('show');
        setTimeout(function () {
          $('#successDeleteModal').modal('toggle').fadeOut('slow');
        }, 2000);
        $('#listings').load(document.URL + ' #listings');
      },
    });
  });
});
