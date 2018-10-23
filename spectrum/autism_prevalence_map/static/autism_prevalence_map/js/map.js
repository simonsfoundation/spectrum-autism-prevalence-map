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

    // create container for graticule
    const graticuleG = g.append("g")
        .attr("id", "graticule")

    // create container for countries
    const countriesG = g.append("g")
        .attr("id", "countries")

    // create container for studies
    const studiesG = g.append("g")
        .attr("id", "studies")

    // create container for timeline
    const timelineDiv = d3.select('#timeline'),
        timelineWidth = timelineDiv.node().offsetWidth - 15,
        timelineHeight = timeline_height;    
                
    const timelineSVG = timelineDiv.append('svg')
        .attr('width', timelineWidth)
        .attr('height', timelineHeight);

    // globaly scope some variables for the timeline
    let brush, brushG, timelineG, timelineX, timelineY, studiesByYear, handle, handleText;


    // add a graticule to the map
    const graticuleOutline = d3.geoGraticule().outline();
    const graticule = d3.geoGraticule10();

    function addGraticule() {
        graticuleG.append("path")
            .datum(graticuleOutline)
            .attr("class", "graticule")
            .attr("d", path);

        graticuleG.append("path")
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

        countriesG.append("path")
            .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
            .attr("id", "country-borders")
            .attr("d", path);

        app.map.initializeTimeline();
        addGraticule();
    });

    // pull data and update timeline function
    app.map.pullDataAndUpdate = function() {
        d3.json("/studies-api/?min_yearpublished="+min_yearpublished+"&max_yearpublished="+max_yearpublished+"&min_samplesize="+min_samplesize+"&max_samplesize="+max_samplesize+"&min_prevalenceper10000="+min_prevalenceper10000+"&max_prevalenceper10000="+max_prevalenceper10000+"&studytype="+studytype+"&keyword="+keyword).then(function(data) {
            studies = data;
            app.map.updateTimeline();
            app.updateURL();
        });
    }

    // pull data and update timeline function
    app.map.initializeTimeline = function() {
        d3.json("/studies-api/").then(function(data) {
            studies = data;
            app.map.addTimeline();
        });
    }

    app.map.addTimeline = function() {
        // add the x brush
        brush = d3.brushX()
            .extent([[50, 0], [timelineWidth-50, timelineHeight-20]])
            .on("end", brushed)
            .on("start brush", moveHandles);
            
        brushG = timelineSVG.append('g')
            .attr('class', 'x brush')
            .call(brush);               

        timelineG = timelineSVG.append('g')
            .attr('class', 'timeline-circles');
           
        studiesByYear = d3.nest()
            .key(function(d) { return d.properties.yearpublished; })
            .rollup(function(v) { return v.length; })
            .entries(studies.features);
            
        for (let index = 0; index < studiesByYear.length; index++) {
            studiesByYear[index].count = 0;
        }

        const timeMin = d3.min(studies.features, function(d) { return new Date(d.properties.yearpublished); });
        const timeMax = d3.max(studies.features, function(d) { return new Date(d.properties.yearpublished); });

        timelineX = d3.scaleTime()
            .range([50, timelineWidth-50])
            .domain([timeMin, timeMax])
            .nice(d3.timeYear);        

        timelineY = d3.scaleLinear()
            .range([timelineHeight-25, 20])
            .domain([1, d3.max(studiesByYear, function(d) { return d.value; })]);


        // Add the x axis
        const axisHeight = timelineHeight - 20;
        timelineSVG.append("g")
            .attr("transform", "translate(0," + axisHeight + ")")
            .classed("timeline-axis", true)
            .call(d3.axisBottom(timelineX).ticks(5).tickSize(-10).tickPadding(6));
        

        handle = brushG.selectAll(".handle--custom")
            .data([{type: "w"}, {type: "e"}])
            .enter().append("circle")
                .classed("handle--custom", true)
                .attr("r", 2)
                .attr("fill", "#fff")
                .attr("fill-opacity", 0.8)
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5)
                .attr("cursor", "ew-resize")
                .attr("display", "none");

                
        handleText = brushG.selectAll(".handle--text")
            .data([{type: "w"}, {type: "e"}])
            .enter().append("text")
            .classed("handle--text", true)
            .attr("y", timelineHeight / 2.1)
            .attr("dy", ".35em")
            .attr("fill", "#fff")
            .attr("font-size", "10px")
            .attr("text-anchor", "start")
            .attr("display", "none");

        function brushed() {
            if (!d3.event.selection) return; // Ignore empty selections.
        
            const s = d3.event.selection, 
                d0 = d3.event.selection.map(timelineX.invert),
                d1 = [];

            d1[0] = d3.timeYear.ceil(d0[0]);
            d1[1] = d3.timeYear.floor(d0[1]);
    
            min_yearpublished = d1[0].getUTCFullYear();
            max_yearpublished = d1[1].getUTCFullYear();
    
            app.map.pullDataAndUpdate();
        } 

        function moveHandles() {
            if (!d3.event.selection) return; // Ignore empty selections.

            d3.select('.selection').attr("display", null);

            hideCard();
        
            const s = d3.event.selection, 
                d0 = d3.event.selection.map(timelineX.invert),
                d1 = [];

            d1[0] = d3.timeYear.ceil(d0[0]);
            d1[1] = d3.timeYear.floor(d0[1]);
    
            if (s == null) {
                handle.attr("display", "none");
                handleText.attr("display", "none");
            } else {
                handle
                    .attr("display", null)
                    .attr("transform", function(d, i) { 
                        return "translate(" + s[i] + "," + timelineHeight / 2.1 + ")"; 
                    });
    
                handleText
                    .attr("display", null)
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
    
        } 
        
        if (min_yearpublished || max_yearpublished) {
            let brush_min, brush_max;
            if (min_yearpublished) {
                brush_min = new Date(min_yearpublished);
            } else {
                brush_min = timeMin;
            }

            if (max_yearpublished) {
                brush_max = new Date(max_yearpublished);
            } else {
                brush_max = timeMax;
            }

            brushG.call(brush.move, [brush_min, brush_max].map(timelineX));

        }
        

        app.map.pullDataAndUpdate();
                    
    }

    app.map.updateTimeline = function() {

        studiesByYear = d3.nest()
            .key(function(d) { return d.properties.yearpublished; })
            .rollup(function(v) { return v.length; })
            .entries(studies.features);
            
        for (let index = 0; index < studiesByYear.length; index++) {
            studiesByYear[index].count = 0;
        }

        
        const timelineSelection = timelineG.selectAll('circle.timeline-circles')
            .data(studies.features, function(d){ return d.properties.pk });


        timelineSelection
            .transition()
            .duration(500)
            .attr('transform', function(d) {
                let count = 0;
                for (let index = 0; index < studiesByYear.length; index++) {
                    if (studiesByYear[index].key == d.properties.yearpublished) {
                        studiesByYear[index].count++;
                        count = studiesByYear[index].count;
                    }
                }
                let date = new Date(d.properties.yearpublished)
                return 'translate(' + [timelineX(date), timelineY(count)] + ')';
            })

        timelineSelection.enter()
            .append('circle')
            .attr('transform', function(d) {
                let count = 0;
                for (let index = 0; index < studiesByYear.length; index++) {
                    if (studiesByYear[index].key == d.properties.yearpublished) {
                        studiesByYear[index].count++;
                        count = studiesByYear[index].count;
                    }
                }
                let date = new Date(d.properties.yearpublished)
                return 'translate(' + [timelineX(date), timelineY(count)] + ')';
            })
            .attr("r", 5)
            .style("fill", pointColor)
            .style("fill-opacity", "1")
            .style("stroke", "#fff")
            .style("stroke-width", "0")
            .classed("timeline-circles", true)
            .attr("id", function(d){
                return "timeline_dot_" + d.properties.pk
            })
            .attr("data-toggle", "tooltip")
            .attr("data-placement", "top")
            .attr("title", function(d){
                return d.properties.authors + ' ' + d.properties.yearpublished
            })
            .on("click", viewMoreInfo)
            .on("mouseover", function(d) {
                showTimelineTooltip(d);
                d3.select(this).style("cursor", "pointer");
                showDotOnMap(d);
            })
            .on("mouseout", function() {
                d3.select(this).style("cursor", "default");
                hideTimelineTooltip();
                if (!clicked) {
                    hideDotsOnMap();
                }
            });

        timelineSelection.exit()
            .transition()
            .duration(500)
            .style("fill-opacity", "0")
            .remove();

        app.map.updateMapPoints();
  
    }

    app.map.clearTimelineBrush = function() {
        d3.select('.selection').attr("display", "none");
        handle.attr("display", "none");
        handleText.attr("display", "none");
    }

    // add overlay dataset
    app.map.updateMapPoints = function() {   
        const mapSelection = studiesG.selectAll("circle.map-circles")
            .data(studies.features, function(d){ return d.properties.pk });

        mapSelection.enter()
            .append("circle")
            .attr("cx", function (d) { return projection(d.geometry.coordinates)[0]; })
            .attr("cy", function (d) { return projection(d.geometry.coordinates)[1]; })
            .attr("r", 5)
            .style("fill", pointColor)
            .style("fill-opacity", "1")
            .style("stroke", "#fff")
            .style("stroke-width", "0")
            .classed("map-circles", true)
            .attr("id", function(d){
                return "map_dot_" + d.properties.pk
            })
            .on("click", viewMoreInfo)
            .on("mouseover", function(d) {
                showTimelineTooltip(d);
                d3.select(this).style("cursor", "pointer");
                showDotOnMap(d);
            })
            .on("mouseout", function() {
                d3.select(this).style("cursor", "default");
                hideTimelineTooltip();
                if (!clicked) {
                    hideDotsOnMap();
                }
            });
            
        mapSelection.exit().remove();
        
        //app.map.clusterPoints(studies);
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



    // point color function
    function pointColor(feature) {
        if (feature.properties.recommended == "yes" || feature.properties.recommended == "Yes") {
            return "#03C0FF";
        } else {
            return "#007095";
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
        //scalePins(d3.event.transform.k);
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
        d3.selectAll('.map-circles').transition()
            .duration(100)
            .attr("r", new_radius);

        // select all pins and apply new stroke width on hover
        // d3.selectAll('.map-circles')
        //     .on("mouseover", function(d) {
        //         d3.select(this).style("cursor", "pointer"); 
        //         d3.select(this).style("stroke-width", new_radius/2.5);            
        //     });
    }

    // set up listeners for zoom
    d3.selectAll('button').on('click', function() {
        // zoom in 0.5 each time
        if (this.id === 'zoom-in') {
            transition(1.5); 
            //scalePins(-1);
        }
        // zoom out 0.5 each time
        if (this.id === 'zoom-out') {
            transition(0.7);
            //scalePins(1); 
        }
        // return to initial state
        if (this.id === 'zoom_init') {
            svg_zoom.transition()
                .duration(500)
                .call(zoom.scaleTo, 1); 
        }
    });

    // highlight dot on map
    function showDotOnMap(d) {
        // hide any dots showing up on map
        d3.selectAll(".map-circles")
            .style("stroke-width", "0");
            
        // show clicked dot on map
        d3.select('#map_dot_' + d.properties.pk)
            .style("stroke-width", "2");        
    }

    // remove highlighting from dots on map
    function hideDotsOnMap() {
        d3.selectAll(".map-circles")
            .style("stroke-width", "0");
    }


    // show tooltip on timeline dot
    function showTimelineTooltip(d) {
        // hide any tooltips that are already showing up on the timeline
        d3.selectAll(".timeline-circles")
            .style("stroke-width", "0");
        $(".tooltip").tooltip("hide");

        // now show the one hovered or clicked on
        d3.select('#timeline_dot_' + d.properties.pk)
            .style("stroke-width", "2");
        $('#timeline_dot_' + d.properties.pk).tooltip('show');
    }

    // remove all tooltips from timeline
    function hideTimelineTooltip() {
        if (!clicked) {
            d3.selectAll(".timeline-circles")
                .style("stroke-width", "0");
            $(".tooltip").tooltip("hide");
        }
    }

    // function for launching more information card
    function viewMoreInfo(d) {
        // set clicked flag variable to true
        clicked = true;

        // show clicked dot
        showDotOnMap(d);

        // show tooltip on timeline
        showTimelineTooltip(d);

        // add data to card
        const card_title = d.properties.authors + ' ' + d.properties.yearpublished;
        const area = d.properties.area.replace(/ *([|]) */g, '$1').split('|').join(', ');
        const age = d.properties.age.replace(/ *([|]) */g, '$1').split('|').join(', ');
        const diagnosticcriteria = d.properties.diagnosticcriteria.replace(/ *([|]) */g, '$1').split('|').join(', ');
        const prevalenceper10000 = d.properties.prevalenceper10000.replace(/ *([|]) */g, '$1').split('|').join(', ');
        const confidenceinterval = d.properties.confidenceinterval.replace(/ *([|]) */g, '$1').split('|').join(', ');
        $("#card-title").text(card_title);
        $("#card-country").text(d.properties.country);
        $("#card-area").text(area);
        $("#card-samplesize").text(d.properties.samplesize);
        $("#card-age").text(age);
        $("#card-diagnosticcriteria").text(diagnosticcriteria);
        $("#card-percentwaverageiq").text(d.properties.percentwaverageiq);
        $("#card-sexratiomf").text(d.properties.sexratiomf);
        $("#card-prevalenceper10000").text(prevalenceper10000);
        $("#card-confidenceinterval").text(confidenceinterval);
        
        // show card
        $("#more-information-card").css("display", "block");
    }

    // listener to close card
    $("#card-close").click(function(){
        hideCard();
    });

    function hideCard() {
        $("#more-information-card").css("display", "none");
        // set clicked flag variable to false
        clicked = false;
        hideDotsOnMap();
        hideTimelineTooltip();
    }
    
});
