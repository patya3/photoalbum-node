$('.modifyButton').on('click', function () {
    let $this = $(this);
    $('#modifyModal #modalImage').attr('src', $this.data('img'));
    $('#modifyModal #id_name').val($this.data('name'));
    $('#modifyModal #id_description').val($this.data('description'));
    $('#modifyModal #id_category>option').each(function (index, element) {
        if (parseInt($(element).val()) == parseInt($this.data('category-id'))) {
            $('#modifyModal #id_category').val($(element).val());
            return false;
        }
    });
    $('#modifyModal #id_city>option').each(function name(index, element) {
        if (parseInt($(element).val()) == parseInt($this.data('city-id'))) {
            $('#modifyModal #id_city').val($(element).val());
            return false;
        }
    });

    let actionPath = $('#modifyForm').attr('action').split('/');
    actionPath[actionPath.length-1] = $this.data('id');
    $('#modifyForm').attr('action', actionPath.join('/'));
});

$('.deleteButton').on('click', function () {
    let $this = $(this)
    $('#confirmDelete').click(function () {
        $.ajax({
            url: '/images/delete_image/' + $this.data('id'),
            type: 'GET',
            success: function () {
                $('#confirmDeleteModal').modal('toggle');
                $('#successDeleteModal').modal('show');
                setTimeout(function() {
                    $('#successDeleteModal').modal('toggle').fadeOut('slow');
                }, 2000);
                $('#listings').load(document.URL + ' #listings');
            }
        }); 
    });
    
});