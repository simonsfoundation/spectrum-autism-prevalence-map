import { app } from './app.js';
import { updateYearDropdowns } from './joint.js';

export function ttInitMap() {
    $(document).ready(function (){
        // app.map scope
        app.map = {};

        app.map.lastZoomAction = 'manual';
        app.map.isAutoZoomTransition = false;

        // globaly scope some variables for the map
        let studies, pinnedDot, projection, path, width, height, scale, svg, g, graticuleG, countriesG, studiesG, g_zoom, svg_zoom, zoom, new_radius, nodes, simulation, baseZoom = 1;

        // functions for adding a graticule to the map
        const graticuleOutline = d3.geoGraticule().outline();
        const graticule = d3.geoGraticule10();

        // globaly scope some variables for the timeline
        let timeline_height, brush, brushG, timelineDiv, timelineSVG, timelineG, timelineX, timelineY, max_Y_domain, studiesByYear, handle, handleText, timeMin, timeMax;

        let originalWidth, originalScale;

        app.map.collapseCluster = function () {
            if (pinnedDot) {
                unpinDot(pinnedDot);
                pinnedDot = null;
            }

            app.map.expandedCluster = null;
            studiesG.selectAll('circle.map-circles')
                .style('visibility', 'hidden')
                .style('display', 'none')
                .style('pointer-events', 'none')
                .style('opacity', 1);

            // zoom out if the last zoom action was automatic
            const targetZoomLevel = Math.pow(zoomInFactor, 2);
            const shouldZoomOut = app.map.lastZoomAction === 'auto' || Math.abs(currentZoom - targetZoomLevel) < 0.01;
            if (shouldZoomOut) {
                const newZoomLevel = baseZoom;
                const viewportCenterX = width / 2;
                const viewportCenterY = height / 2;
                const translateX = viewportCenterX - viewportCenterX * newZoomLevel;
                const translateY = viewportCenterY - viewportCenterY * newZoomLevel;

                const newTransform = d3.zoomIdentity
                    .translate(translateX, translateY)
                    .scale(newZoomLevel);

                app.map.isAutoZoomTransition = true;
                svg_zoom.interrupt();
                svg_zoom.transition()
                    .duration(500)
                    .call(zoom.transform, newTransform)
                    .on('end', function() {
                        currentZoom = baseZoom;
                        app.map.lastZoomAction = 'manual';
                        app.map.isAutoZoomTransition = false;
                    });
            }

            app.map.drawMegadots();
        };

        app.map.expandCluster = function (clusterId) {
            if (pinnedDot) {
                unpinDot(pinnedDot);
                pinnedDot = null;
            }

            const cluster = app.map.clusters.find(c => c.id === clusterId);
            if (cluster) {
                app.map.expandedCluster = cluster;

                // find center of the cluster
                const avgX = cluster.nodes.reduce((sum, n) => sum + n.x, 0) / cluster.count;
                const avgY = cluster.nodes.reduce((sum, n) => sum + n.y, 0) / cluster.count;

                // zoom in 2 levels from base, but only if current zoom is less than target
                const targetZoomLevel = Math.pow(zoomInFactor, 2);
                let newZoomLevel = currentZoom;
                let shouldZoom = false;

                if (currentZoom < targetZoomLevel - 0.001) {
                    newZoomLevel = targetZoomLevel;
                    shouldZoom = true;
                }

                // always center on the mega dot
                const viewportCenterX = width / 2;
                const viewportCenterY = height / 2;
                const finalZoomLevel = shouldZoom ? newZoomLevel : currentZoom;
                const translateX = viewportCenterX - avgX * finalZoomLevel;
                const translateY = viewportCenterY - avgY * finalZoomLevel;

                const newTransform = d3.zoomIdentity
                    .translate(translateX, translateY)
                    .scale(finalZoomLevel);

                // cancel any ongoing transition to prevent overlap
                svg_zoom.interrupt();

                app.map.isAutoZoomTransition = true;

                if (shouldZoom) {
                    app.map.lastZoomAction = 'auto';
                }

                svg_zoom.transition()
                    .duration(500)
                    .call(zoom.transform, newTransform)
                    .on('end', function() {
                        if (shouldZoom) {
                            currentZoom = newZoomLevel;
                        }
                        setTimeout(() => {
                            app.map.isAutoZoomTransition = false;
                        }, 200);
                    });

                app.map.drawMegadots();
            }
        };

        app.map.drawMegadots = function() {
             const maxZoomThreshold = 6.5536;
    
            // if zoomed in to the threshold, don't draw any mega dots
            if (currentZoom >= maxZoomThreshold) {
                studiesG.selectAll('.megadot-container').remove();
                
                nodes.forEach(node => {
                    d3.select('#map_dot_' + node.properties.pk)
                        .style('visibility', 'visible')
                        .style('display', null)
                        .style('pointer-events', 'auto')
                        .style('opacity', 1);
                });
                
                return;
            }

            studiesG.selectAll('.megadot-container').remove();
            app.map.clusters.forEach(cluster => {
                // size of collapsed circle
                const minSize = 12;
                const increaseAmount = 0.2;
                const baseRadius = minSize + (cluster.count - 5) * increaseAmount;
                const megadotRadius = Math.min(Math.max(baseRadius, 12), 30) / currentZoom;
                const avgX = cluster.nodes.reduce((sum, n) => sum + n.x, 0) / cluster.count;
                const avgY = cluster.nodes.reduce((sum, n) => sum + n.y, 0) / cluster.count;
                const megadotContainer = studiesG.append('g')
                    .attr('class', 'megadot-container')
                    .attr('transform', `translate(${avgX},${avgY})`)
                    .attr('data-cluster-id', cluster.id)
                    .style('opacity', app.map.expandedCluster && cluster.id !== app.map.expandedCluster.id ? 0.6 : 1)
                    .style('pointer-events', 'all');

                if (app.map.expandedCluster && cluster.id === app.map.expandedCluster.id) {
                    const maxDistance = d3.max(cluster.nodes, node => {
                        const dx = node.x - avgX;
                        const dy = node.y - avgY;
                        return Math.sqrt(dx * dx + dy * dy);
                    });
                    // size of the outline around the expanded dot, increase the '+ n' to add more breathing room around the cluster
                    const outlineRadius = (maxDistance || megadotRadius) + 6 / currentZoom;

                    const outline = megadotContainer.append('circle')
                        .attr('class', 'megadot-outline')
                        .attr('r', outlineRadius)
                        .style('fill', 'transparent')
                        .style('stroke', '#D43B39')
                        .style('stroke-width', 3 / currentZoom)
                        .style('stroke-dasharray', (6 / currentZoom) + ',' + (5 / currentZoom))
                        .style('pointer-events', 'stroke')
                        .style('cursor', 'pointer')
                        .lower();

                    cluster.nodes.forEach(node => {
                        const dot = d3.select('#map_dot_' + node.properties.pk);
                        dot.attr('data-expanded', 'true');
                    });

                    outline.on('click', function() {
                        const target = d3.event.target;
                        const targetClasses = target.getAttribute('class') || '';
                        if (targetClasses.includes('megadot-outline')) {
                            d3.event.preventDefault();
                            d3.event.stopPropagation();
                            app.map.collapseCluster();
                        }
                    });
                // need at least 5 dots to create a cluster
                } else if (cluster.count >= 5) {
                    cluster.nodes.forEach(node => {
                        d3.select('#map_dot_' + node.properties.pk)
                            .style('visibility', 'hidden')
                            .style('display', 'none')
                            .style('pointer-events', 'none');
                    });

                    megadotContainer.append('circle')
                        .attr('class', 'megadot-background')
                        .attr('r', megadotRadius)
                        .style('fill', '#D14D57')
                        .style('stroke', '#910E1C')
                        .style('stroke-width', 0.5)
                        .style('cursor', 'pointer')
                        .style('pointer-events', 'all')
                        .on('mouseover', function() {
                            d3.select(this)
                                .style('fill', '#000')
                                .style('stroke', '#000');
                            megadotContainer.select('.megadot-count')
                                .style('fill', '#FFF');
                        })
                        .on('mouseout', function() {
                            d3.select(this)
                                .style('fill', '#D14D57')
                                .style('stroke', '#910E1C');
                            megadotContainer.select('.megadot-count')
                                .style('fill', '#000');
                        })
                        .on('click', function() {
                            d3.event.preventDefault();
                            d3.event.stopPropagation();
                            app.map.expandCluster(cluster.id);
                        });

                    megadotContainer.append('text')
                        .attr('class', 'megadot-count')
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'central')
                        .style('fill', '#000')
                        .style('font-size', 12 / currentZoom + 'px')
                        .style('pointer-events', 'none')
                        .style('font-weight', 'bold')
                        .text(cluster.count);
                }
            });

            nodes.forEach(node => {
                if (!app.map.clusters.some(cluster => cluster.nodes.includes(node))) {
                    d3.select('#map_dot_' + node.properties.pk)
                        .style('visibility', 'visible')
                        .style('display', null)
                        .style('pointer-events', 'auto')
                        .style('opacity', app.map.expandedCluster ? 0.6 : 1);
                }
            });

            studiesG.selectAll('circle.map-circles[data-expanded="true"]')
                .style('visibility', 'visible')
                .style('display', null)
                .style('pointer-events', 'all')
                .style('cursor', 'pointer')
                .style('opacity', 1)
                .raise()
                .on('click.megadot', function() {
                    d3.event.stopPropagation();
                })
                .attr('data-expanded', null);
        };

        app.map.createMegadots = function() {
            if (!nodes || nodes.length === 0) return;

            const maxZoomThreshold = 6.5536;
    
            // if zoomed in to the threshold, don't draw any mega dots
            if (currentZoom >= maxZoomThreshold) {
                studiesG.selectAll('circle.map-circles')
                    .style('visibility', 'visible')
                    .style('display', null)
                    .style('pointer-events', 'auto')
                    .style('opacity', 1);
                    
                studiesG.selectAll('.megadot-container').remove();
                
                const previousExpandedClusterId = app.map.expandedCluster ? app.map.expandedCluster.id : null;
                app.map.expandedCluster = null;
                
                return;
            }

            const previousExpandedClusterId = app.map.expandedCluster ? app.map.expandedCluster.id : null;

            studiesG.selectAll('circle.map-circles')
                .style('visibility', 'hidden')
                .style('display', 'none')
                .style('pointer-events', 'none')
                .style('opacity', app.map.expandedCluster ? 0.6 : 1);

            // radius within which a cluster can form
            const clusterRadius = 18 / currentZoom;
            if (!app.map.clusters) {
                const visitedNodes = new Set();
                let clusters = [];

                // form initial clusters
                nodes.forEach(node => {
                    const nodeId = node.properties.pk;
                    if (visitedNodes.has(nodeId)) return;

                    const cluster = {
                        x: node.originalX,
                        y: node.originalY,
                        nodes: [node],
                        count: 1,
                        id: nodeId.toString()
                    };

                    nodes.forEach(otherNode => {
                        const otherNodeId = otherNode.properties.pk;
                        if (nodeId === otherNodeId || visitedNodes.has(otherNodeId)) return;

                        const dx = node.originalX - otherNode.originalX;
                        const dy = node.originalY - otherNode.originalY;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance <= clusterRadius) {
                            cluster.nodes.push(otherNode);
                            cluster.count++;
                            cluster.x = (cluster.x * (cluster.count - 1) + otherNode.originalX) / cluster.count;
                            cluster.y = (cluster.y * (cluster.count - 1) + otherNode.originalY) / cluster.count;
                            visitedNodes.add(otherNodeId);
                        }
                    });

                    clusters.push(cluster);
                    visitedNodes.add(nodeId);
                });

                // merge clusters that are within clusterRadius of each other
                let merged = true;
                while (merged) {
                    merged = false;
                    const newClusters = [];
                    const mergedIndices = new Set();

                    for (let i = 0; i < clusters.length; i++) {
                        if (mergedIndices.has(i)) continue;

                        const clusterA = clusters[i];
                        let mergedCluster = { ...clusterA };

                        for (let j = i + 1; j < clusters.length; j++) {
                            if (mergedIndices.has(j)) continue;

                            const clusterB = clusters[j];
                            const dx = clusterA.x - clusterB.x;
                            const dy = clusterA.y - clusterB.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            if (distance <= clusterRadius) {
                                mergedCluster.nodes = [...mergedCluster.nodes, ...clusterB.nodes];
                                mergedCluster.count = mergedCluster.nodes.length;
                                mergedCluster.x = mergedCluster.nodes.reduce((sum, n) => sum + n.originalX, 0) / mergedCluster.count;
                                mergedCluster.y = mergedCluster.nodes.reduce((sum, n) => sum + n.originalY, 0) / mergedCluster.count;
                                mergedCluster.id = mergedCluster.nodes.map(n => n.properties.pk).sort((a, b) => a - b).join('-');
                                mergedIndices.add(j);
                                merged = true;
                            }
                        }

                        mergedIndices.add(i);
                        newClusters.push(mergedCluster);
                    }

                    clusters = newClusters;
                }

                // filter clusters with at least 5 nodes
                clusters = clusters.filter(cluster => cluster.count >= 5);
                clusters.forEach(cluster => {
                    cluster.id = cluster.nodes.map(n => n.properties.pk).sort((a, b) => a - b).join('-');
                });

                app.map.clusters = clusters;

                if (previousExpandedClusterId) {
                    const currentExpandedCluster = clusters.find(c => c.id === previousExpandedClusterId);
                    if (!currentExpandedCluster || currentExpandedCluster.count < 5) {
                        const previousCluster = app.map.expandedCluster;
                        const newCluster = clusters.find(c => {
                            const previousNodeIds = previousCluster.nodes.map(n => n.properties.pk).sort();
                            const currentNodeIds = c.nodes.map(n => n.properties.pk).sort();
                            return previousNodeIds.length === currentNodeIds.length && 
                                   previousNodeIds.every((id, i) => id === currentNodeIds[i]);
                        });
                        if (newCluster && newCluster.count >= 5) {
                            app.map.expandedCluster = newCluster;
                        } else {
                            app.map.expandedCluster = null;
                        }
                    } else {
                        app.map.expandedCluster = currentExpandedCluster;
                    }
                }
            }

            app.map.drawMegadots();

            if (!app.map.globalClickHandlerAdded) {
                d3.select('#map-svg').on('click.closeExpanded', null);
                d3.select('#map-svg').on('click.closeExpanded', function() {
                    if (app.map.expandedCluster) {
                        const target = d3.event.target;
                        const targetClasses = target.getAttribute('class') || '';
                        if (!targetClasses.includes('map-circles') && !targetClasses.includes('megadot-')) {
                            app.map.collapseCluster();
                        }
                    }
                });
                app.map.globalClickHandlerAdded = true;
            }
        };

        // add map data to the world map g container
        app.map.initializeMap = function() {
            // remove containers if they exist
            d3.select('#map-svg').remove();
            d3.select('#timeline-svg').remove();

            // constants
            width = $('#map').width();
            height = $('#map').height();
            timeline_height = $('#timeline').height();

            if (width <= 826) {
                scale = 144;         
            } else if (width <= 892) {
                scale = 153;
            } else {
                scale = 198;
            }

            // store these for use when the expand button is clicked
            originalWidth = width;
            originalScale = scale;
            
            // data holder
            studies = null;

            // have any points been clicked?
            pinnedDot = null;

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
                .scaleExtent([0.75, 6.5536])
                .on('zoom', zoomed);

            svg_zoom.call(zoom);

            // define zooming function for zooming map
            function zoomed() {
                currentZoom = d3.event.transform.k;
                g_zoom.attr('transform', `translate(${d3.event.transform.x}, ${d3.event.transform.y}) scale(${d3.event.transform.k})`);
                scalePins(d3.event.transform.k);
                
                if (!app.map.isAutoZoomTransition) {
                    app.map.lastZoomAction = 'manual';
                }

                // recalculate clusters on zoom only if there's no expanded cluster
                if (!app.map.expandedCluster) {
                    app.map.clusters = null;
                    app.map.createMegadots();
                } else {
                    // ff there's an expanded cluster, just redraw without reforming clusters
                    app.map.drawMegadots();
                }
            }

            // create container for timeline
            timelineDiv = d3.select('#timeline'),
                timelineWidth = timelineDiv.node().offsetWidth,
                timelineHeight = timeline_height; 
        
            timelineSVG = timelineDiv.append('svg')
                .attr('id', 'timeline-svg')
                .attr('width', timelineWidth)
                .attr('height', timelineHeight);

            let helpTooltipTimeout;

            // enable timeline help tooltip
            $('#help').tooltip({
                container: 'body',
                trigger: 'click',
                placement: 'right',
                template: '<div class="tooltip help" role="tooltip"><div class="tooltip-inner"></div></div>',
                title: 'You can use the timeline of studies to filter by the years in which studies were conducted or published. Simply drag the cursor horizontally across the timeline to select years.',
            }).on('shown.bs.tooltip', function () {
                clearTimeout(helpTooltipTimeout);
                helpTooltipTimeout = setTimeout(() => {
                    $(this).tooltip('hide');
                }, 3000);
            });

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
                    .attr('class', 'graticule fill-none stroke-dark-tan stroke-0.125')
                    .attr('d', path);

                graticuleG.append('path')
                    .datum(graticule)
                    .attr('class', 'graticule fill-none stroke-dark-tan stroke-0.125')
                    .attr('d', path);  
                    
                app.map.initializeTimeline();

            });       
        }

        // pull data and update timeline function
        app.map.pullDataAndUpdate = function() {
            app.updateURL();
            d3.json('/studies-api/' + app.api_call_param_string).then(function(data) {
                studies = data;
                app.meanValue = data.mean;
                app.map.clusters = null;
                app.map.updateTimeline();
                app.fetchAndUpdateMean();
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
            timeMin = d3.min(studies.features, function(d) {
                // fallback for null values
                const dateStr = d.properties.yearsstudied_number_min || '1970-01-01';
                const [year] = dateStr.split('-');
                // january 1st of the min year
                return new Date(Date.UTC(parseInt(year, 10), 0, 1));
            });
            timeMax = d3.max(studies.features, function(d) {
                const year = parseInt(d.properties.yearpublished, 10);
                // december 31st 11:59 of the max year
                return new Date(Date.UTC(year, 11, 31, 23, 59, 59));
            });

            // add the x brush
            brush = d3.brushX()
                .extent([[0, 0], [timelineWidth, timelineHeight-33]])
                .on('end', brushed)
                .on('start brush', moveHandles);
                
            brushG = timelineSVG.append('g')
                .attr('class', 'x brush')
                .call(brush);               

            timelineG = timelineSVG.append('g')
                .attr('class', 'timeline-circles');
               
            timelineX = d3.scaleTime()
                .range([0, timelineWidth])
                .domain([timeMin, timeMax]);       

            timelineY = d3.scaleLinear()
                .range([timelineHeight - 83, 0]);

            // Add the x axis
            const axisHeight = timelineHeight - 33;
            timelineSVG.append('g')
                .attr('transform', 'translate(0,' + axisHeight + ')')
                .classed('timeline-axis', true)
                .call(d3.axisBottom(timelineX).ticks(5).tickSize(15).tickPadding(9));
            

            handle = brushG.selectAll('.handle--custom')
                .data([{type: 'w'}, {type: 'e'}])
                .enter().append('circle')
                    .classed('handle--custom', true)
                    .attr('r', 3)
                    .attr('fill', '#D14D57')
                    .attr('fill-opacity', 1)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 0)
                    .attr('cursor', 'ew-resize')
                    .attr('display', 'none');

                    
            handleText = brushG.selectAll('.handle--text')
                .data([{type: 'w'}, {type: 'e'}])
                .enter().append('text')
                .classed('handle--text', true)
                .attr('y', timelineHeight / 2.45)
                .attr('dy', '.3em')
                .attr('fill', '#FFF')
                .attr('font-size', '10px')
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

                // update the select filters
                const minYear = d1[0].getUTCFullYear();
                const maxYear = d1[1].getUTCFullYear();
                $('#min_year').val(minYear);
                $('#max_year').val(maxYear);
                // disable options that are not available
                updateYearDropdowns(minYear, maxYear);

                app.map.pullDataAndUpdate();
            } 

            function moveHandles() {
                if (!d3.event.selection) {
                    return;
                }

                d3.select('.selection').attr('display', null);

                showWelcomeCard();

                let s = d3.event.selection, 
                    d0 = d3.event.selection.map(timelineX.invert),
                    d1 = [];

                d1[0] = d3.timeYear.ceil(d0[0]);
                d1[1] = d3.timeYear.floor(d0[1]);

                let isUpdating = false;

                // ensure min year is not greater than max year
                let minYear = d1[0].getUTCFullYear();
                let maxYear = d1[1].getUTCFullYear();
                if (minYear > maxYear && !isUpdating) {
                    // set min year to match max year
                    d1[0] = new Date(maxYear, 0, 1);
                    const newSelection = [timelineX(d1[0]), s[1]];
                    isUpdating = true;
                    brushG.call(brush.move, newSelection);
                    isUpdating = false;
                    s = newSelection;
                }

                if (s == null) {
                    handle.attr('display', 'none');
                    handleText.attr('display', 'none');
                } else {
                    handle
                        .attr('display', null)
                        .attr('transform', function(d, i) { 
                            return 'translate(' + s[i] + ',' + timelineHeight / 2.45 + ')'; 
                        });

                    handleText
                        .attr('display', null)
                        .attr('x', function(d, i) {
                            if (i === 0) {
                                return s[i] - 28;
                            } else {
                                return s[i] + 8;
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
                min_year = min_yearpublished;
                max_year = max_yearpublished;  
            }


            if (min_year || max_year) {
                let brush_min, brush_max;
                if (min_year) {
                    brush_min = new Date(min_year);
                } else {
                    brush_min = timeMin;
                }

                if (max_year) {
                    brush_max = new Date(parseInt(max_year), 11, 31, 23, 59, 59);
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
            // dot height and the ideal gap height when we don't have to overlap dots to fit
            const dotHeight = 8;
            const gap = 1;
            const dotSpacing = dotHeight + gap;
            // max height we have to work with so we don't get too close to the help tip text line
            const maxHeight = timelineHeight - 83;
            // max amount of dots with ideal spacing that can fit in the max height
            const maxDotsAtDotSpacing = Math.floor(maxHeight / dotSpacing);
            // apply consistent offset to all years and align to the bottom
            const offset = max_Y_domain <= maxDotsAtDotSpacing ? dotSpacing : maxHeight / (max_Y_domain - 1);
            timelineY
                .domain([1, max_Y_domain])
                .range([timelineHeight - 83, timelineHeight - 83 - (max_Y_domain - 1) * offset])
                .clamp(true);

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
                        return timelineX(date) - 4;
                    } else {
                        let date = new Date(d.properties.yearpublished)
                        return timelineX(date) - 4;
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
                        return timelineX(date) - 4;
                    } else {
                        let date = new Date(d.properties.yearpublished)
                        return timelineX(date) - 4;
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
                .on('mouseover', function(d) {
                    // only show hover if not pinned
                    if (pinnedDot !== d.properties.pk) {
                        showHover(d.properties.pk);
                    }
                })
                .on('mouseout', function(d) {
                    // only hide hover if not pinned
                    if (pinnedDot !== d.properties.pk) {
                        hideHover(d.properties.pk);
                    }
                })
                .on('click', function(d) {
                    // if there's an expanded cluster, collapse it
                    if (app.map.expandedCluster && !app.map.expandedCluster.nodes.some(node => node.properties.pk === d.properties.pk)) {
                        app.map.collapseCluster();
                    }

                    // pin or unpin
                    togglePin(d);
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

        app.map.updateTimelineBrushFromFilters = function() {
            // only if we have a valid brush and timeline
            if (!brush || !timelineX) return;
            
            let minYear, maxYear;
            
            if (timeline_type == 'studied') {
                minYear = yearsstudied_number_min || $('#min_year').val();
                maxYear = yearsstudied_number_max || $('#max_year').val();
            } else {
                minYear = min_yearpublished || $('#min_year').val();
                maxYear = max_yearpublished || $('#max_year').val();
            }
        
            if (minYear && maxYear) {
                const minDate = new Date(parseInt(minYear, 10), 0, 1);
                const maxDate = new Date(parseInt(maxYear, 10), 11, 31, 23, 59, 59);
                brushG.call(brush.move, [minDate, maxDate].map(timelineX));
            }
        };

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
                .style('stroke-width', 0.5 / currentZoom)
                .classed('map-circles', true)
                .attr('id', function(d){
                    return 'map_dot_' + d.properties.pk
                })
                .attr('title', function(d){
                    return d.properties.authors + ' ' + d.properties.yearpublished 
                })
                .attr('data-placement', 'bottom')
                .attr('data-html', 'false')
                .on('mouseover', function(d) {
                    // if not pinned, show hover
                    if (pinnedDot !== d.properties.pk) {
                        showHover(d.properties.pk);
                    }
                })
                .on('mouseout', function(d) {
                    // if not pinned, hide hover
                    if (pinnedDot !== d.properties.pk) {
                        hideHover(d.properties.pk);
                    }
                })
                .on('click', function(d) {
                    // if there's an expanded cluster, collapse it
                    if (app.map.expandedCluster && !app.map.expandedCluster.nodes.some(node => node.properties.pk === d.properties.pk)) {
                        app.map.collapseCluster();
                    }

                    // pin or unpin
                    togglePin(d);
                });
                
            mapSelection.exit().remove();

            setTimeout(function() {
                $('.map-circles').tooltip({
                    container: 'body',
                    trigger: 'manual',
                    offset: '-60, 1'
                });
                $('.timeline-circles').tooltip({
                    container: 'body',
                    trigger: 'manual',
                    offset: '60, 1'
                });
            }, 300);

            simulation = forceSimulation(nodes).on('tick', ticked);

            zoom_transition(1);

            app.map.clusters = null;
            app.map.createMegadots();
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
            return '#D14D57';
            /*
            this functionality is no longer used, commenting out for now and to be removed later if not needed

            if (feature.properties.recommended == 'yes' || feature.properties.recommended == 'Yes') {
                return '#D14D57';
            } else {
                return '#D14D57';
            }
            */
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
                .attr('r', new_radius)
                .style('stroke-width', 0.5 / k);

            // also scale the country borders
            d3.selectAll('.country-borders').transition()
                .duration(100)
                .attr('stroke-width', new_radius/5);

            simulation.force('charge').radius(new_radius);

            simulation.alpha(1).restart();
        }

        // set up listeners for zoom
        let currentZoom = 1;
        const zoomInFactor = 1.6;
        // exact inverse of 1.6
        const zoomOutFactor = 0.625;
        const center = [width / 2, height / 2];

        d3.selectAll('button').on('click', function() {
            if (this.id === 'zoom-in') {
                // allow 4 zoom in levels
                if (currentZoom >= 6.5536) return;
                // if we are already below the base zoom level, reset to the base zoom level, otherwise zoom in
                currentZoom = currentZoom < 1 ? 1 : currentZoom * zoomInFactor;
            } else if (this.id === 'zoom-out') {
                // only allow zooming out one level from the base zoom level
                currentZoom = currentZoom <= 1 ? zoomOutFactor : Math.max(zoomOutFactor, currentZoom * zoomOutFactor);
            }

            svg_zoom.transition()
                .call(zoom.scaleTo, currentZoom, center);
        });

        function showHover(pk) {
            // only show tooltips on visible elements
            const mapDot = $('#map_dot_' + pk);
            const timelineDot = $('#timeline_dot_' + pk);
            
            // check if we should try to show the tooltip
            if (pinnedDot !== pk && app.map.expandedCluster && app.map.expandedCluster.id) {
                // if we have an expanded cluster, check if this dot is in it
                const clusterWithDot = app.map.clusters.find(cluster => 
                    cluster.id === app.map.expandedCluster.id && 
                    cluster.nodes.some(node => node.properties.pk == pk)
                );

                // only show tooltip if this dot is part of the expanded cluster
                if (!clusterWithDot) return;
            }
            
            // only show tooltips if elements are visible
            if (mapDot.is(':visible')) {
                mapDot.tooltip('show');
            }
            
            if (timelineDot.is(':visible')) {
                timelineDot.tooltip('show');
            }

            // apply hover state
            d3.select('#map_dot_' + pk)
                .style('fill', '#000')
                .style('stroke', '#000');

            d3.select('#timeline_dot_' + pk)
                .style('fill', '#FFF')
                .style('stroke', '#FFF');
        }

        function hideHover(pk) {
            try {
                $('#map_dot_' + pk).tooltip('hide');
            } catch(e) {
                console.log('Suppressed tooltip error for map dot', pk);
            }
            
            try {
                $('#timeline_dot_' + pk).tooltip('hide');
            } catch(e) {
                console.log('Suppressed tooltip error for timeline dot', pk);
            }

            // revert to default color
            d3.select('#map_dot_' + pk)
                .style('fill', pointColor)
                .style('stroke', '#910E1C');
            d3.select('#timeline_dot_' + pk)
                .style('fill', pointColor)
                .style('stroke', '#910E1C');
        }

        // pin a dot and tooltip
        function pinDot(d) {
            let pk = d.properties.pk;

            // mark as pinned
            pinnedDot = pk;

            // pinned state is blue with white border
            d3.select('#map_dot_' + pk)
                .style('fill', '#0B6BC3')
                .style('stroke', '#FFF')
                .moveToFront();
            d3.select('#timeline_dot_' + pk)
                .style('fill', '#FEF9EE')
                .style('stroke', '#FFF')
                .moveToFront();

            // populate and show info card
            populateInfoCard(d);
        }

        // unpin a dot and tooltip
        function unpinDot(pk) {
            pinnedDot = null;

            // revert to default color
            d3.select('#map_dot_' + pk)
                .style('fill', pointColor)
                .style('stroke', '#910E1C');
            d3.select('#timeline_dot_' + pk)
                .style('fill', pointColor)
                .style('stroke', '#910E1C');

            // show the welcome card
            showWelcomeCard();
        }

        // welcome card content to reset to
        const welcomeCardContent = $('#info-card[data-content="welcome"').html();

        // function to clear pinned dot when the clear filters button is clicked, or filters are changed.
        function clearPinned() {
            if (pinnedDot) {
                unpinDot(pinnedDot);
                pinnedDot = null;
            }
        }

        // make this clearPinned function available to call from joint.ts
        app.map.clearPinned = clearPinned;

        // populate the info card when a map or timline dot is clicked
        function populateInfoCard(d) {
            const infoCard = $('#info-card');
            const authors = d.properties.authors;
            const card_title = authors + ' ' + d.properties.yearpublished;
            const area = d.properties.area.replace(/ *([|]) */g, '$1').split('|').join(', ');
            const age = d.properties.age.replace(/ *([|]) */g, '$1').split('|').join(', ');
            const diagnosticcriteria = d.properties.diagnosticcriteria.replace(/ *([|]) */g, '$1').split('|').join(', ');
            const diagnostictools = d.properties.diagnostictools.replace(/ *([|]) */g, '$1').split('|').join(', ');
            const prevalenceper10000 = d.properties.prevalenceper10000.replace(/ *([|]) */g, '$1').split('|').join(', ');
            const confidenceinterval = d.properties.confidenceinterval.replace(/ *([|]) */g, '$1').split('|').join(', ');

            const resultCSS1 = 'mb-2.5 text-sans text-3.5 text-med-navy tracking-2 leading-100';
            const resultCSS2 = 'block text-sans text-3.5 text-med-navy tracking-2 leading-6.25 font-semibold';

            // build the HTML content to add to the card
            const cardHTML = 
                '<h2 class="mb-2 mt-0.75 text-sans text-5 text-med-navy tracking-2 leading-100">' + card_title + '</h2>' +
                '<p class="' + resultCSS1 + '"><strong class="' + resultCSS2 + '">Country:</strong> ' + d.properties.country + '</p>' +
                '<p class="' + resultCSS1 + '"><strong class="' + resultCSS2 + '">Area:</strong> ' + area + '</p>' +
                '<p class="' + resultCSS1 + '"><strong class="' + resultCSS2 + '">Sample Size:</strong> ' + d.properties.samplesize + '</p>' +
                '<p class="' + resultCSS1 + '"><strong class="' + resultCSS2 + '">Age:</strong> ' + age + '</p>' +
                '<p class="' + resultCSS1 + '"><strong class="' + resultCSS2 + '">Diagnostic Criteria:</strong> ' + diagnosticcriteria + '</p>' +
                '<p class="' + resultCSS1 + '"><strong class="' + resultCSS2 + '">Diagnostic Tools:</strong> ' + diagnostictools + '</p>' +
                '<p class="' + resultCSS1 + '"><strong class="' + resultCSS2 + '">Percent with Average IQ:</strong> ' + d.properties.percentwaverageiq + '</p>' +
                '<p class="' + resultCSS1 + '"><strong class="' + resultCSS2 + '">Sex Ratio (M:F):</strong> ' + d.properties.sexratiomf + '</p>' +
                '<p class="' + resultCSS1 + '"><strong class="' + resultCSS2 + '">Prevalence per 10,000:</strong> ' + prevalenceper10000 + '</p>' +
                '<p class="' + resultCSS1 + '"><strong class="' + resultCSS2 + '">Confidence Interval:</strong> ' + confidenceinterval + '</p>' +
                '<p class="' + resultCSS1 + '"><strong class="' + resultCSS2 + '">Years Studied:</strong> ' + d.properties.yearsstudied + '</p>' +
                '<p class="' + resultCSS1 + '"><strong class="' + resultCSS2 + '">Category:</strong> ' + d.properties.categoryadpddorasd + '</p>';

            // check if a string is a valid URL
            function isValidURL(url) {
                try {
                    new URL(url);
                    return true;
                } catch (_) {
                    return false;
                }
            }

            // remove any previously injected publication link
            $('#publication-button-wrap').remove();

            // update the info card content
            infoCard.attr('data-content','').html(cardHTML);

            // build an array of publication link HTML strings
            let links = [];
            let itemClasses = 'block pl-4 text-4 text-blue font-semibold tracking-2 leading-6.25 no-underline rounded-sm2-b';

            const publications = [
                { title: d.properties.link1title, url: d.properties.link1url },
                { title: d.properties.link2title, url: d.properties.link2url },
                { title: d.properties.link3title, url: d.properties.link3url },
                { title: d.properties.link4title, url: d.properties.link4url }
            ];

            for (let i = 0; i < publications.length; i++) {
                const publication = publications[i];
                if (publication.title && publication.url) {
                    let item;
                    if (isValidURL(publication.url)) {
                        // use an anchor tag if we have a valid URL
                        item = '<a href="' + publication.url + '" target="_blank" class="' + itemClasses + (i > 0 ? ' mt-0.5' : '') + '">' + publication.title + '</a>';
                    } else {
                        // use a span if we don't have a valid URL
                        item = '<span class="' + itemClasses + (i > 0 ? ' mt-0.5' : '') + '">' + publication.title + '</span>';
                    }
                    links.push(item);
                }
            }

            // add the publication links into an absolutely positioned div at the bottom of the parent while the main #info-card has overflow: scroll
            if (links.length > 0) {
                let linksHTML = links.join('');
                linksHTML = linksHTML.replace('>Spectrum', '><em>Spectrum</em>');

                const containerHTML = '<div id="publication-button-wrap" class="absolute bottom-0 left-0 w-full py-3.25 bg-white border-t-light-gray2 border-t-0.5 rounded-sm2-b">' + linksHTML + '</div>';
                $('#info-card-container').append(containerHTML);

                // adjust info-card height based on number of links
                let heightClass =  'max-h-info' + (links.length);

                // remove existing height classes before adding a new one
                infoCard.removeClass(function(index, className) {
                    return (className.match(/max-h-info\d+/g) || []).join(' ');
                });

                $('#info-card').addClass(heightClass);
            }
        }

        // reset to welcome card content
        function showWelcomeCard() {
            $('#publication-button-wrap').remove();
            $('#info-card').html(welcomeCardContent).attr('data-content', 'welcome');
        }

        function togglePin(d) {
            const pk = d.properties.pk;
            
            // Hide tooltips
            $('#map_dot_' + pk).tooltip('hide');
            $('#timeline_dot_' + pk).tooltip('hide');
            
            // if we clicked the same dot again, unpin
            if (pinnedDot === pk) {
                unpinDot(pk);
                return;
            }
            
            // if some other dot was pinned, unpin that first
            if (pinnedDot && pinnedDot !== pk) {
                unpinDot(pinnedDot);
            }
            
            // pin the new dot
            pinDot(d);
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
                $('#earliest-label').text('Earliest year studied');
                $('#latest-label').text('Latest year studied');
                app.map.pullDataAndUpdate();
            } else {
                // switch visualization to year published
                timeline_type = 'published';
                min_yearpublished = yearsstudied_number_min;
                max_yearpublished = yearsstudied_number_max;
                yearsstudied_number_min = ''; 
                yearsstudied_number_max = '';
                $('#earliest-label').text('Earliest year published');
                $('#latest-label').text('Latest year published');
                app.map.pullDataAndUpdate();
            }
        });

        // function to update the map dimensions when the expand button is clicked
        function resizeMap(savedTransform) {
            // map dimensions before resize
            const oldWidth = +svg.attr('width');
            const oldHeight = +svg.attr('height');

            // map dimensions after resize
            const containerWidth = $('#map').width();
            const containerHeight = $('#map').height();

            // use saved transform if we have it
            const transformData = savedTransform || { k: 1, x: 0, y: 0 };
            
            // new projection scale
            const scaleFactor = containerWidth / originalWidth;
            scale = originalScale * scaleFactor;

            svg.attr('width', containerWidth)
               .attr('height', containerHeight);

            // update the projection
            projection
                .scale(scale)
                .translate([containerWidth / 2, containerHeight / 2]);

            // redraw the map paths with the updated projection
            g.selectAll('path').attr('d', path);

            // update positions of map nodes
            if (nodes && nodes.length) {
                if (simulation) {
                    simulation.stop();
                }
                
                nodes.forEach(function(d) {
                    const pos = projection(d.geometry.coordinates);
                    d.x = pos[0];
                    d.y = pos[1];
                    d.originalX = pos[0];
                    d.originalY = pos[1];
                });
                
                if (simulation) {
                    simulation.nodes(nodes);
                    simulation.alpha(1).restart();
                }
                
                studiesG.selectAll('circle.map-circles')
                    .attr('cx', function(d) { return d.x; })
                    .attr('cy', function(d) { return d.y; });
            }

            // calculate the center point before and after resize
            const oldCenterX = oldWidth / 2;
            const oldCenterY = oldHeight / 2;
            const newCenterX = containerWidth / 2;
            const newCenterY = containerHeight / 2;
            
            const distanceFromCenterX = (transformData.x - oldCenterX) / transformData.k;
            const distanceFromCenterY = (transformData.y - oldCenterY) / transformData.k;
            
            const newX = newCenterX + (distanceFromCenterX * transformData.k);
            const newY = newCenterY + (distanceFromCenterY * transformData.k);
            
            const widthRatio = containerWidth / oldWidth;
            const heightRatio = containerHeight / oldHeight;
            
            const adjustedX = transformData.x * widthRatio;
            const adjustedY = transformData.y * heightRatio;
            
            // create and apply the new transform
            const newTransform = d3.zoomIdentity
                .translate(adjustedX, adjustedY)
                .scale(transformData.k);
            
            svg_zoom.call(zoom.transform, newTransform);
            
            scalePins(transformData.k);
        }

        // handle the expand button functionality
        $('#expand').on('click', function() {
            const savedZoomLevel = currentZoom;
            
            // get the current position information
            const currentTransform = g_zoom.attr('transform');
            let transformData = { k: savedZoomLevel, x: 0, y: 0 };
            
            if (currentTransform) {
                const translateMatch = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
                if (translateMatch && translateMatch.length >= 3) {
                    transformData.x = parseFloat(translateMatch[1]);
                    transformData.y = parseFloat(translateMatch[2]);
                }
            }

            $('#map').data('savedTransform', transformData);
            
            // toggle classes to expand the map and info-card, hide the header, and modify the expand button
            $('header').slideToggle(300);
            $('#info-card-container').toggleClass('h-map-expand lg:h-map-lg-expand xl:h-card-xl-expand lg:mr-0 xl:mr-0');
            $('#map').toggleClass('h-map-expand lg:h-map-lg-expand xl:h-map-xl-expand w-map-expand lg:w-map-lg-expand xl:w-map-xl-expand');
            $(this).find('#icon-expand').toggleClass('hidden');
            $(this).find('#icon-minimize').toggleClass('hidden');

            // resize the SVG and its parts after animation completes
            setTimeout(function(){
                resizeMap($('#map').data('savedTransform'));
            }, 300);
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
