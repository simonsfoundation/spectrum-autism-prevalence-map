$(document).ready(function (){
    // app.list scope
    app.list = {};

    // create tbody 
    const table = d3.select("#studies");

    let world_topojson = null;



    app.list.addRows = function() {
        d3.select("#studies_tbody").remove();      
        d3.json("/studies-api/?min_yearpublished="+min_yearpublished+"&max_yearpublished="+max_yearpublished+"&min_samplesize="+min_samplesize+"&max_samplesize="+max_samplesize+"&min_prevalenceper10000="+min_prevalenceper10000+"&max_prevalenceper10000="+max_prevalenceper10000+"&studytype="+studytype+"&keyword="+keyword).then(function(data) {
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

            row1.append("td")
                .attr("scope", "row")
                .append("i")
                .classed("fas", true)
                .classed("fa-chevron-down", true)
                .classed("fas-red", true)
            
            row1.append("td")
                .text(function (d) { 
                    return d.properties.yearpublished; 
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
                    return d.properties.area.replace(/ *([|]) */g, '$1').split('|').join(', ');
                })

            row1.append("td")
                .text(function (d) { 
                    return d.properties.samplesize; 
                })

            row1.append("td")
                .text(function (d) { 
                    return d.properties.prevalenceper10000.replace(/ *([|]) */g, '$1').split('|').join(', ');
                    ; 
                })

            row1.append("td")
                .text(function (d) { 
                    return d.properties.confidenceinterval.replace(/ *([|]) */g, '$1').split('|').join(', '); 
                })


            let row2 = enter_selection.insert("tr")
                .classed("collapse", true)
		        .attr("id", function (d) { 
                    return "accordion_menu_" + d.properties.pk; 
                });

            let card_div = row2.append("td")
                .attr("colspan", "9")
                .append("div")
                .classed("list-more-information", true);
            
            card_div.append("p")
                .html(function (d) { 
                    const age = d.properties.age.replace(/ *([|]) */g, '$1').split('|').join(', ');
                    const diagnosticcriteria = d.properties.diagnosticcriteria.replace(/ *([|]) */g, '$1').split('|').join(', ');
            
                    return "<b>Age (years):</b> " + age + "<br />" +
                    "<b>Individuals with autism:</b> " + d.properties.individualswithautism + "<br />" +
                    "<b>Diagnostic criteria:</b> " + diagnosticcriteria + "<br />" + 
                    "<b>Percent w/ average IQ:</b> " + d.properties.percentwaverageiq + "<br />" +
                    "<b>Sex ratio (M:F):</b> " + d.properties.sexratiomf + "<br />"; 
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

    // making the combo box options for earliest published and latest published
    d3.json("/studies-api/").then(function(data) {
        const comboBox_min_yearpublished = d3.select("#min_yearpublished");
        const comboBox_max_yearpublished = d3.select("#max_yearpublished");
        const timeMin = d3.min(data.features, function(d) { return new Date(d.properties.yearpublished); }).getUTCFullYear();
        const timeMax = d3.max(data.features, function(d) { return new Date(d.properties.yearpublished); }).getUTCFullYear();

        for (let index = timeMin; index <= timeMax; index++) {
            comboBox_min_yearpublished.append("option")
                .attr("value", index)
                .text(index);

            comboBox_max_yearpublished.append("option")
                .attr("value", index)
                .text(index);
        }

        if (min_yearpublished) {
            $("#min_yearpublished").val(min_yearpublished);
        } else {
            $("#min_yearpublished").val($("#min_yearpublished option:first").val());
        }
        if (max_yearpublished) {
            $("#max_yearpublished").val(max_yearpublished);
        } else {
            $("#max_yearpublished").val($("#max_yearpublished option:first").val());
        }
    });

    // initialize
    app.list.addRows();

});
