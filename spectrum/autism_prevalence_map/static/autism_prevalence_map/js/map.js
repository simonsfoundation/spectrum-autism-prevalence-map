$(document).ready(function (){

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

        // g.append("path")
        //     .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
        //     .attr("id", "country-borders")
        //     .attr("d", path);

        addOverlay();
        addTimeline();
        addGraticule();
        updateURL();
    });

    // add overlay dataset
    function addOverlay() {
        d3.select("#studies").remove();      
        d3.json("/studies-api/?min_year_of_publication="+min_year_of_publication+"&max_year_of_publication="+max_year_of_publication+"&min_study_size="+min_study_size+"&max_study_size="+max_study_size+"&min_prevalence_rate="+min_prevalence_rate+"&max_prevalence_rate="+max_prevalence_rate+"&category="+category+"&keyword="+keyword).then(function(data) {
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

    function addTimeline() {
        d3.selectAll(".studies-on-timeline").remove(); 
        d3.json("/studies-api/?min_study_size="+min_study_size+"&max_study_size="+max_study_size+"&min_prevalence_rate="+min_prevalence_rate+"&max_prevalence_rate="+max_prevalence_rate+"&category="+category+"&keyword="+keyword).then(function(data) {

            const container = d3.select('#timeline'),
                width = container.node().offsetWidth,
                margin = {top: 0, right: 0, bottom: 0, left: 0},
                height = 100;

            const timeExtent = d3.extent(data.features, function(d) {
                return new Date(d.properties.year_of_publication);
            });
        
            const svg = container.append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom);
        
            let context = svg.append('g')
                .attr('class', 'context')
                .attr('transform', 'translate(' +
                    margin.left + ',' +
                    margin.top + ')');

            const x = d3.scaleTime()
                .range([10, width-10])
                .domain(timeExtent);

            const x_inverted = d3.scaleTime()
                .domain([10, width-10])
                .range(timeExtent);

            const brush = d3.brushX()
                .on("brush", brushed);
        
            context.selectAll('circle.timeline')
                .data(data.features)
                .enter()
                .append('circle')
                .attr('transform', function(d) {
                    return 'translate(' + [x(new Date(d.properties.year_of_publication)), height / 2] + ')';
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
        
            context.append('g')
                .attr('class', 'x brush')
                .call(brush)
                .selectAll('rect')
                .attr('y', -6)
                .attr('height', height);
        
            function brushed() {
                // let's see what's in the brush
                if (d3.event.sourceEvent.type === "brush") return;
                const min_selection = d3.event.selection[0];
                const max_selection = d3.event.selection[1];

                min_year_of_publication = x_inverted(min_selection).getUTCFullYear();
                max_year_of_publication = x_inverted(max_selection).getUTCFullYear();
                
                addOverlay();
                updateURL();
        
            } 


        });        
    }

    // point color function
    function pointOpacity(feature) {
        if (feature.properties.reliability_quality == "") {
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
        
        console.log(k);

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

    // function for updating url state
    function updateURL() {
        const obj = { foo: "bar" };
        const param_string = "/?min_year_of_publication="+min_year_of_publication+"&max_year_of_publication="+max_year_of_publication+"&min_study_size="+min_study_size+"&max_study_size="+max_study_size+"&min_prevalence_rate="+min_prevalence_rate+"&max_prevalence_rate="+max_prevalence_rate+"&category="+category+"&keyword="+keyword; 
        window.history.pushState(obj, "Updated URL Parameters", param_string);
        // set the links to the map and list to hold the url params
        $('#list-link').attr('href', "list" + param_string);
        $('#map-link').attr('href', param_string);
    }

    // listener to close card
    $("#card-close").click(function(){
        $("#more-information-card").css("display", "none");
    });
    
    // listeners for search term changes and filters
    $("#category").on("change", function(e) {
        $("#more-information-card").css("display", "none");
        // update filters
        category = $(this).val();
        // run update
        addOverlay();
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
        addOverlay();
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
        addOverlay();
        updateURL();
    });  

    $("#search").on('keydown', function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            $("#more-information-card").css("display", "none");
            keyword = $(this).val();
            // run update
            addOverlay();            
            updateURL();
        }
    });

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
