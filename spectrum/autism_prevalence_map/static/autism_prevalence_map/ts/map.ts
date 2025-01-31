import { app } from './app.js';

export function ttInitMap() {
    $(document).ready(function (){
        // app.map scope
        app.map = {};

        // globaly scope some variables for the map
        let studies, clicked, clickedCircleId, projection, path, width, height, scale, svg, g, graticuleG, countriesG, studiesG, g_zoom, svg_zoom, zoom, new_radius, nodes, simulation;

        // functions for adding a graticule to the map
        const graticuleOutline = d3.geoGraticule().outline();
        const graticule = d3.geoGraticule10();

        // globaly scope some variables for the timeline
        let timeline_height, brush, brushG, timelineDiv, timelineSVG, timelineG, timelineX, timelineY, max_Y_domain, studiesByYear, handle, handleText, timeMin, timeMax;


        // add map data to the world map g container
        app.map.initializeMap = function() {
            // remove containers if they exist
            d3.select('#map-svg').remove();
            d3.select('#timeline-svg').remove();

            // constants
            width = $('#map').width();
            height = $('#map').height();
            timeline_height = $('#timeline').height();

            if (width < 567) {
                scale = 100;
                // close filter drawers
                $('#filter-list').addClass('invisible');
                $('#filter-list').removeClass('visible');
                $('#filters-link').prop('title', 'Open fliter drawer').attr('data-original-title', 'Open fliter drawer');            
            } else if (width < 992) {
                scale = 150;
            } else if (width < 1800) {
                scale = 190;
            } else {
                scale = 280;
            }
            
            // data holder
            studies = null;

            // have any points been clicked?
            clicked = false;

            // map projection
            projection = d3.geoKavrayskiy7()
                .scale(scale)
                .translate([width / 2, height / 2]);

            // function to create paths from map projection
            path = d3.geoPath().projection(projection);

            // create svg container and apply zoom function
            svg = d3.select('#map')
                .append('svg')
                .attr('id', 'map-svg')
                .attr('width', width)
                .attr('height', height);

            // create g container for world map    
            g = svg.append('g')
                .attr('id', 'map-g');

            // create container for graticule
            graticuleG = g.append('g')
                .attr('id', 'graticule');

            // create container for countries
            countriesG = g.append('g')
                .classed('countries fill-dark-tan', true);

            // create container for studies
            studiesG = g.append('g')
                .attr('id', 'studies');

            // set up map for zooming
            g_zoom = d3.select('#map-g');
            svg_zoom = d3.select('#map-svg');

            zoom = d3.zoom()
                .scaleExtent([0.75, 5])
                .on('zoom', zoomed);

            svg_zoom.call(zoom);

            // define zooming function for zooming map
            function zoomed() {
                //g_zoom.style('stroke-width', 1.5 / d3.event.scale + 'px');
                g_zoom.attr('transform', `translate(${d3.event.transform.x},  ${d3.event.transform.y}) scale(${d3.event.transform.k})`);
                // set pin sizes based on zoom level
                scalePins(d3.event.transform.k);
                
            };
            

            // create container for timeline
            timelineDiv = d3.select('#timeline'),
                timelineWidth = timelineDiv.node().offsetWidth - 45,
                timelineHeight = timeline_height; 
        
            timelineSVG = timelineDiv.append('svg')
                .attr('id', 'timeline-svg')
                .attr('width', timelineWidth)
                .attr('height', timelineHeight);

            d3.json(world_atlas).then(function(world) {
                countriesG.selectAll('path')
                    .data(topojson.feature(world, world.objects.countries).features.filter(function(d){
                        if (d.id !== '010') {
                            return d;
                        }
                    }))
                    .enter().append('path')
                    .attr('d', path)
                    .attr('id', function(d) {
                        return d.id;
                    });
        
                countriesG.append('path')
                    .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
                    .classed('country-borders stroke-tan', true)
                    .attr('d', path);

                graticuleG.append('path')
                    .datum(graticuleOutline)
                    .attr('class', 'graticule fill-none stroke-dark-tan stroke-[0.5px]')
                    .attr('d', path);

                graticuleG.append('path')
                    .datum(graticule)
                    .attr('class', 'graticule fill-none stroke-dark-tan stroke-[0.5px]')
                    .attr('d', path);  
                    
                app.map.initializeTimeline();

            });        
        }

        // pull data and update timeline function
        app.map.pullDataAndUpdate = function() {
            app.updateURL();
            d3.json('/studies-api/' + app.api_call_param_string).then(function(data) {
                studies = data;   
                app.map.updateTimeline();
            });
        }

        // pull data and update timeline function
        app.map.initializeTimeline = function() {
            d3.json('/studies-api/').then(function(data) {
                studies = data;
                app.map.addTimeline();
            });
        }

        app.map.addTimeline = function() {
            timeMin = d3.min(studies.features, function(d) { return new Date(d.properties.yearsstudied_number_min); });
            timeMax = d3.max(studies.features, function(d) { return new Date(d.properties.yearpublished); });
            timeMax.setUTCFullYear(timeMax.getUTCFullYear() + 1);
            // add the x brush
            brush = d3.brushX()
                .extent([[50, 0], [timelineWidth-50, timelineHeight-20]])
                .on('end', brushed)
                .on('start brush', moveHandles);
                
            brushG = timelineSVG.append('g')
                .attr('class', 'x brush')
                .call(brush);               

            timelineG = timelineSVG.append('g')
                .attr('class', 'timeline-circles');
               
            timelineX = d3.scaleTime()
                .range([50, timelineWidth-50])
                .domain([timeMin, timeMax])
                .nice(d3.timeYear);        



            timelineY = d3.scaleLinear()
                .range([timelineHeight-30, 10]);

            // Add the x axis
            const axisHeight = timelineHeight - 20;
            timelineSVG.append('g')
                .attr('transform', 'translate(0,' + axisHeight + ')')
                .classed('timeline-axis', true)
                .call(d3.axisBottom(timelineX).ticks(5).tickSize(6).tickPadding(3));
            

            handle = brushG.selectAll('.handle--custom')
                .data([{type: 'w'}, {type: 'e'}])
                .enter().append('circle')
                    .classed('handle--custom', true)
                    .attr('r', 2)
                    .attr('fill', '#fff')
                    .attr('fill-opacity', 0.8)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 1.5)
                    .attr('cursor', 'ew-resize')
                    .attr('display', 'none');

                    
            handleText = brushG.selectAll('.handle--text')
                .data([{type: 'w'}, {type: 'e'}])
                .enter().append('text')
                .classed('handle--text', true)
                .attr('y', timelineHeight / 2.2)
                .attr('dy', '.35em')
                .attr('fill', '#fff')
                .attr('font-size', '12px')
                .attr('text-anchor', 'start')
                .attr('display', 'none');

            function brushed() {
                if (!d3.event.selection) return; // Ignore empty selections.
            
                const s = d3.event.selection, 
                    d0 = d3.event.selection.map(timelineX.invert),
                    d1 = [];

                d1[0] = d3.timeYear.ceil(d0[0]);
                d1[1] = d3.timeYear.floor(d0[1]);

                if(timeline_type == 'studied') {
                    yearsstudied_number_min = d1[0].getUTCFullYear();
                    yearsstudied_number_max = d1[1].getUTCFullYear();
                } else {
                    min_yearpublished = d1[0].getUTCFullYear();
                    max_yearpublished = d1[1].getUTCFullYear();    
                }

                app.map.pullDataAndUpdate();
            } 

            function moveHandles() {
                if (!d3.event.selection) return; // Ignore empty selections.

                d3.select('.selection').attr('display', null);

                hideCard();
            
                const s = d3.event.selection, 
                    d0 = d3.event.selection.map(timelineX.invert),
                    d1 = [];

                d1[0] = d3.timeYear.ceil(d0[0]);
                d1[1] = d3.timeYear.floor(d0[1]);
        
                if (s == null) {
                    handle.attr('display', 'none');
                    handleText.attr('display', 'none');
                } else {
                    handle
                        .attr('display', null)
                        .attr('transform', function(d, i) { 
                            return 'translate(' + s[i] + ',' + timelineHeight / 2.2 + ')'; 
                        });
        
                    handleText
                        .attr('display', null)
                        .attr('x', function(d, i) {
                            if (i === 0) {
                                return s[i] - 32;
                            } else {
                                return s[i] + 4;
                            }
                        })
                        .text(function(d, i) { 
                            return d1[i].getUTCFullYear(); 
                        });
                }
        
            } 
            
            let min_year, max_year;
            if(timeline_type == 'studied') {
                min_year = yearsstudied_number_min;
                max_year = yearsstudied_number_max;
            } else {
                min_year = min_yearpublished
                max_year = max_yearpublished    
            }


            if (min_year || max_year) {
                let brush_min, brush_max;
                if (min_year) {
                    brush_min = new Date(min_year);
                } else {
                    brush_min = timeMin;
                }

                if (max_year) {
                    brush_max = new Date(max_year);
                } else {
                    brush_max = timeMax;
                }
                brushG.call(brush.move, [brush_min, brush_max].map(timelineX));

            }
            

            app.map.pullDataAndUpdate();
                        
        }

        app.map.updateTimeline = function() {

            if(timeline_type == 'studied') {
                // count the years in which each study was operative for calculating the max domain
                studiesByYear = [];
                let yearsstudied_min, yearsstudied_max;
                const mostRecentYear = timeMax.getUTCFullYear();

                for (let index = 1960; index <= mostRecentYear; index++) {
                    studiesByYear.push({key: index.toString(), value: 0});
                }
                for (let index = 0; index < studies.features.length; index++) {                
                    if (studies.features[index].properties.yearsstudied_number_min) {
                        yearsstudied_min = studies.features[index].properties.yearsstudied_number_min.split('-');
                    } else {
                        yearsstudied_min = [0, 0];
                    }
                    if (studies.features[index].properties.yearsstudied_number_max) {
                        yearsstudied_max = studies.features[index].properties.yearsstudied_number_max.split('-');
                    } else {
                        yearsstudied_max = yearsstudied_min;
                    }
                    for (let j = parseInt(yearsstudied_min[0]); j <= parseInt(yearsstudied_max[0]); j++) {
                        for (let k = 0; k < studiesByYear.length; k++) {
                            if (studiesByYear[k].key == j) {
                                studiesByYear[k].value++ 
                            } 
                        }
                    }
                }
            } else {
                studiesByYear = d3.nest()
                    .key(function(d) { return d.properties.yearpublished; })
                    .rollup(function(v) { return v.length; })
                    .entries(studies.features);
            }

            max_Y_domain = d3.max(studiesByYear, function(d) { return d.value; }) + 1;
            timelineY
                .domain([1, max_Y_domain]);

            // set count = 0 for each year for every year studied/published and
            // set up battleship grid in studiesByYear to mark where pills are when plotted
            for (let index = 0; index < studiesByYear.length; index++) {
                studiesByYear[index].count = 0;
                studiesByYear[index].grid = [];
                for (let j = 0; j < max_Y_domain; j++) {
                    studiesByYear[index].grid.push(0);
                }
            }


            let timelineSelection;
            if(timeline_type == 'studied') {
                timelineSelection = timelineG.selectAll('rect.timeline-circles')
                    .data(studies.features.sort(function(a,b) {
                        return b.properties.num_yearsstudied - a.properties.num_yearsstudied; 
                    }), function(d){ return d.properties.pk });

            } else {
                timelineSelection = timelineG.selectAll('rect.timeline-circles')
                    .data(studies.features, function(d){ return d.properties.pk });
            }


            timelineSelection
                .transition()
                .duration(1000)
                .attr('x', function(d){
                    if(timeline_type == 'studied') {
                        let date = new Date(d.properties.yearsstudied_number_min);
                        return timelineX(date);
                    } else {
                        let date = new Date(d.properties.yearpublished)
                        return timelineX(date);
                    }
                })
                .attr('y', function(d){
                    let count = 0;
                    if(timeline_type == 'studied') {                    
                        if (d.properties.yearsstudied_number_min) {
                            yearsstudied_min = d.properties.yearsstudied_number_min.split('-');
                        }
                        if (d.properties.yearsstudied_number_max) {
                            yearsstudied_max = d.properties.yearsstudied_number_max.split('-');
                        } else {
                            yearsstudied_max = yearsstudied_min;
                        }

                        // check to see if grid has already been marked as used across the pill
                        // which y grid cell does every value = 0?
                        let largestK = 1;
                        for (let j = parseInt(yearsstudied_min[0]); j <= parseInt(yearsstudied_max[0]); j++) {
                            for (let index = 0; index < studiesByYear.length; index++) {
                                if (studiesByYear[index].key == j) {
                                    for (let k = largestK; k <= max_Y_domain; k++) {
                                        if (studiesByYear[index].grid[k] == 0) {
                                            largestK = k;
                                            break;
                                        } 
                                    }                                
                                }
                            }
                        }
                        
                        // mark grid cells as already filled
                        for (let j = parseInt(yearsstudied_min[0]); j <= parseInt(yearsstudied_max[0]); j++) {
                            for (let index = 0; index < studiesByYear.length; index++) {
                                if (studiesByYear[index].key == j) {
                                    studiesByYear[index].grid[largestK] = 1;
                                }
                            }
                        }
                        return timelineY(largestK);
                    } else {
                        for (let index = 0; index < studiesByYear.length; index++) {
                            if (studiesByYear[index].key == d.properties.yearpublished) {
                                studiesByYear[index].count++;
                                count = studiesByYear[index].count;
                            }
                        }
                        return timelineY(count);
                    }
                })
                .attr('width', function(d){
                    if(timeline_type == 'studied') {
                        let mindate, maxdate;
                        if (d.properties.yearsstudied_number_min) {
                            mindate = new Date(d.properties.yearsstudied_number_min);
                        }
                        if (d.properties.yearsstudied_number_max) {
                            maxdate = new Date(d.properties.yearsstudied_number_max);
                        } else {
                            return 8;
                        }
                        return (timelineX(maxdate) - timelineX(mindate)) + 8;

                    } else {
                        return 8;
                    }   
                })
                .attr('height', function(d){
                    if(timeline_type == 'studied') {
                        return 4
                    } else {
                        return 8
                    }
                })
                .attr('rx', function(d){
                    if(timeline_type == 'studied') {
                        return 2
                    } else {
                        return 4
                    }
                })
                .attr('ry', function(d){
                    if(timeline_type == 'studied') {
                        return 2
                    } else {
                        return 4
                    }
                });

            timelineSelection.enter()
                .append('rect')
                .attr('x', function(d){
                    if(timeline_type == 'studied') {
                        let date = new Date(d.properties.yearsstudied_number_min);
                        return timelineX(date);
                        //return d.x;
                    } else {
                        let date = new Date(d.properties.yearpublished)
                        return timelineX(date);
                    }
                })
                .attr('y', function(d){
                    let count = 0;
                    if(timeline_type == 'studied') {                    
                        if (d.properties.yearsstudied_number_min) {
                            yearsstudied_min = d.properties.yearsstudied_number_min.split('-');
                        }
                        if (d.properties.yearsstudied_number_max) {
                            yearsstudied_max = d.properties.yearsstudied_number_max.split('-');
                        } else {
                            yearsstudied_max = yearsstudied_min;
                        }

                        // check to see if grid has already been marked as used across the pill
                        // which y grid cell does every value = 0?
                        let largestK = 1;
                        for (let j = parseInt(yearsstudied_min[0]); j <= parseInt(yearsstudied_max[0]); j++) {
                            for (let index = 0; index < studiesByYear.length; index++) {
                                if (studiesByYear[index].key == j) {
                                    for (let k = largestK; k <= max_Y_domain; k++) {
                                        if (studiesByYear[index].grid[k] == 0) {
                                            largestK = k;
                                            break;
                                        } 
                                    }                                
                                }
                            }
                        }
                        
                        // mark grid cells as already filled
                        for (let j = parseInt(yearsstudied_min[0]); j <= parseInt(yearsstudied_max[0]); j++) {
                            for (let index = 0; index < studiesByYear.length; index++) {
                                if (studiesByYear[index].key == j) {
                                    studiesByYear[index].grid[largestK] = 1;
                                }
                            }
                        }
                        return timelineY(largestK);
                    } else {
                        for (let index = 0; index < studiesByYear.length; index++) {
                            if (studiesByYear[index].key == d.properties.yearpublished) {
                                studiesByYear[index].count++;
                                count = studiesByYear[index].count;
                            }
                        }
                        return timelineY(count);
                    }
                })
                .attr('width', function(d){
                    if(timeline_type == 'studied') {
                        let mindate, maxdate;
                        if (d.properties.yearsstudied_number_min) {
                            mindate = new Date(d.properties.yearsstudied_number_min);
                        }
                        if (d.properties.yearsstudied_number_max) {
                            maxdate = new Date(d.properties.yearsstudied_number_max);
                        } else {
                            return 8;
                        }
                        return (timelineX(maxdate) - timelineX(mindate)) + 8;

                    } else {
                        return 8;
                    }   
                })
                .attr('height', function(d){
                    if(timeline_type == 'studied') {
                        return 4
                    } else {
                        return 8
                    }
                })
                .attr('rx', function(d){
                    if(timeline_type == 'studied') {
                        return 2
                    } else {
                        return 4
                    }
                })
                .attr('ry', function(d){
                    if(timeline_type == 'studied') {
                        return 2
                    } else {
                        return 4
                    }
                })
                .style('fill', pointColor)
                .style('fill-opacity', '1')
                .style('stroke', '#910E1C')
                .style('stroke-width', '0.2')
                .classed('timeline-circles', true)
                .attr('id', function(d){
                    return 'timeline_dot_' + d.properties.pk
                })
                .attr('data-placement', 'top')
                .attr('data-html', true)
                .attr('title', function(d, i){
                    const authors = d.properties.authors;
                    return authors + ' ' + d.properties.yearpublished
                })
                .on('click', viewMoreInfo)
                .on('mouseover', function(d) {
                    const sel = d3.select(this);
                    sel.moveToFront();
                    showTimelineTooltip(d);
                    d3.select(this)
                        .style('fill', '#000')
                        .style('stroke', '#000')
                        .style('stroke-width', '0.2')
                        .style('cursor', 'pointer');
                    showDotOnMap(d);
                    $('#map_dot_' + d.properties.pk).tooltip('show');
                })
                .on('mouseout', function(d) {
                    if (!clicked || d.properties.pk !== clickedCircleId) {
                        d3.select(this)
                            .style('fill', pointColor)
                            .style('stroke', '#910E1C')
                            .style('stroke-width', '0.2')
                            .style('cursor', 'default');
                    }
                    hideTimelineTooltip();
                    if (!clicked) {
                        hideDotsOnMap();
                    }
                    $('#map_dot_' + d.properties.pk).tooltip('hide');
                });

            timelineSelection.exit()
                .transition()
                .duration(500)
                .style('fill-opacity', '0')
                .remove();

            app.map.updateMapPoints();
        }

        app.map.clearTimelineBrush = function() {
            d3.select('.selection').attr('display', 'none');
            handle.attr('display', 'none');
            handleText.attr('display', 'none');
        }

        // add overlay dataset
        app.map.updateMapPoints = function() {   

            nodes = studies.features.map(function(n) {
                const pos = projection(n.geometry.coordinates);
                return {
                    x: pos[0],
                    y: pos[1],
                    originalX: pos[0],
                    originalY: pos[1],
                    properties: n.properties,
                    geometry: n.geometry
                };
            });

            const mapSelection = studiesG.selectAll('circle.map-circles')
                .data(nodes, function(d){ return d.properties.pk });

            mapSelection.enter()
                .append('circle')
                .style('fill', pointColor)
                .style('fill-opacity', '1')
                .style('stroke', '#910E1C')
                .style('stroke-width', '0.5')
                .classed('map-circles', true)
                .attr('id', function(d){
                    return 'map_dot_' + d.properties.pk
                })
                .attr('title', function(d){
                    return d.properties.authors + ' ' + d.properties.yearpublished 
                })
                .attr('data-placement', 'bottom')
                .attr('data-html', 'false')
                .on('click', viewMoreInfo)
                .on('mouseover', function(d) {
                    // dont apply a hover color or do anything else if this is the active clicked item
                    if (clicked && d.properties.pk === clickedCircleId) {
                        return;
                    }
                    const sel = d3.select(this);
                    sel.moveToFront();
                    showTimelineTooltip(d);
                    d3.select(this)
                        .style('fill', '#0B6BC3')
                        .style('stroke', '#FFF')
                        .style('stroke-width', '0.5')
                        .style('cursor', 'pointer');
                    $('#map_dot_' + d.properties.pk).tooltip('show');
                })
                .on('mouseout', function(d) {
                    hideTimelineTooltip();
                    if (!clicked || d.properties.pk !== clickedCircleId) {
                        d3.select(this)
                            .style('fill', pointColor)
                            .style('stroke', '#910E1C')
                            .style('stroke-width', '0.5')
                            .style('cursor', 'default');
                        $('#map_dot_' + d.properties.pk).tooltip('hide');
                    }
                });
                
            mapSelection.exit().remove();

            setTimeout(function() {
                $('.map-circles, .timeline-circles').tooltip({
                    container: 'body',
                    trigger: 'manual',
                    offset: '-30, 1'
                });
            }, 300);

            simulation = forceSimulation(nodes).on('tick', ticked);

            zoom_transition(1); 

        }

        function forceSimulation(nodes) {
            return d3.forceSimulation(nodes)
                .force('charge', d3.forceCollide().radius(new_radius))
                .force('x', d3.forceX(d => d.originalX).strength(0.2))
                .force('y', d3.forceY(d => d.originalY).strength(0.2));
        }

        function ticked() {
            studiesG.selectAll('circle.map-circles')
                .attr('cx', function (d) { return d.x; })
                .attr('cy', function (d) { return d.y; });
        }  


        // point color function
        function pointColor(feature) {
            if (feature.properties.recommended == 'yes' || feature.properties.recommended == 'Yes') {
                return '#D14D57';
            } else {
                return '#D14D57';
            }
        }

        // define function zoom transiton 
        function zoom_transition(zoomLevel) {
            svg_zoom.transition()
                .duration(500)
                .call(zoom.scaleBy, zoomLevel);
        }

        // define the radius change for points as we zoom in and out
        function scalePins(k) {

            // calculate new radius
            new_radius = 4/k;

            // select all pins and apply new radius in transition with zoom
            d3.selectAll('.map-circles').transition()
                .duration(100)
                .attr('r', new_radius);

            // also scale the country borders
            d3.selectAll('.country-borders').transition()
                .duration(100)
                .attr('stroke-width', new_radius/5);

            simulation.force('charge').radius(new_radius);

            simulation.alpha(1).restart();

        }

        // set up listeners for zoom
        d3.selectAll('button').on('click', function() {
            // zoom in 0.5 each time
            if (this.id === 'zoom-in') {
                zoom_transition(1.75); 
            }
            // zoom out 0.5 each time
            if (this.id === 'zoom-out') {
                zoom_transition(0.575);
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
            d3.selectAll('.map-circles')
                .style('fill', pointColor)
                .style('stroke', '#910E1C')
                .style('stroke-width', '0.5');
                
            // show clicked dot on map
            d3.select('#map_dot_' + d.properties.pk)
                .style('fill', '#000')
                .style('stroke', '#000')
                .style('stroke-width', '0.5');
        }

        // remove highlighting from dots on map
        function hideDotsOnMap() {
            d3.selectAll('.map-circles')
                .style('fill', pointColor)
                .style('stroke', '#910E1C')
                .style('stroke-width', '0.5');
        }

        // show tooltip on timeline dot
        function showTimelineTooltip(d) {
            $('[id^="timeline_dot_"]').tooltip('hide');

            // hide any tooltips that are already showing up on the timeline
            d3.selectAll('rect.timeline-circles')
                .style('fill', pointColor)
                .style('stroke', '#910E1C')
                .style('stroke-width', '0.5');

            // now show the one hovered or clicked on
            d3.select('#timeline_dot_' + d.properties.pk)
                .style('fill', '#000')
                .style('stroke', '#000')
                .style('stroke-width', '0.5');

            $('#timeline_dot_' + d.properties.pk).tooltip('show');
        }

        // remove all tooltips from timeline
        function hideTimelineTooltip() {
            if (!clicked) {
                d3.selectAll('rect.timeline-circles')
                    .style('fill', pointColor)
                    .style('stroke', '#910E1C')
                    .style('stroke-width', '0.5');
                $('.tooltip').tooltip('hide');
            }
        }

        // function for launching more information card
        function viewMoreInfo(d) {
            // set clicked flag variable to true
            clicked = true;
            clickedCircleId = d.properties.pk;

            // hide all tooltips except for this clicked circles tooltip
            $('[id^='map_dot_'], [id^='timeline_dot_']')
                .not('#map_dot_' + d.properties.pk)
                .not('#timeline_dot_' + d.properties.pk)
                .tooltip('hide');

            // show clicked dot
            showDotOnMap(d);

            // store clicked ID
            clickedCircleId = d.properties.pk

            // show tooltip on timeline
            showTimelineTooltip(d);

            // add data to card
            const authors = d.properties.authors;
            const card_title = authors + ' ' + d.properties.yearpublished;
            const area = d.properties.area.replace(/ *([|]) */g, '$1').split('|').join(', ');
            const age = d.properties.age.replace(/ *([|]) */g, '$1').split('|').join(', ');
            const diagnosticcriteria = d.properties.diagnosticcriteria.replace(/ *([|]) */g, '$1').split('|').join(', ');
            const diagnostictools = d.properties.diagnostictools.replace(/ *([|]) */g, '$1').split('|').join(', ');
            const prevalenceper10000 = d.properties.prevalenceper10000.replace(/ *([|]) */g, '$1').split('|').join(', ');
            const confidenceinterval = d.properties.confidenceinterval.replace(/ *([|]) */g, '$1').split('|').join(', ');
            $('#card-title').html(card_title);
            $('#card-country').text(d.properties.country);
            $('#card-area').text(area);
            $('#card-samplesize').text(d.properties.samplesize);
            $('#card-age').text(age);
            $('#card-diagnosticcriteria').text(diagnosticcriteria);
            $('#card-diagnostictools').text(diagnostictools);
            $('#card-percentwaverageiq').text(d.properties.percentwaverageiq);
            $('#card-sexratiomf').text(d.properties.sexratiomf);
            $('#card-prevalenceper10000').text(prevalenceper10000);
            $('#card-confidenceinterval').text(confidenceinterval);
            $('#card-yearsstudied').text(d.properties.yearsstudied);
            $('#card-categoryadpddorasd').text(d.properties.categoryadpddorasd);

            // add links to card
            let links = [];
            if (d.properties.link1title && d.properties.link1url) {
                links.push('<a href=''+ d.properties.link1url +'' >'+ d.properties.link1title +'</a>') 
            }
            if (d.properties.link2title && d.properties.link2url) {
                links.push('<a href=''+ d.properties.link2url +'' >'+ d.properties.link2title +'</a>') 
            }
            if (d.properties.link3title && d.properties.link3url) {
                links.push('<a href=''+ d.properties.link3url +'' >'+ d.properties.link3title +'</a>') 
            }
            if (d.properties.link4title && d.properties.link4url) {
                links.push('<a href=''+ d.properties.link4url +'' >'+ d.properties.link4title +'</a>') 
            }

            let links_string = links.join('<br />');
            links_string = links_string.replace('>Spectrum', '><em>Spectrum</em>');

            $('#card-links').html(links_string);

            // show card
            $('#more-information-card').css('display', 'block');
        }

        // listener to close card
        $('#card-close').click(function(){
            hideCard();
        });

        function hideCard() {
            $('#more-information-card').css('display', 'none');
            // set clicked flag variable to false
            clicked = false;
            clickedCircleId = null;
            hideDotsOnMap();
            hideTimelineTooltip();
        }

        // listen for state change in the timeline switch
        $('#timeline-switch').change(function() {
            if($(this).is(':checked')) {
                // switch visualization to year(s) studied
                timeline_type = 'studied';
                yearsstudied_number_min = min_yearpublished;
                yearsstudied_number_max = max_yearpublished; 
                min_yearpublished = '';
                max_yearpublished = '';
                app.map.pullDataAndUpdate();
            } else {
                // switch visualization to year published
                timeline_type = 'published';
                min_yearpublished = yearsstudied_number_min;
                max_yearpublished = yearsstudied_number_max;
                yearsstudied_number_min = ''; 
                yearsstudied_number_max = '';
                app.map.pullDataAndUpdate();
            }
        });

        // move to the front prototype
        d3.selection.prototype.moveToFront = function() {
            return this.each(function(){
                this.parentNode.appendChild(this);
            });
        };

        // initialize map and timeline
        app.map.initializeMap();
        
    });
}
