$(document).ready(function (){

    // app.map scope
    app.map = {};

    // constants
    const width = $("#map").width();
    const height = $("#map").height();
    const timeline_height = $("#timeline").height();
    
    // data holder
    let studies = null;

    // map projection
    const projection = d3.geoKavrayskiy7()
        .scale(270)
        .translate([width / 2, height / 1.8]);

    // function to create paths from map projection
    const path = d3.geoPath().projection(projection);

    // create svg container and apply zoom function
    const svg = d3.select("#map")
        .append("svg")
        .attr('id', 'svg')
        .style("width", "100%")
        .style("height", "100%")
        .append("g");

        
    // create g continmer for world map    
    const g = svg.append("g")
        .attr('id', 'g');

    // add a graticule to the map
    const graticule = d3.geoGraticule()
        .step([10, 10]);

    function addGraticule() {
        g.append("g")
            .attr("id", "graticule")
            .append("path")
            .datum(graticule)
            .attr("class", "graticule")
            .attr("d", path);
    }

    // add map data to the world map g container
    d3.json("https://unpkg.com/world-atlas@1/world/110m.json").then(function(world) {
        g.append("g")
            .attr("id", "countries")
            .selectAll("path")
            .data(topojson.feature(world, world.objects.countries).features.filter(function(d){
                if (d.id !== "010") {
                    return d
                }
            }))
            .enter().append("path")
            .attr("d", path)
            .attr("id", function(d) {
                return d.id;
            });

        g.append("path")
            .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
            .attr("id", "country-borders")
            .attr("d", path);

        app.map.addOverlay();
        app.map.addTimeline();
        addGraticule();
    });

    // add overlay dataset
    app.map.addOverlay = function() {
        d3.select("#studies").remove();      
        d3.json("/studies-api/?min_year_of_publication="+min_year_of_publication+"&max_year_of_publication="+max_year_of_publication+"&min_study_size="+min_study_size+"&max_study_size="+max_study_size+"&min_prevalence_rate="+min_prevalence_rate+"&max_prevalence_rate="+max_prevalence_rate+"&methodology="+methodology+"&keyword="+keyword).then(function(data) {
            studies = data;
            g.append("g")
                .attr("id", "studies")
                .selectAll("circle.map")
                .data(studies.features)
                .enter()
                .append("circle")
                .attr("cx", function (d) { return projection(d.geometry.coordinates)[0]; })
		        .attr("cy", function (d) { return projection(d.geometry.coordinates)[1]; })
                .attr("r", 5)
                .style("fill", "#1fcbec")
                .style("fill-opacity", pointOpacity)
                .style("stroke", "#fff")
                .style("stroke-width", "0")
                .classed("pin", true)
                .on("click", viewMoreInfo)
                .on("mouseover", function(d) {
                    d3.select(this).style("cursor", "pointer"); 
                    d3.select(this).style("stroke-width", "2");
                })
                .on("mouseout", function(d) {
                    d3.select(this).style("cursor", "default");
                    d3.select(this).style("stroke-width", "0");
                });

        });
    }

    app.map.addTimeline = function() {
        d3.selectAll(".studies-on-timeline").remove(); 
        d3.json("/studies-api/?min_study_size="+min_study_size+"&max_study_size="+max_study_size+"&min_prevalence_rate="+min_prevalence_rate+"&max_prevalence_rate="+max_prevalence_rate+"&methodology="+methodology+"&keyword="+keyword).then(function(data) {

            const container = d3.select('#timeline'),
                width = container.node().offsetWidth,
                height = timeline_height;

            const timeMin = d3.min(data.features, function(d) { return new Date(d.properties.year_of_publication); });
            const timeMax = d3.max(data.features, function(d) { return new Date(d.properties.year_of_publication); });

            timeMax.setFullYear(timeMax.getFullYear() + 1);

            const studiesByYear = d3.nest()
                .key(function(d) { return d.properties.year_of_publication; })
                .rollup(function(v) { return v.length; })
                .entries(data.features);
            
            for (let index = 0; index < studiesByYear.length; index++) {
                studiesByYear[index].count = 0;
            }
                        
            const svg = container.append('svg')
                .attr('width', width)
                .attr('height', height);
        
            let context = svg.append('g')
                .attr('class', 'context');

            const x = d3.scaleTime()
                .range([20, width-20])
                .domain([timeMin, timeMax])
                .nice(d3.timeYear);

            const y = d3.scaleLinear()
                .range([height-25, 20])
                .domain([1, d3.max(studiesByYear, function(d) { return d.value; })])

            const brush = d3.brushX()
                .extent([[0, 0], [width, height-20]])
                .on("start brush end", brushed);
        
            context.selectAll('circle.timeline')
                .data(data.features)
                .enter()
                .append('circle')
                .attr('transform', function(d) {
                    let count = 0;
                    for (let index = 0; index < studiesByYear.length; index++) {
                        if (studiesByYear[index].key == d.properties.year_of_publication) {
                            studiesByYear[index].count++;
                            count = studiesByYear[index].count;
                        }
                    }
                    let date = new Date(d.properties.year_of_publication)
                    date.setMonth(date.getMonth() + 6);
                    return 'translate(' + [x(date), y(count)] + ')';
                })
                .attr("r", 5)
                .style("fill", "#1fcbec")
                .style("fill-opacity", pointOpacity)
                .style("stroke", "#fff")
                .style("stroke-width", "0")
                .classed("studies-on-timeline", true)
                .on("click", viewMoreInfo)
                .on("mouseover", function(d) {
                    d3.select(this).style("cursor", "pointer"); 
                    d3.select(this).style("stroke-width", "2");
                })
                .on("mouseout", function(d) {
                    d3.select(this).style("cursor", "default");
                    d3.select(this).style("stroke-width", "0");
                });

            // Add the x axis
            const axisHeight = height - 20;
            svg.append("g")
                .attr("transform", "translate(0," + axisHeight + ")")
                .call(d3.axisBottom(x));
        
            // add the x brush
            const gBrush = context.append('g')
                .attr('class', 'x brush')
                .call(brush);

            const handle = gBrush.selectAll(".handle--custom")
                .data([{type: "w"}, {type: "e"}])
                .enter().append("circle")
                  .classed("handle--custom", true)
                  .attr("r", 2)
                  .attr("fill", "#666")
                  .attr("fill-opacity", 0.8)
                  .attr("stroke", "#000")
                  .attr("stroke-width", 1.5)
                  .attr("cursor", "ew-resize")

            const handleText = gBrush.selectAll(".handle--text")
                .data([{type: "w"}, {type: "e"}])
                .enter().append("text")
                  .classed("handle--text", true)
                  .attr("y", height / 2)
                  .attr("dy", ".35em")
                  .attr("fill", "#212529")
                  .attr("font-size", "10px")
                  .attr("text-anchor", "start");
                

            // call the x brush to show it on page load
            let startingYear = timeMin;
            let endingYear = timeMax;
            if (min_year_of_publication) {
                startingYear = new Date(min_year_of_publication);
            }
            if (max_year_of_publication) {
                endingYear = new Date(max_year_of_publication);
            }

            gBrush.call(brush.move, [startingYear, endingYear].map(x));
        
            function brushed() {
                if (!d3.event.selection) return; // Ignore empty selections.
                
                const s = d3.event.selection, 
                    d0 = d3.event.selection.map(x.invert),
                    d1 = d0.map(d3.timeYear.round);

                // If empty when rounded, use floor instead.
                if (d1[0] >= d1[1]) {
                    d1[0] = d3.timeYear.floor(d0[0]);
                    d1[1] = d3.timeYear.offset(d1[0]);
                }

                // d3.select(this).call(d3.event.target.move, d1.map(x));
                // handle.attr("transform", function(d, i) { 
                //     return "translate(" + x(d1[i]) + "," + height / 2 + ")"; 
                // });

                if (s == null) {
                    handle.attr("display", "none");
                    //circle.classed("active", false);
                } else {
                    //var sx = s.map(x.invert);
                    //circle.classed("active", function(d) { return sx[0] <= d && d <= sx[1]; });
                    handle
                        .attr("display", null)
                        .attr("transform", function(d, i) { 
                            return "translate(" + s[i] + "," + height / 2 + ")"; 
                        });

                    handleText
                        .attr("x", function(d, i) {
                            if (i === 0) {
                                return s[i] - 30;
                            } else {
                                return s[i] + 3;
                            }
                        })
                        .text(function(d, i) { 
                            return d1[i].getUTCFullYear(); 
                        });
                }

                min_year_of_publication = d1[0].getUTCFullYear();
                max_year_of_publication = d1[1].getUTCFullYear();

                app.map.addOverlay();
                app.updateURL();
        
            } 
            
        });        
    }

    // point color function
    function pointOpacity(feature) {
        if (feature.properties.reliability_quality == "yes") {
            return 1.0;
        } else {
            return 0.5;
        }
    }

    // set up map for zooming
    const g_zoom = d3.select("#g");
    const svg_zoom = d3.select('#svg');

    const zoom = d3.zoom()
        .scaleExtent([0.75, 3.375])
        .on("zoom", zoomed);

    svg_zoom.call(zoom);

    // define zooming function for zooming map
    function zoomed() {
        g_zoom.attr('transform', `translate(${d3.event.transform.x},  ${d3.event.transform.y}) scale(${d3.event.transform.k})`);
        // set pin zizes based on zoom level
        scalePins(d3.event.transform.k);
    };

    // define function zoom transiton 
    function transition(zoomLevel) {
        svg_zoom.transition()
            .duration(500)
            .call(zoom.scaleBy, zoomLevel);
    }
    
    // define the radius change for points as we soom in annd out
    function scalePins(k) {

        // calculate new radius
        const new_radius = 5 - k;

        // select all pins and apply new radius in transition with zoom
        d3.selectAll('.pin').transition()
            .duration(100)
            .attr("r", new_radius);

        // select all pins and apply new stroke width on hover
        d3.selectAll('.pin')
            .on("mouseover", function(d) {
                d3.select(this).style("cursor", "pointer"); 
                d3.select(this).style("stroke-width", new_radius/2.5);            
            });
    }

    // set up listeners for zoom
    d3.selectAll('button').on('click', function() {
        // zoom in 0.5 each time
        if (this.id === 'zoom-in') {
            transition(1.5); 
            scalePins(-1);
        }
        // zoom out 0.5 each time
        if (this.id === 'zoom-out') {
            transition(0.7);
            scalePins(1); 
        }
        // return to initial state
        if (this.id === 'zoom_init') {
            svg_zoom.transition()
                .duration(500)
                .call(zoom.scaleTo, 1); 
        }
    });

    // function for launching more information card
    function viewMoreInfo(d) {
        // add data to card
        const card_title = d.properties.authors + ' ' + d.properties.year_of_publication
        $("#card-title").text(card_title);
        $("#card-country").text(d.properties.country);
        $("#card-area").text(d.properties.area);
        $("#card-population").text(d.properties.population);
        $("#card-age").text(d.properties.age);
        $("#card-diagnostic_criteria").text(d.properties.diagnostic_criteria);
        $("#card-pct_with_normal_iq").text(d.properties.pct_with_normal_iq);
        $("#card-gender_ratio").text(d.properties.gender_ratio);
        $("#card-prevalence_rate").text(d.properties.prevalence_rate);
        $("#card-confidence_interval").text(d.properties.confidence_interval);
        
        // show card
        $("#more-information-card").css("display", "block");
    }

    // listener to close card
    $("#card-close").click(function(){
        $("#more-information-card").css("display", "none");
    });
    
});
