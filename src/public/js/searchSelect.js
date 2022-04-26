function searchSelect(selector, url, callback) {
  $(selector).select2({
    minimumInputLength: 3,
    ajax: {
      url: url,
      dataType: 'json',
      delay: 600,
      data: function (params) {
        return {
          name: params.term,
        };
      },
      processResults: callback,
      cache: true,
    },
  });
}
