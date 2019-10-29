$(document).ready(function (){

    d3.json("https://www.spectrumnews.org/wp-json/wp/v2/pages/62361").then(function(data) {
        var form = $("#wp-content").html();
        var content = data.content.rendered;
        content = content.replace('<div id="end-row"></div>', '');
        $("#wp-content").prepend(content);
        if(window.location.hash) {
            location.hash = window.location.hash;
        }
        fixSidebarElements();
    });

    // Fixed elements on scroll
    function fixSidebarElements() {

        var marginFromNav = 85;
        if ( $(window).width() < 1140 ) marginFromNav = 0;
        var scrollPosition = $(document).scrollTop();

        // Deep Dive

        if ( $('.sidebar-container').length ) {

            var chaptersTop = ( $(document).scrollTop() + marginFromNav );
            if ( $(window).width() < 1140 ) chaptersTop = chaptersTop + $('aside.sidebar').height();

            var chaptersPosition = $('#content-container').offset().top;
            if ( $(window).width() < 1140 ) chaptersPosition = chaptersPosition - $('aside.sidebar').height() - 24;

            var endPoint = $('#end-row').offset().top - ( $('.chapter-navigation').height() + marginFromNav);

            // Fix chapter nav
            if (scrollPosition >= endPoint ) {
                var position = 'relative';
                if ( $(window).width() < 1140 ) position = 'fixed';
                $('aside.sidebar').css({
                    'position': position,
                    'left': '0px',
                    'top': ( endPoint + marginFromNav + $('#main-nav .main-bar').outerHeight() ) - chaptersPosition + 'px',
                });
            } else if ( scrollPosition < endPoint) {
                $('aside.sidebar').css({
                    'position': 'fixed',
                    'left': $('.sidebar-container .row').offset().left + 'px',
                    'top': marginFromNav + $('#main-nav .main-bar').outerHeight() + 'px',
                });

                if ( $(window).width() < 1140 ) $('aside.sidebar').css('width', $('.sidebar-container .row').width() +'px' );
            } else {
                var position = 'relative';
                if ( $(window).width() < 1140 ) position = 'fixed';
                $('aside.sidebar').css({
                    'position': position,
                    'left': '0px',
                    'top': '0px',
                });
            }

            // Select current chapter
            $('.chapter-start').each(function() {
                // Chapter selection

                var chapterIndex = parseInt( $(this).attr('id') );
                var chapterPlusOne  = chapterIndex + 1;
                if ( chapterPlusOne > $('.chapter-start').length ) chapterPlusOne = $('.chapter-start').length;

                if ( ( chaptersTop >= $(this).offset().top && chaptersTop < $('.chapter-start#' + chapterPlusOne + '' ).offset().top ) || chaptersTop >= $(this).offset().top && chapterIndex == chapterPlusOne ) {

                    if( chapterIndex == 5 ) console.log( 'greater' );

                    $('.chapter-link a[href="#' + chapterIndex + '"]').addClass('active');

                    // Animate to selected chapter on mobile
                    if ( $(window).width() < 1140 ) {
                        $('.chapter-navigation').css('top', '-' + $('.chapter-link').last().outerHeight() * (chapterIndex-1) + 'px');
                    }

                } else if ( chaptersTop < $('.chapter-start').first().offset().top ) {

                    if( chapterIndex == 5 ) console.log( 'less than' );
                    // Make first chapter active when above nav
                    $('.chapter-link a[href="#1"]').addClass('active');

                } else {
                    $('.chapter-link a[href="#' + chapterIndex + '"]').removeClass('active');
                }

                // Progress bar

                var chapterEnd;
                if ( chapterIndex === chapterPlusOne )
                    chapterEnd = endPoint;
                else
                    chapterEnd = $('.chapter-start#' + chapterPlusOne + '').offset().top;

                var progress = ( ( chaptersTop - $(this).offset().top ) / ( chapterEnd - $(this).offset().top ) ) * 100;
                if( chapterIndex === 5 ) {
                    console.log(chaptersTop - $(this).offset().top, chapterEnd - $(this).offset().top );
                    console.log(progress);
                }
                if ( progress < 0 )
                    progress = 0;
                else if ( progress > 100 )
                    progress = 100;

                if ( $(window).width() >= 1140 ) {
                    $('.chapter-link a[href="#' + chapterIndex + '"] .progress').css({
                        'height': progress + '%',
                        'width': '5px',
                    });
                } else {
                    $('.chapter-link a[href="#' + chapterIndex + '"] .progress').css({
                        'width': progress + '%',
                        'height': '5px',
                    });
                }
            });
        }
    }

    $('.chapter-link a').first().addClass('active');

    $(window).on('resize', function() {
        fixSidebarElements();
    });

    // Desktop positioning on scroll
    $(document).on('scroll', function() {
        fixSidebarElements();
    });

    // DD / About chapter dropdown

    $('aside.sidebar').click(function(e) {

        if ( $(window).width() <= 1140 ) {

            $('aside.sidebar').toggleClass('toggled');

             if ( $(document).scrollTop() < $('#content-container').offset().top - $('#main-nav .main-bar').height() )
                $('html,body').animate({ 'scrollTop': $('#content-container').offset().top + $('.part-of-special-report').height() - $('#main-nav .main-bar').height()}, 300);

        }

    });

    // On page achor scrolling
    $('a[href*="#"]:not([href="#"])').click(function() {
        if ( !$(this).hasClass('post-edit-link') && location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {

            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');

            if ( $(window).width() >= 1140 ) {
                $('html,body').animate({
                    scrollTop: target.offset().top - 100
                }, 800);
                return false;
            } else if ( $(this).parent().hasClass('chapter-link') == false && $(this).hasClass('guest') == false ) {
                $('html,body').animate({
                    scrollTop: target.offset().top - 100
                }, 800);
                return false;
            } else {
                return false;
            }
        }
    });

    if (location.hash) {
      setTimeout(function() {

        window.scrollTo(0, 0);
        var target = $(location.hash);

        if (target.length) {
            $('html,body').animate({
                scrollTop: target.offset().top - 100
            }, 800 );
        }
      }, 1);
    }

});
