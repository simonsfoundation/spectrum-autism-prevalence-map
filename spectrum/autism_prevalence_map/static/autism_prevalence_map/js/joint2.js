let app = {};

$(document).ready(function (){
    
    // function for updating url state
    app.updateURL = function() {
        const obj = { foo: "bar" };
        const param_string = "?min_year_of_publication="+min_year_of_publication+"&max_year_of_publication="+max_year_of_publication+"&min_study_size="+min_study_size+"&max_study_size="+max_study_size+"&min_prevalence_rate="+min_prevalence_rate+"&max_prevalence_rate="+max_prevalence_rate+"&methodology="+encodeURIComponent(methodology)+"&keyword="+keyword; 
        window.history.pushState(obj, "Updated URL Parameters", param_string);
        // set the links to the map and list to hold the url params
        $('#list-link').attr('href', "/list2/" + param_string);
        $('#map-link').attr('href', "/map2/" + param_string);
        $('#download-link').attr('href', "/studies-csv/" + param_string);
    }

    // function for updating content based on filters
    app.runUpdate = function() {
        // run update
        if ($('#map-link').hasClass("active")) {
            app.map.addOverlay();
        } else {
            app.list.addRows();
        }
        app.updateURL();
    }

    // making the combo box options for methodology
    d3.json("/studies-api/").then(function(data) {
        let methodsArray = [];
        for (let index = 0; index < data.features.length; index++) {
            methodsArray.push(data.features[index].properties.methodology); 
        }
        const uniqueMethods = methodsArray.filter(onlyUnique);
        uniqueMethods.sort(function(a, b) {
            var textA = a.toUpperCase();
            var textB = b.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        const comboBox = d3.select("#methodology");
        for (let index = 0; index < uniqueMethods.length; index++) {
            comboBox.append("option")
                .attr("value", uniqueMethods[index])
                .text(uniqueMethods[index]);
        }

        if (methodology) {
            $("#methodology").val(methodology);
        }

    });

    function onlyUnique(value, index, self) { 
        return self.indexOf(value) === index;
    }

    // listeners for search term changes and filters
    $("#search").on('keydown', function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            $("#more-information-card").css("display", "none");
            keyword = $(this).val();
            app.runUpdate();   
        }
    });

    $("#min_year_of_publication").on("change", function(e) {
        $("#more-information-card").css("display", "none");
        // update filters
        min_year_of_publication = $(this).val();
        app.runUpdate();
    }); 

    $("#max_year_of_publication").on("change", function(e) {
        $("#more-information-card").css("display", "none");
        // update filters
        max_year_of_publication = $(this).val();
        app.runUpdate();
    }); 

    $("#methodology").on("change", function(e) {
        $("#more-information-card").css("display", "none");
        // update filters
        methodology = $(this).val();
        app.runUpdate();
    });   

    $("#prevalence").on("change", function(e) {
        $("#more-information-card").css("display", "none");
        // update filters
        const prevalence = $(this).val();
        switch (prevalence) {
            case "low":
                min_prevalence_rate = "0";
                max_prevalence_rate = "99.99"; 
                break;                             
            case "med":        
                min_prevalence_rate = "100";
                max_prevalence_rate = "200";
                break;                          
            case "high":        
                min_prevalence_rate = "200.01";
                max_prevalence_rate = "";   
                break;                       
            default:
                min_prevalence_rate = "";
                max_prevalence_rate = ""; 
        }
        app.runUpdate();
    });   

    $("#study_size").on("change", function(e) {
        $("#more-information-card").css("display", "none");
        // update filters
        const study_size = $(this).val();
        switch (study_size) {
            case "low":
                min_study_size = "0";
                max_study_size = "9999"; 
                break;                             
            case "med":        
                min_study_size = "10000";
                max_study_size = "100000";
                break;                          
            case "high":        
                min_study_size = "100001";
                max_study_size = "";   
                break;                       
            default:
                min_study_size = "";
                max_study_size = ""; 
        }
        app.runUpdate();
    });  

    // listener for the clear filters button
    $("#clear-filters").click(function(){
        // reset variables
        min_year_of_publication = "";
        max_year_of_publication = "";
        methodology = "";
        min_prevalence_rate = "";
        max_prevalence_rate = ""; 
        min_study_size = "";
        max_study_size = ""; 
        keyword = "";

        // set dropdown menu values
        $("#search").val('');
        $("#min_year_of_publication").val($("#min_year_of_publication option:first").val());
        $("#max_year_of_publication").val($("#max_year_of_publication option:last").val());
        $("#methodology").val('');
        $("#prevalence").val('all');
        $("#study_size").val('all');

        // run update
        app.runUpdate();

    });


    // set dropdowns and inputs on page load
    switch (min_prevalence_rate) {
        case "0":
            $("#prevalence").val("low");
            break;                             
        case "100":        
            $("#prevalence").val("med");
            break;                          
        case "200.01":        
            $("#prevalence").val("high"); 
            break;                       
        default:
            $("#prevalence").val("all"); 
    }

    switch (min_study_size) {
        case "0":
            $("#study_size").val("low");
            break;                             
        case "10000":        
            $("#study_size").val("med");
            break;                          
        case "100001":        
            $("#study_size").val("high"); 
            break;                       
        default:
            $("#study_size").val("all"); 
    }

    // 

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

    $("#copy-link").click(function(){
        var dummy = document.createElement('input'),
            text = window.location.href;
        document.body.appendChild(dummy);
        dummy.value = text;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
    });

    $("#filters-link").click(function(){
        if ($('#filter-list').hasClass("invisible")) {
            $('#filter-list').removeClass("invisible");
            $('#filter-list').addClass("visible");
            $(this).tooltip('hide').prop('title', 'Close fliter drawer').attr('data-original-title', 'Close fliter drawer').tooltip('fixTitle').tooltip('show');
            
        } else {
            $('#filter-list').addClass("invisible");
            $('#filter-list').removeClass("visible");
            $(this).tooltip('hide').prop('title', 'Open fliter drawer').attr('data-original-title', 'Open fliter drawer').tooltip('fixTitle').tooltip('show');        }
    });

});
