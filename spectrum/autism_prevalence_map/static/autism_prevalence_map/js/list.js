$(document).ready(function (){
    // app.list scope
    app.list = {};

    // create tbody 
    const table = d3.select("#studies");

    app.list.addRows = function() {
        d3.select("#studies_tbody").remove();      
        d3.json("/studies-api/?min_year_of_publication="+min_year_of_publication+"&max_year_of_publication="+max_year_of_publication+"&min_study_size="+min_study_size+"&max_study_size="+max_study_size+"&min_prevalence_rate="+min_prevalence_rate+"&max_prevalence_rate="+max_prevalence_rate+"&methodology="+methodology+"&keyword="+keyword).then(function(data) {
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
                .classed("fas-red", true)
            
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

    // making the combo box options for earliest published and lateste published
    d3.json("/studies-api/").then(function(data) {
        const comboBox_min_year_of_publication = d3.select("#min_year_of_publication");
        const comboBox_max_year_of_publication = d3.select("#max_year_of_publication");
        const timeMin = d3.min(data.features, function(d) { return new Date(d.properties.year_of_publication); }).getUTCFullYear();
        const timeMax = d3.max(data.features, function(d) { return new Date(d.properties.year_of_publication); }).getUTCFullYear();

        for (let index = timeMin; index <= timeMax; index++) {
            comboBox_min_year_of_publication.append("option")
                .attr("value", index)
                .text(index);

            comboBox_max_year_of_publication.append("option")
                .attr("value", index)
                .text(index);
        }

        if (min_year_of_publication) {
            $("#min_year_of_publication").val(min_year_of_publication);
        } else {
            $("#min_year_of_publication").val($("#min_year_of_publication option:first").val());
        }
        if (max_year_of_publication) {
            $("#max_year_of_publication").val(max_year_of_publication);
        } else {
            $("#max_year_of_publication").val($("#max_year_of_publication option:last").val());
        }
    });

    // initialize
    app.list.addRows();

});
