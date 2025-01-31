import { app } from './app.js';

export function ttInitJoint() {
    $(document).ready(function (){
        // api call holder
        app.api_call_param_string = '?min_yearpublished='+min_yearpublished+'&max_yearpublished='+max_yearpublished+'&yearsstudied_number_min='+yearsstudied_number_min+'&yearsstudied_number_max='+yearsstudied_number_max+'&min_samplesize='+min_samplesize+'&max_samplesize='+max_samplesize+'&min_prevalenceper10000='+min_prevalenceper10000+'&max_prevalenceper10000='+max_prevalenceper10000+'&studytype='+encodeURIComponent(studytype)+'&keyword='+encodeURIComponent(keyword)+'&timeline_type='+timeline_type+'&meanincome='+income+'&education='+education;

        // function for updating url state
        app.updateURL = function() {

            const obj = { foo: 'bar' };
            app.api_call_param_string = '?min_yearpublished='+min_yearpublished+'&max_yearpublished='+max_yearpublished+'&yearsstudied_number_min='+yearsstudied_number_min+'&yearsstudied_number_max='+yearsstudied_number_max+'&min_samplesize='+min_samplesize+'&max_samplesize='+max_samplesize+'&min_prevalenceper10000='+min_prevalenceper10000+'&max_prevalenceper10000='+max_prevalenceper10000+'&studytype='+encodeURIComponent(studytype)+'&keyword='+encodeURIComponent(keyword)+'&timeline_type='+timeline_type+'&meanincome='+income+'&education='+education;

            window.history.pushState(obj, 'Updated URL Parameters', app.api_call_param_string);
            // set the links to the map and list to hold the url params
            $('#list-link').attr('href', '/list/' + app.api_call_param_string);
            $('#map-link').attr('href', '/' + app.api_call_param_string);
            $('#download-link').attr('href', '/studies-csv/' + app.api_call_param_string);
        }

        // function for updating content based on filters
        app.runUpdate = function() {
            // run update
            app.updateURL();
            if ($('#map-link').hasClass('active')) {
                app.map.pullDataAndUpdate();
            } else {
                app.list.addRows();
            }
        }

        // making the combo box options for studytype
        d3.json('/studies-api/').then(function(data) {
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
            // update filters
            if (timeline_type == 'studied') {
                yearsstudied_number_min = $(this).val();
            } else {
                min_yearpublished = $(this).val();
            }
            app.runUpdate();
        });

        $('#max_year').on('change', function(e) {
            $('#more-information-card').css('display', 'none');
            // update filters
            if (timeline_type == 'studied') {
                yearsstudied_number_max = $(this).val();
            } else {
                max_yearpublished = $(this).val();
            }
            app.runUpdate();
        });

        $('#studytype').on('change', function(e) {
            $('#more-information-card').css('display', 'none');
            // update filters
            studytype = $(this).val();
            app.runUpdate();
        });

        $('#prevalence').on('change', function(e) {
            $('#more-information-card').css('display', 'none');
            // update filters
            const prevalence = $(this).val();
            switch (prevalence) {
                case 'low':
                    min_prevalenceper10000 = '0';
                    max_prevalenceper10000 = '49.99';
                    break;
                case 'med':
                    min_prevalenceper10000 = '50';
                    max_prevalenceper10000 = '100';
                    break;
                case 'high':
                    min_prevalenceper10000 = '100.01';
                    max_prevalenceper10000 = '';
                    break;
                default:
                    min_prevalenceper10000 = '';
                    max_prevalenceper10000 = '';
            }
            app.runUpdate();
        });

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

            // set dropdown menu values
            $('#search').val('');
            $('#min_year').val($('#min_year option:first').val());
            $('#max_year').val($('#max_year option:first').val());
            $('#studytype').val('');
            $('#prevalence').val('all');
            $('#samplesize').val('all');
            $('#meanincomeofparticipants').val('all');
            $('#educationlevelofparticipants').val('all');

            // remove brush from timeline
            if ($('#map-link').hasClass('active')) {
                app.map.clearTimelineBrush();
            }

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

        $('#copy-link').click(function(){
            var dummy = document.createElement('input'),
                text = window.location.href;
            document.body.appendChild(dummy);
            dummy.value = text;
            dummy.select();
            document.execCommand('copy');
            document.body.removeChild(dummy);
        });

        $('#filters-link').click(function(){
            if ($('#filter-list').hasClass('invisible')) {
                $('#filter-list').removeClass('invisible');
                $('#filter-list').addClass('visible');
                $(this).tooltip('hide').prop('title', 'Close fliter drawer').attr('data-original-title', 'Close fliter drawer').tooltip('show');

            } else {
                $('#filter-list').addClass('invisible');
                $('#filter-list').removeClass('visible');
                $(this).tooltip('hide').prop('title', 'Open fliter drawer').attr('data-original-title', 'Open fliter drawer').tooltip('show');
            }
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
    });
}
