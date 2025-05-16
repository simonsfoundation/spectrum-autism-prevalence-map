import { app } from './app.js';

// function to update disabled min and max years options that can be called from this file and map.ts
export function updateYearDropdowns(minYear, maxYear) {
    if (app.comboBox_max_year) {
        app.comboBox_max_year.selectAll('option')
            .property('disabled', function() { return parseInt(this.value) < minYear; });
    }
    if (app.comboBox_min_year) {
        app.comboBox_min_year.selectAll('option')
            .property('disabled', function() { return parseInt(this.value) > maxYear; });
    }
}

export function ttInitJoint() {
    $(document).ready(function () {
        app.meanBoxVisible = sessionStorage.getItem('meanBoxVisible') === 'true';

        $(document).on('click', '[data-function="cookie-banner-set-consent"]', function (e) {
            e.preventDefault();
            let cookieValue = $(this).data('cookie-value');
            setCookie(cookieValue);
            if (cookieValue === true) {
                grantGTMConsent();
            } else {
                denyGTMConsent();
            }
            $("[data-id='cookie-consent-banner']").hideBanner();
        });

        function setCookie(cookieValue) {
            let date = new Date(),
                later_date = new Date();
            later_date.setTime(parseInt(date.getTime()) + 2592000 * 1000);
            document.cookie = 'privacy-consent-given=' + cookieValue + ';path=/;expires=' + later_date.toUTCString() + ';secure;';
        };
    
        function getCookie() {
            let value = "; " + document.cookie,
                parts = value.split('; privacy-consent-given=');
            if (parts.length === 2) {
                return parts.pop().split(';').shift();
            } else {
                return 'cookie-not-set';
            }
        }

        function grantGTMConsent(){
            gtag('consent', 'update', {
                'ad_storage': 'granted',
                'analytics_storage': 'granted'
            });
        }
    
        function denyGTMConsent() {
            gtag('consent', 'update', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied'
            });
            gtag('consent', 'update', {
                'analytics_storage': 'granted',
                'region': ['US']
            });
        }
    
        $.fn.showBanner = function() {
            this.css({'visibility': 'visible', 'display': 'none'}).fadeIn(400);
        }
    
        $.fn.hideBanner = function () {
            this.fadeOut(400);
        }
        
        let consentCookie = getCookie();
        if (consentCookie === 'cookie-not-set') {
            $("[data-id='cookie-consent-banner']").showBanner();
        } else if (consentCookie === 'true') {
            grantGTMConsent();
        }

        app.comboBox_min_year = null;
        app.comboBox_max_year = null;


        // api call holder
        app.api_call_param_string = '?min_yearpublished='+min_yearpublished+'&max_yearpublished='+max_yearpublished+'&yearsstudied_number_min='+yearsstudied_number_min+'&yearsstudied_number_max='+yearsstudied_number_max+'&min_samplesize='+min_samplesize+'&max_samplesize='+max_samplesize+'&min_prevalenceper10000='+min_prevalenceper10000+'&max_prevalenceper10000='+max_prevalenceper10000+'&studytype='+encodeURIComponent(studytype)+'&keyword='+encodeURIComponent(keyword)+'&timeline_type='+timeline_type+'&meanincome='+income+'&education='+education+'&country='+country+'&continent='+continent+'&sort_field='+sort_field+'&sort_order='+sort_order;

        // function for updating url state
        app.updateURL = function() {
            const obj = { foo: 'bar' };
            app.api_call_param_string = '?min_yearpublished='+min_yearpublished+'&max_yearpublished='+max_yearpublished+'&yearsstudied_number_min='+yearsstudied_number_min+'&yearsstudied_number_max='+yearsstudied_number_max+'&min_samplesize='+min_samplesize+'&max_samplesize='+max_samplesize+'&min_prevalenceper10000='+min_prevalenceper10000+'&max_prevalenceper10000='+max_prevalenceper10000+'&studytype='+encodeURIComponent(studytype)+'&keyword='+encodeURIComponent(keyword)+'&timeline_type='+timeline_type+'&meanincome='+income+'&education='+education+'&country='+country+'&continent='+continent+'&sort_field='+sort_field+'&sort_order='+sort_order;

            window.history.pushState(obj, 'Updated URL Parameters', app.api_call_param_string);
            // set the links to the map and list to hold the url params
            $('#list-link').attr('href', '/list/' + app.api_call_param_string);
            $('#map-link').attr('href', '/' + app.api_call_param_string);
            $('#download-link').attr('href', '/studies-csv/' + app.api_call_param_string);
            $('#about-link').attr('href', '/about/' + app.api_call_param_string);
        }

        // function for updating content based on filters
        app.runUpdate = function() {
            // clear anything pinned on the map or timeline if we are in the map view
            if ($('#map-link').hasClass('text-red') || $('#map-link').hasClass('active')) {
                app.map.clearPinned();
            }

            // run update
            app.updateURL();
            if ($('#map-link').hasClass('text-red') || $('#map-link').hasClass('active')) {
                app.map.pullDataAndUpdate();
            } else {
                app.list.addRows();
            }
            // update the mean
            app.fetchAndUpdateMean();
        }

        d3.json('/studies-api/').then(function(data) {
            // adding the options for study type
            let methodsArray = [];
            for (let index = 0; index < data.features.length; index++) {
                const studytype_array = data.features[index].properties.studytype.replace(/ *([|]) */g, '$1').split('|')
                for (let index = 0; index < studytype_array.length; index++) {
                    if (studytype_array[index]) {
                        methodsArray.push(studytype_array[index].trim());
                    }
                }
            }
            const uniqueMethods = methodsArray.filter(onlyUnique);
            uniqueMethods.sort(function(a, b) {
                var textA = a.toUpperCase();
                var textB = b.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
            const comboBox = d3.select('#studytype');
            for (let index = 0; index < uniqueMethods.length; index++) {
                comboBox.append('option')
                    .attr('value', uniqueMethods[index])
                    .text(uniqueMethods[index]);
            }

            if (studytype) {
                $('#studytype').val(studytype);
            }

            // adding the options for country
            let allCountries = [];
            data.features.forEach(d => {
                const c = d.properties.country;
                if (c) {
                    allCountries.push(c.trim());
                }
            });

            // remove duplicate countries
            allCountries = [...new Set(allCountries)].sort();

            // populate country dropdown
            const countrySelect = d3.select('#country');
            allCountries.forEach(c => {
                countrySelect.append('option')
                    .attr('value', c)
                    .text(c);
            });

            if (country) {
                $('#country').val(country);
            }

            if (continent) {
                $('#continent').val(continent);
            }

            // making the combo box options for earliest published and latest published
            app.comboBox_min_year = d3.select('#min_year');
            app.comboBox_max_year = d3.select('#max_year');

            const timeMin = d3.min(data.features, function(d) { return new Date(d.properties.yearsstudied_number_min); }).getUTCFullYear();
            const timeMax = d3.max(data.features, function(d) { return new Date(d.properties.yearpublished); }).getUTCFullYear();

            for (let index = timeMin; index <= timeMax; index++) {
                app.comboBox_min_year.append('option')
                    .attr('value', index)
                    .text(index);

                app.comboBox_max_year.append('option')
                    .attr('value', index)
                    .text(index);
            }

            if (min_yearpublished) {
                $('#min_year').val(min_yearpublished);
            } else if (yearsstudied_number_min) {
                $('#min_year').val(yearsstudied_number_min);
            } else {
                $('#min_year').val($('#min_year option:first').val());
            }

            if (max_yearpublished) {
                $('#max_year').val(max_yearpublished);
            } else if (yearsstudied_number_max) {
                $('#max_year').val(yearsstudied_number_max);
            } else {
                $('#max_year').val($('#max_year option:last').val());
            }

            // disable options based on initial min and max values
            const initialMinYear = parseInt($('#min_year').val());
            const initialMaxYear = parseInt($('#max_year').val());
            updateYearDropdowns(initialMinYear, initialMaxYear);

            // initial fetch of mean value
            app.meanValue = data.mean;
        });

        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }

        // listeners for search term changes and filters
        $('#search').on('keydown', function (e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                $('#more-information-card').css('display', 'none');
                keyword = $(this).val();
                app.runUpdate();
            }
        });

        $('#min_year').on('change', function(e) {
            $('#more-information-card').css('display', 'none');
            if (timeline_type == 'studied') {
                yearsstudied_number_min = $(this).val();
            } else {
                min_yearpublished = $(this).val();
            }
            // make sure that max_year is greater than min year
            const minYearSelected = parseInt($(this).val());
            const maxYearSelected = parseInt($('#max_year').val());
            updateYearDropdowns(minYearSelected, maxYearSelected);
            if (app.map && typeof app.map.updateTimelineBrushFromFilters === 'function') {
                app.map.updateTimelineBrushFromFilters();
            }
            app.runUpdate();
        });

        $('#max_year').on('change', function(e) {
            $('#more-information-card').css('display', 'none');
            if (timeline_type == 'studied') {
                yearsstudied_number_max = $(this).val();
            } else {
                max_yearpublished = $(this).val();
            }
            // make sure that min year is less than max year
            const maxYearSelected = parseInt($(this).val());
            const minYearSelected = parseInt($('#min_year').val());
            updateYearDropdowns(minYearSelected, maxYearSelected);
            if (app.map && typeof app.map.updateTimelineBrushFromFilters === 'function') {
                app.map.updateTimelineBrushFromFilters();
            }
            app.runUpdate();
        });

        $('#studytype').on('change', function(e) {
            $('#more-information-card').css('display', 'none');
            // update filters
            studytype = $(this).val();
            app.runUpdate();
        });

        // handle the prevalence slider
        let initialMin = min_prevalenceper10000 ? parseFloat(min_prevalenceper10000) : 0;
        let initialMax = max_prevalenceper10000 ? parseFloat(max_prevalenceper10000) : 500;

        $('#prevalence-slider').slider({
            range: true,
            min: 0,
            max: 500,
            step: 1,
            values: [initialMin, initialMax],
            slide: function(event, ui) {
                // 'ui.values[0]' is the new min, 'ui.values[1]' is the new max
                $('#prevalence-min').val(ui.values[0]);
                $('#prevalence-max').val(ui.values[1]);
            },
            change: function(event, ui) {
                min_prevalenceper10000 = ui.values[0].toString();
                max_prevalenceper10000 = ui.values[1].toString();

                $('#more-information-card').css('display', 'none');
                app.runUpdate();
            }
        });

        $('#prevalence-min').on('change', function() {
            let newMin = parseFloat($(this).val());
            if (isNaN(newMin)) newMin = 0;

            // get current slider max
            let currentMax = $('#prevalence-slider').slider('values', 1);
            if (newMin > currentMax) newMin = currentMax;

            min_prevalenceper10000 = newMin.toString();
            
            // temporarily disable the slider's change event
            var originalChangeHandler = $('#prevalence-slider').slider("option", "change");
            $('#prevalence-slider').slider("option", "change", null);
            
            // update the slider value without triggering a change event
            $('#prevalence-slider').slider('values', 0, newMin);
            
            // restore the original event
            $('#prevalence-slider').slider("option", "change", originalChangeHandler);
            
            app.runUpdate();
        });

        $('#prevalence-max').on('change', function() {
            let newMax = parseFloat($(this).val());
            if (isNaN(newMax)) newMax = 500; // fallback

            // get current slider min
            let currentMin = $('#prevalence-slider').slider('values', 0);
            if (newMax < currentMin) newMax = currentMin;

            max_prevalenceper10000 = newMax.toString();
            
            // temporarily disable the slider's change event
            var originalChangeHandler = $('#prevalence-slider').slider("option", "change");
            $('#prevalence-slider').slider("option", "change", null);
            
            // update the slider value without triggering a change event
            $('#prevalence-slider').slider('values', 1, newMax);
            
            // restore the original event
            $('#prevalence-slider').slider("option", "change", originalChangeHandler);
            
            app.runUpdate();
        });

        $('#prevalence-min').val(initialMin);
        $('#prevalence-max').val(initialMax);
        // end handling the prevalence slider

        $('#samplesize').on('change', function(e) {
            $('#more-information-card').css('display', 'none');
            // update filters
            const samplesize = $(this).val();
            switch (samplesize) {
                case 'low':
                    min_samplesize = '0';
                    max_samplesize = '9999';
                    break;
                case 'med':
                    min_samplesize = '10000';
                    max_samplesize = '100000';
                    break;
                case 'high':
                    min_samplesize = '100001';
                    max_samplesize = '';
                    break;
                default:
                    min_samplesize = '';
                    max_samplesize = '';
            }
            app.runUpdate();
        });

        $('#continent').on('change', function(e) {
            $('#more-information-card').css('display', 'none');
            continent = $(this).val();
            if( continent === 'all' ) continent = '';

            // only reset country if this is a user interacting with the filter and not on page load when trying to preserve settings
            if (e.originalEvent) {
                $('#country').val('all');
                country = '';
            }

            app.runUpdate();
        });

        $('#country').on('change', function(e) {
            $('#more-information-card').css('display', 'none');
            country = $(this).val();
            if( country === 'all' ) country = '';

            // only reset continent if this is a user interacting with the filter and not on page load when trying to preserve settings
            if (e.originalEvent) {
                $('#continent').val('all');
                continent = '';
            }

            app.runUpdate();
        });

        $('#meanincomeofparticipants').on('change', function(e) {
            $('#more-information-card').css('display', 'none');
            // update filters
            income = $(this).val();
            if( income === 'all' ) income = '';
            app.runUpdate();
        });

        $('#educationlevelofparticipants').on('change', function(e) {
            $('#more-information-card').css('display', 'none');
            // update filters
            education = $(this).val();
            if( education === 'all' ) education = '';
            app.runUpdate();
        });

        // listener for the clear filters button
        $('#clear-filters').click(function(){
            // reset variables
            min_yearpublished = '';
            max_yearpublished = '';
            yearsstudied_number_min = '';
            yearsstudied_number_max = '';
            min_prevalenceper10000 = '';
            max_prevalenceper10000 = '';
            min_samplesize = '';
            max_samplesize = '';
            studytype = '';
            keyword = '';
            income = '';
            education = '';
            continent = '';
            country = '';

            // set dropdown menu values
            $('#search').val('');
            $('#min_year').val($('#min_year option:first').val());
            $('#max_year').val($('#max_year option:last').val());
            $('#studytype').val('');
            $('#prevalence-min').val(0);
            $('#prevalence-slider').slider('values', 0, 0);
            $('#prevalence-max').val(500);
            $('#prevalence-slider').slider('values', 1, 500);
            $('#samplesize').val('all');
            $('#meanincomeofparticipants').val('all');
            $('#educationlevelofparticipants').val('all');
            $('#continent').val('all');
            $('#country').val('all');

            if (app.map.expandedCluster) {
                app.map.collapseCluster();
            }
          
            // re-enable all min and max select options
            if (app.comboBox_min_year) {
                app.comboBox_min_year.selectAll('option').property('disabled', false);
            }
            if (app.comboBox_max_year) {
                app.comboBox_max_year.selectAll('option').property('disabled', false);
            }

            // remove brush from timeline
            if ($('#map-link').hasClass('text-red') || $('#map-link').hasClass('active')) {
                // clear anything pinned on the map or timeline
                app.map.clearTimelineBrush();
                app.map.clearPinned();
            }

            // remove the search input close X
            $('[data-id="keyword-filter-x-btn"]').addClass('hidden');
          
            // hide the mean box
            app.meanBoxVisible = false;
            sessionStorage.removeItem('meanBoxVisible');
            $('#mean-static').addClass('hidden').attr('aria-hidden', 'true');

            // run update
            app.runUpdate();
        });

        // set dropdowns and inputs on page load
        switch (min_prevalenceper10000) {
            case '0':
                $('#prevalence').val('low');
                break;
            case '50':
                $('#prevalence').val('med');
                break;
            case '100.01':
                $('#prevalence').val('high');
                break;
            default:
                $('#prevalence').val('all');
        }

        switch (min_samplesize) {
            case '0':
                $('#samplesize').val('low');
                break;
            case '10000':
                $('#samplesize').val('med');
                break;
            case '100001':
                $('#samplesize').val('high');
                break;
            default:
                $('#samplesize').val('all');
        }

        if (keyword) {
            $('#search').val(keyword);
        }

        if (studytype) {
            $('#studytype').val(studytype);
        }

        // initialize
        app.updateURL();

        // enable tooltips
        $('[data-toggle="tooltip"]').tooltip();

        // enable popovers
        $('[data-toggle="popover"]').popover();

        // listen for opening of popovers and close after 5 seconds
        $('[data-toggle="popover"]').on('shown.bs.popover', function () {
            setTimeout(() => {
                $('[data-toggle="popover"]').popover('hide');
            }, 3000);
        });

        // listen for window resize
        let resize_id;
        $(window).resize(function () { 
            // redraw map and timeline
            clearTimeout(resize_id);
            if ($('#map-link').hasClass('active')) {
                resize_id = setTimeout(app.map.initializeMap(), 500);
            }
        });

        // make the min and max prevalence inputs accept numerical values only to account for Firefox allowing non-numeric values in a number input
        $('input[data-group="prevalence"]').on('input', function() {
            // get the current value of the input
            let val = $(this).val();
            
            // remove any characters that are not digits
            let cleaned = val.replace(/[^0-9]/g, '');
            
            // update the value if it has been cleaned
            if (cleaned !== val) {
                $(this).val(cleaned);
            }

            // keep the value between 0 and 500
            if (cleaned !== '') {
                let num = parseInt(cleaned, 10);
                if (num < 0) {
                    $(this).val('0');
                } else if (num > 500) {
                    $(this).val('500');
                }
            }
        });

        // get the citation URL from the #citation-url element
        const citationURL = $('#citation-url').text();
        var citationHideTimeout;
        
        // copy citation link to clipboard
        $('#copy-link').click(function () {
            navigator.clipboard.writeText(citationURL);
        });

        // build the tooltip for the copy citation button
        $('#copy-link').tooltip({
            container: 'body',
            trigger: 'click',
            placement: 'bottom',
            template: '<div class="tooltip copy" role="tooltip"><div class="tooltip-inner"></div></div>',
            title: 'Copied to clipboard',
        }).on('shown.bs.tooltip', function () {
            var $tooltip = $('.tooltip.copy');
            // get the current left position
            var currentLeft = parseInt($tooltip.css('left'), 10) || 0;
            // push 18px to the right
            $tooltip.css('left', (currentLeft + 21) + 'px');

            // hide this tooltip after 3 seconds
            var that = $(this);

            // add a timeout that we clear to hide the popup
            clearTimeout(citationHideTimeout);

            citationHideTimeout = setTimeout(function() {
                that.tooltip('hide');
            }, 3000);
        });

        // get the citation count from crossref
        function getCitationCount(doi: string) {
            // build the Crossref API URL
            const url = 'https://api.crossref.org/works/' + encodeURIComponent(doi);

            $.ajax({
                url: url,
                dataType: 'json',
                success: function (data) {
                    if (data && data.message && typeof data.message['is-referenced-by-count'] !== 'undefined') {
                        // citation count is in 'is-referenced-by-count'
                        const citationCount = data.message['is-referenced-by-count'];
                        $('#citation-count').text(citationCount);
                    }
                }
            });
        }

        // calculate the citation count
        getCitationCount(citationURL);

        // show the calculate mean popup and handle the copy to clipboard when the calculate mean button is clicked, show the note when hovered
        var $meanButton = $('[data-mean]');
        var $meanPopup = $('#mean-popup');
        var $popupText = $meanPopup.find('[data-id="mean-popup-text"]');
        var $meanStatic = $('#mean-static');
        var $staticText = $meanStatic.find('[data-id="mean-static-text"]');
        var $dataLine = $('[data-id="mean-data-line"]');
        var $noteLine = $('[data-id="mean-note-line"]');
        var popupTextTemplate = 'PREVALENCE MEAN ({value}) IS COPIED TO CLIPBOARD';
        var staticTextTemplate = 'MEAN = {value}';
        var meanHideTimeout;
        var popupState = {
            clickTriggered: false,
            hoverActive: false
        };

        // function to update the mean for both map and list
        app.fetchAndUpdateMean = function() {
            if (app.meanValue) {
                // update button attribute
                $('[data-mean]').attr('data-mean', app.meanValue);
                
                // update static box if it is visible
                if (app.meanBoxVisible) {
                    var $staticText = $('#mean-static').find('[data-id="mean-static-text"]');
                    if ($staticText.length) {
                        $staticText.text('MEAN = ' + app.meanValue);
                        $('#mean-static').removeClass('hidden').attr('aria-hidden', 'false');
                    }
                }
            }
        };

        $meanButton.on('click', function () {
            var meanValue = $meanButton.attr('data-mean');
            $popupText.text(popupTextTemplate.replace('{value}', meanValue || ''));
            $staticText.text(staticTextTemplate.replace('{value}', meanValue || ''));

            popupState.clickTriggered = true;

            // show the popup and the static box
            $meanPopup.removeClass('hidden').attr('aria-hidden', 'false');
            $meanStatic.removeClass('hidden').attr('aria-hidden', 'false');

            // make sure we are using the correct width
            $meanPopup.removeClass('w-mean-popup-note');

            // show only the data line on click
            $dataLine.removeClass('hidden');
            $noteLine.addClass('hidden');

            // copy value to clipboard
            navigator.clipboard.writeText(meanValue);

            // add a timeout that we clear to hide the popup
            clearTimeout(meanHideTimeout);

            meanHideTimeout = setTimeout(function () {
                $meanPopup.addClass('hidden').attr('aria-hidden', 'true');
                popupState.clickTriggered = false;
            }, 3000);

            // set a flag for the mean box and store in session storage
            app.meanBoxVisible = true;
            sessionStorage.setItem('meanBoxVisible', 'true');
        });

        $meanButton.on('mouseenter', function() {
            popupState.hoverActive = true;
            
            $meanPopup.removeClass('hidden').attr('aria-hidden', 'false');
            
            // on hover we show the note, not the data line
            $meanPopup.addClass('w-mean-popup-note');
            $dataLine.addClass('hidden');
            $noteLine.removeClass('hidden');
            
            if (!popupState.clickTriggered) {
                clearTimeout(meanHideTimeout);
            }
        });

        $meanButton.on('mouseleave', function() {
            popupState.hoverActive = false;

            $meanPopup.removeClass('w-mean-popup-note');
            
            // if clicked already show the data line, hide the note line, let timeout continue from the click
            if (popupState.clickTriggered) {
                $dataLine.removeClass('hidden');
                $noteLine.addClass('hidden');
            } else {
                // hide if hover only
                $meanPopup.addClass('hidden').attr('aria-hidden', 'true');
            }
        });

        // for the search field, handle the 'X' functionality and clearing keyword from URL
        const searchInput = document.querySelector('[data-id="keyword-filter-input"]') as HTMLInputElement;
        const xButton = document.querySelector('[data-id="keyword-filter-x-btn"]') as HTMLButtonElement;

        if (searchInput) {
            function toggleXButton() {
                if (searchInput.value.trim().length > 0) {
                    xButton.classList.remove('hidden');
                } else {
                    xButton.classList.add('hidden');
                }
            }

            searchInput.addEventListener('input', toggleXButton);
            toggleXButton();

            // when the X button is clicked, clear the search, remove the keyword
            xButton.addEventListener('click', function () {
                searchInput.value = '';
                // reset the global 'keyword' variable so it's removed from URL params
                keyword = '';
                toggleXButton();
                searchInput.focus();
                app.runUpdate();
            });
        }

        // update min and max year labels based on the timeline study type
        if (timeline_type == 'studied') {
            $('#earliest-label').text('Earliest year studied');
            $('#latest-label').text('Latest year studied');
        } else {
            $('#earliest-label').text('Earliest year published');
            $('#latest-label').text('Latest year published');
        }

        // initialize mean box visibility
        if (app.meanBoxVisible) {
            app.fetchAndUpdateMean();
        }
    });
}
