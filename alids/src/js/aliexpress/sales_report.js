

(function ($) {
$('.box-daterange').each(function(){
   let d = window.alidsDateRangePicker(this, { lifetime: $('#date-lifetime').val(), date : [$('#date-from').val(), $('#date-to').val()]}, function (date) {

        $('#date-from').val(date[0]);
        $('#date-to').val(date[1]);
        $.event.trigger({
            type: "datepicker:update",
            from: $('#date-from').val(),
            to: $('#date-to').val()
        });
    })

})

})(jQuery);
