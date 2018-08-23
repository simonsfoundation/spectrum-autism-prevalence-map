
$(document).ready(function (){

    $('.study_row').click(function(){
        const chevron_icon = $(this).find('.fas');
        if (chevron_icon.hasClass('fa-chevron-down')) {
            chevron_icon.removeClass('fa-chevron-down');
            chevron_icon.addClass('fa-chevron-up');
        } else {
            chevron_icon.removeClass('fa-chevron-up');
            chevron_icon.addClass('fa-chevron-down');
        }
    });

});
