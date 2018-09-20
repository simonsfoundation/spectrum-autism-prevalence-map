$(document).ready(function (){

    // create tbody 
    const table = d3.select("#studies");


    function addRows() {
        d3.select("#studies_tbody").remove();      
        d3.json("/studies-api/?min_year_of_publication="+min_year_of_publication+"&max_year_of_publication="+max_year_of_publication+"&min_study_size="+min_study_size+"&max_study_size="+max_study_size+"&min_prevalence_rate="+min_prevalence_rate+"&max_prevalence_rate="+max_prevalence_rate+"&category="+category+"&keyword="+keyword).then(function(data) {
            studies = data;
            let enter_selection = table.append("tbody")
                .attr("id", "studies_tbody")
                .selectAll("tr")
                .data(studies.features)
                .enter();

            
            let row1 = enter_selection.append("tr")
                .attr("data-toggle", "collapse")
		        .attr("href", function (d) { 
                    return "#accordion_menu_" + d.properties.pk; 
                })

                .attr("role", "button")
                .attr("aria-expanded", "false")
                .attr("aria-controls", function (d) { 
                    return d.properties.pk; 
                })
                .classed("study_row", true);

            row1.append("th")
                .attr("scope", "row")
                .append("i")
                .classed("fas", true)
                .classed("fa-chevron-down", true)
            
            row1.append("td")
                .text(function (d) { 
                    return d.properties.year_of_publication; 
                })

            row1.append("td")
                .text(function (d) { 
                    return d.properties.authors; 
                })

            row1.append("td")
                .text(function (d) { 
                    return d.properties.country; 
                })

            row1.append("td")
                .text(function (d) { 
                    return d.properties.area; 
                })

            row1.append("td")
                .text(function (d) { 
                    return d.properties.study_size; 
                })

            row1.append("td")
                .text(function (d) { 
                    return d.properties.prevalence_rate; 
                })

            row1.append("td")
                .text(function (d) { 
                    return d.properties.confidence_interval; 
                })

            row1.append("td")
                .append("button")
                .attr("type", "button")
                .classed("btn", true)
                .classed("btn-warning", true)
                .text("Share")

            let row2 = enter_selection.insert("tr")
                .classed("collapse", true)
		        .attr("id", function (d) { 
                    return "accordion_menu_" + d.properties.pk; 
                });

            let card_div = row2.append("td")
                .attr("colspan", "9")
                .append("div")
                .classed("card", true)
                .classed("card-body", true);
            
            card_div.append("h4")
                .text("More data");
            
            card_div.append("p")
                .html(function (d) { 
                    return "<b>Age:</b> " + d.properties.age + "<br />" +
                    "<b>Number Affected:</b> " + d.properties.number_affected + "<br />" +
                    "<b>Diagnostic Criteria:</b> " + d.properties.diagnostic_criteria + "<br />" +                  "<b>% With Normal IQ:</b> " + d.properties.pct_with_normal_iq + "<br />" +
                    "<b>Gender Ratio M:F:</b> " + d.properties.gender_ratio + "<br />"; 
                });

            d3.select('#studies_tbody').selectAll('tr').sort(function(a, b){ 
                return a.properties.pk - b.properties.pk; 
            });

            $('.collapse').collapse({
                toggle: false
            });

              
        });
    }

    // function for updating url state
    function updateURL() {
        const obj = { foo: "bar" };
        window.history.pushState(obj, "Updated URL Parameters", "/?min_year_of_publication="+min_year_of_publication+"&max_year_of_publication="+max_year_of_publication+"&min_study_size="+min_study_size+"&max_study_size="+max_study_size+"&min_prevalence_rate="+min_prevalence_rate+"&max_prevalence_rate="+max_prevalence_rate+"&category="+category+"&keyword="+keyword);
    }

    // listeners for search term changes and filters
    $("#category").on("change", function(e) {
        $("#more-information-card").css("display", "none");
        // update filters
        category = $(this).val();
        // run update
        addRows();
        updateURL();
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
        // run update
        addRows();
        updateURL();
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
        // run update
        addRows();
        updateURL();
    });  

    $("#search").on('keydown', function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            $("#more-information-card").css("display", "none");
            keyword = $(this).val();
            // run update
            addRows();
            updateURL();      
        }
    });    

    // listener to toggle arrows on click
    $(document).on('click', '.study_row', function(){
        const chevron_icon = $(this).find('.fas');
        if (chevron_icon.hasClass('fa-chevron-down')) {
            chevron_icon.removeClass('fa-chevron-down');
            chevron_icon.addClass('fa-chevron-up');
        } else {
            chevron_icon.removeClass('fa-chevron-up');
            chevron_icon.addClass('fa-chevron-down');
        }
    });


    // initialize
    addRows();

    // set dropdowns and inputs on page load
    if (category) {
        $("#category").val(category);
    }

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

});
