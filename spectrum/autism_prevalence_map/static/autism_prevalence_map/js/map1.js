$(document).ready(function (){

    // app.map scope
    app.map = {};

    // constants
    const width = $("#map").width();
    const height = $("#map").height();
    const timeline_height = $("#timeline").height();
    
    // data holder
    let studies = null;

    // have any points been clicked 
    let clicked = false;

    // map projection
    const projection = d3.geoKavrayskiy7()
        .scale(250)
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

        
    // create g container for world map    
    const g = svg.append("g")
        .attr('id', 'g');

    // create container for countries
    const countriesG = g.append("g")
        .attr("id", "countries")

    // create container for studies
    const studiesG = g.append("g")
        .attr("id", "studies")

    // add a graticule to the map
    const graticule = d3.geoGraticule10();

    function addGraticule() {
        g.append("g")
            .attr("id", "graticule")
            .append("path")
            .datum(graticule)
            .attr("class", "graticule")
            .attr("d", path);
    }

    // set up clusering grid
    let clusterPoints = [];
    let clusterRange = 45;
    let quadtree;
    
    const grid = svg.append('g')
        .attr('class', 'grid');
    
    for (let x = 0; x <= width; x += clusterRange) {
        for (let y = 0; y <= height; y+= clusterRange) {
        grid.append('rect')
            .attr({
                x: x,
                y: y,
                width: clusterRange,
                height: clusterRange,
                class: "grid"
            });
        }
    }

    // add map data to the world map g container
    d3.json(world_atlas).then(function(world) {
        countriesG.selectAll("path")
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

        //app.map.addOverlay();
        app.map.addTimeline();
        addGraticule();
    });

    // add overlay dataset
    app.map.addOverlay = function() {
        studiesG.selectAll(".pin").remove();    
        d3.json("/studies-api/?min_year_of_publication="+min_year_of_publication+"&max_year_of_publication="+max_year_of_publication+"&min_study_size="+min_study_size+"&max_study_size="+max_study_size+"&min_prevalence_rate="+min_prevalence_rate+"&max_prevalence_rate="+max_prevalence_rate+"&methodology="+methodology+"&keyword="+keyword).then(function(data) {
            studies = data;
            studiesG.selectAll("circle.map")
                .data(studies.features)
                .enter()
                .append("circle")
                .attr("cx", function (d) { return projection(d.geometry.coordinates)[0]; })
		        .attr("cy", function (d) { return projection(d.geometry.coordinates)[1]; })
                .attr("r", 5)
                .style("fill", "#009bcc")
                .style("fill-opacity", pointOpacity)
                .style("stroke", "#fff")
                .style("stroke-width", "0")
                .classed("pin", true)
                .attr("id", function(d){
                    return "map_dot_" + d.properties.pk
                })
                .on("click", viewMoreInfo)
                .on("mouseover", function(d) {
                    showTimelineTooltip(d);
                    d3.select(this).style("cursor", "pointer"); 
                    d3.select(this).style("stroke-width", "2");
                })
                .on("mouseout", function(d) {
                    hideTimelineTooltip();
                    d3.select(this).style("cursor", "default");
                    d3.select(this).style("stroke-width", "0");
                });
            app.map.clusterPoints(studies)
        });
    }

    // function that determines if points are inside the quad tree
    app.map.inQuadTree = function(quadtree, x0, y0, x3, y3) {
        // Find the nodes within the specified rectangle.
        let validData = [];
        quadtree.visit(function(node, x1, y1, x2, y2) {
            const p = node.point;
            if (p) {
                p.selected = (p[0] >= x0) && (p[0] < x3) && (p[1] >= y0) && (p[1] < y3);
                if (p.selected) {
                    validData.push(p);
                }
            }
            return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
        });
        return validData;
    }

    app.map.clusterPoints = function(points) {
        const pointsRaw = points.features.map(function(d, i) {
            const point = path.centroid(d);
            point.push(i);
            return point;
        });
        
        quadtree = d3.geom.quadtree()(pointsRaw);

        for (let x = 0; x <= width; x += clusterRange) {
            for (let y = 0; y <= height; y+= clusterRange) {
                const searched = search(quadtree, x, y, x + clusterRange, y + clusterRange);
            
                const centerPoint = searched.reduce(function(prev, current) {
                    return [prev[0] + current[0], prev[1] + current[1]];
                }, [0, 0]);
            
                centerPoint[0] = centerPoint[0] / searched.length;
                centerPoint[1] = centerPoint[1] / searched.length;
                centerPoint.push(searched);
            
                if (centerPoint[0] && centerPoint[1]) {
                    clusterPoints.push(centerPoint);
                }
            }
        }
          
        const pointSizeScale = d3.scaleLinear()
            .domain([
                d3.min(clusterPoints, function(d) {return d[2].length;}),
                d3.max(clusterPoints, function(d) {return d[2].length;})
            ])
            .rangeRound([3, 15]);
    
        g.append("g")
            .attr("id", "clusters")
            .selectAll(".centerPoint")
            .data(clusterPoints)
            .enter().append("circle")
            .attr("class", function(d) {return "centerPoint"})
            .attr("cx", function(d) {return d[0];})
            .attr("cy", function(d) {return d[1];})
            .attr("fill", '#FFA500')
            .attr("r", function(d, i) {return pointSizeScale(d[2].length);})
            .on("click", function(d, i) {
                console.log(d, pointSizeScale(d[2].length));
            })
    }




    app.map.addTimeline = function() {
        d3.selectAll(".studies-on-timeline").remove(); 
        d3.json("/studies-api/?min_study_size="+min_study_size+"&max_study_size="+max_study_size+"&min_prevalence_rate="+min_prevalence_rate+"&max_prevalence_rate="+max_prevalence_rate+"&methodology="+methodology+"&keyword="+keyword).then(function(data) {

            const container = d3.select('#timeline'),
                width = container.node().offsetWidth - 15,
                height = timeline_height;

            const timeMin = d3.min(data.features, function(d) { return new Date(d.properties.year_of_publication); });
            const timeMax = d3.max(data.features, function(d) { return new Date(d.properties.year_of_publication); });

            timeMin.setFullYear(timeMin.getFullYear() - 1);
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
                .range([50, width-50])
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
                    //date.setMonth(date.getMonth());
                    return 'translate(' + [x(date), y(count)] + ')';
                })
                .attr("r", 5)
                .style("fill", "#009bcc")
                .style("fill-opacity", pointOpacity)
                .style("stroke", "#fff")
                .style("stroke-width", "0")
                .classed("studies-on-timeline", true)
                .attr("id", function(d){
                    return "timeline_dot_" + d.properties.pk
                })
                .attr("data-toggle", "tooltip")
                .attr("data-placement", "top")
                .attr("title", function(d){
                    return d.properties.authors + ' ' + d.properties.year_of_publication
                });

            // Add the x axis
            const axisHeight = height - 20;
            svg.append("g")
                .attr("transform", "translate(0," + axisHeight + ")")
                .classed("timeline-axis", true)
                .call(d3.axisBottom(x).ticks(5).tickSize(-10).tickPadding(6));
        
            // add the x brush
            const gBrush = context.append('g')
                .attr('class', 'x brush')
                .call(brush);

            const handle = gBrush.selectAll(".handle--custom")
                .data([{type: "w"}, {type: "e"}])
                .enter().append("circle")
                  .classed("handle--custom", true)
                  .attr("r", 2)
                  .attr("fill", "#fff")
                  .attr("fill-opacity", 0.8)
                  .attr("stroke", "#fff")
                  .attr("stroke-width", 1.5)
                  .attr("cursor", "ew-resize")

            const handleRect = gBrush.selectAll(".handle--rect")
                .data([{type: "w"}, {type: "e"}])
                .enter().append('rect')
                .classed("handle--rect", true)
                .attr("fill", '#fff')
                .attr("fill-opacity", 1)
                // .attr("stroke", "#666")
                // .attr("stroke-weight", "0.5px")
                .attr("y", height / 2.35)
                .attr('height', 15)
                .attr("width", 30);
                
            const handleText = gBrush.selectAll(".handle--text")
                .data([{type: "w"}, {type: "e"}])
                .enter().append("text")
                  .classed("handle--text", true)
                  .attr("y", height / 2.1)
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

                if (s == null) {
                    handle.attr("display", "none");
                } else {
                    handle
                        .attr("display", null)
                        .attr("transform", function(d, i) { 
                            return "translate(" + s[i] + "," + height / 2.1 + ")"; 
                        });

                    handleRect
                        .attr("x", function(d, i) {
                            if (i === 0) {
                                return s[i] - 33;
                            } else {
                                return s[i] + 3;
                            }
                        })

                    handleText
                        .attr("x", function(d, i) {
                            if (i === 0) {
                                return s[i] - 30;
                            } else {
                                return s[i] + 6;
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

    // show tooltip on timeline dot
    function showTimelineTooltip(d) {
        d3.select('#timeline_dot_' + d.properties.pk)
            .style("stroke-width", "2");
        $('#timeline_dot_' + d.properties.pk).tooltip('show');
    }

    // remove all tooltips from timeline
    function hideTimelineTooltip() {
        if (!clicked) {
            d3.selectAll(".studies-on-timeline")
                .style("stroke-width", "0");
            $(".tooltip").tooltip("hide");
        }
    }

    // function for launching more information card
    function viewMoreInfo(d) {
        // set clicked flag variable to true
        clicked = true;
        // show tooltip on timeline
        showTimelineTooltip(d);

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
        // set clicked flag variable to false
        clicked = false;
        hideTimelineTooltip();
    });
    
});
