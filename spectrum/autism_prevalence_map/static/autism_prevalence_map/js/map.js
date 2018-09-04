
$(document).ready(function (){

    // constants
    const width = $("#map").width();
    const height = $("#map").height();
    
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
    // const graticule = d3.geoGraticule()
    //     .step([10, 10]);

    // g.append("g")
    //     .attr("id", "graticule")
    //     .append("path")
    //     .datum(graticule)
    //     .attr("class", "graticule")
    //     .attr("d", path);

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

        addOverlay();
    });

    // add overlay dataset
    function addOverlay() {      
        d3.json("/studies-api/").then(function(data) {
            studies = data;
            g.append("g")
                .attr("id", "studies")
                .selectAll("circle")
                .data(studies.features)
                .enter()
                .append("circle")
                .attr("cx", function (d) { return projection(d.geometry.coordinates)[0]; })
		        .attr("cy", function (d) { return projection(d.geometry.coordinates)[1]; })
                .attr("r", 5)
                .style("fill", "#1fcbec")
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
        const card_title = d.properties.authors + ' ' + d.properties.year
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
