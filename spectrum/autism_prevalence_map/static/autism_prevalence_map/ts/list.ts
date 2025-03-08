import { app } from './app.js';

export function ttInitList() {
    $(document).ready(function (){
        // app.list scope
        app.list = {};

        const width = $('body').width();
        const mapWidth = $('#list').width();
        const table = d3.select('#studies');

        // map projection
        const projection = d3.geoKavrayskiy7()
            .scale(250)
            .translate([mapWidth / 2, mapWidth / 1.8]);

        // function to create paths from map projection
        const path = d3.geoPath().projection(projection);

        let world = null;
        let thisMapSVG = null;

        app.list.loadWorldMap = function() {
            d3.json(world_atlas).then(function(data) {
                world = data;
                app.list.addRows();
            });
        }


        app.list.addRows = function() {
            $('#studies tbody').remove();     
            d3.json('/studies-api/' + app.api_call_param_string).then(function(data) {
                studies = data;
                let enter_selection = table.append('tbody')
                    .attr('id', 'studies_tbody')
                    .selectAll('tr')
                    .data(studies.features)
                    .enter();
                
                let row1 = enter_selection.append('tr')
                    .attr('data-toggle', 'collapse')
    		        .attr('href', function (d) { 
                        return '#accordion_menu_' + d.properties.pk; 
                    })

                    .attr('role', 'button')
                    .attr('aria-expanded', 'false')
                    .attr('aria-controls', function (d) { 
                        return d.properties.pk; 
                    })
                    .classed('study_row', true);

                row1.append('td')
                    .attr('scope', 'row')
                    .append('img')
                    .attr('src', '{% static "autism_prevalence_map/img/icon-chevron-down.svg" %}')
                    .attr('alt', 'chevron down icon')
                    .classed('chevron-down', true);
                
                row1.append('td')
                    .text(function (d) { 
                        return d.properties.yearpublished; 
                    })

                row1.append('td')
                    .html(function (d) { 
                        const authors = d.properties.authors.replace('et al.', '<em>et al.</em>');
                        return authors; 
                    })

                row1.append('td')
                    .text(function (d) { 
                        return d.properties.country; 
                    })

                row1.append('td')
                    .text(function (d) { 
                        return d.properties.area.replace(/ *([|]) */g, '$1').split('|').join(', ');
                    })

                row1.append('td')
                    .text(function (d) { 
                        return d.properties.samplesize; 
                    })

                row1.append('td')
                    .text(function (d) { 
                        return d.properties.prevalenceper10000.replace(/ *([|]) */g, '$1').split('|').join(', ');
                        ; 
                    })

                row1.append('td')
                    .text(function (d) { 
                        return d.properties.confidenceinterval.replace(/ *([|]) */g, '$1').split('|').join(', '); 
                    })


                let row2 = enter_selection.insert('tr')
                    .classed('collapse', true)
                    .classed('list-more-information', true)
    		        .attr('id', function (d) { 
                        return 'accordion_menu_' + d.properties.pk; 
                    });

                let card_div = row2.append('td')
                    .attr('colspan', '9')
                    .append('div')
                    .classed('container-fluid', true)
                    .append('div')
                    .classed('row', true);

                let textBlock = card_div.append('div')
                    .classed('col-4', true)
                    .append('p')
                    .html(function (d) { 
                        const age = d.properties.age.replace(/ *([|]) */g, '$1').split('|').join(', ');
                        const diagnosticcriteria = d.properties.diagnosticcriteria.replace(/ *([|]) */g, '$1').split('|').join(', ');

                        const diagnostictools = d.properties.diagnostictools.replace(/ *([|]) */g, '$1').split('|').join(', ');

                        let links = [];
                        if (d.properties.link1title && d.properties.link1url) {
                            links.push('<a href="'+ d.properties.link1url +'">'+ d.properties.link1title +'</a>') 
                        }
                        if (d.properties.link2title && d.properties.link2url) {
                            links.push('<a href="'+ d.properties.link2url +'">'+ d.properties.link2title +'</a>') 
                        }
                        if (d.properties.link3title && d.properties.link3url) {
                            links.push('<a href="'+ d.properties.link3url +'">'+ d.properties.link3title +'</a>') 
                        }
                        if (d.properties.link4title && d.properties.link4url) {
                            links.push('<a href="'+ d.properties.link4url +'">'+ d.properties.link4title +'</a>') 
                        }

                        let links_string = links.join('<br />');
                        links_string = links_string.replace('>Spectrum', '><em>Spectrum</em>');

                        return '<b>Age (years):</b> ' + age + '<br />' +
                        '<b>Individuals with autism:</b> ' + d.properties.individualswithautism + '<br />' +
                        '<b>Diagnostic criteria:</b> ' + diagnosticcriteria + '<br />' +
                        '<b>Diagnostic tools:</b> ' + diagnostictools + '<br />' +
                        '<b>Percent w/ average IQ:</b> ' + d.properties.percentwaverageiq + '<br />' +
                        '<b>Sex ratio (M:F):</b> ' + d.properties.sexratiomf + '<br />' +
                        '<b>Year(s) studied:</b> ' + d.properties.yearsstudied + '<br />' +
                        '<b>Category:</b> ' + d.properties.categoryadpddorasd + '<br />' +
                        links_string;
                    });

                let mapBlock = card_div.append('div')
                    .classed('col-4', true);

                let mapSVG = mapBlock.append('svg')
                    .style('width', '100%')
                    .style('height', '100%')
                    .attr('id', function (d) { 
                        return 'map_svg_' + d.properties.pk;
                    });

                thisMapSVG = mapSVG;

                let mapG = mapSVG.append('g')
                    .classed('countries', true)
                    .attr('id', function (d) { 
                        return 'map_svg_g_' + d.properties.pk;
                    });

                mapG.selectAll('path')
                    .data(topojson.feature(world, world.objects.countries).features.filter(function(d){
                        if (d.id !== '010') {
                            return d;
                        }
                    }))
                    .enter().append('path')
                    .attr('d', path);

                mapG.append('path')
                    .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
                    .classed('country-borders', true)
                    .attr('d', path);

                // add this study to the map
                const studiesG = mapG.append('g')
                    .attr('id', 'studies');

                const mapSelection = studiesG.append('circle')
                    .attr('cx', function (d) { 
                        return projection(d.geometry.coordinates)[0]; 
                    })
                    .attr('cy', function (d) { 
                        return projection(d.geometry.coordinates)[1]; 
                    })
                    .attr('r', 5)
                    .style('fill', pointColor)
                    .style('fill-opacity', '1')
                    .style('stroke', '#fff')
                    .style('stroke-width', '0')
                    .classed('map-circles', true)
                    .attr('id', function(d){
                        return 'map_dot_' + d.properties.pk
                    });

                thisMapSVG.each(function(d) {
                    let zoom = d3.zoom()
                        .on('zoom', function() {
                            d3.select('#map_svg_g_' + d.properties.pk).attr('transform', d3.event.transform);
                        });
                    d3.select('#map_svg_' + d.properties.pk)
                        .call(zoom.scaleTo, 2)
                        .call(zoom.translateTo, projection(d.geometry.coordinates)[0] - (mapWidth/4), projection(d.geometry.coordinates)[1] - (mapWidth/6));
                })

                // add confidence interval graphic
                let ciBlock = card_div.append('div')
                    .classed('col-4', true); 
                 
                ciBlock.append('p')
                    .style('text-align', 'center')
                    .text('95% Confidence interval');
                    
                let ciSVG = ciBlock.append('svg')
                    .style('width', function (d) {
                        if (d.properties.confidenceinterval.includes('Unavailable')) {
                            return '0'
                        } else {
                            return '100%'
                        }
                    })
                    .style('height', function (d) {
                        if (d.properties.confidenceinterval.includes('Unavailable')) {
                            return '0'
                        } else {
                            return '140'
                        }
                    });

                let ciOuterLineG = ciSVG.append('g')
                    .classed('ci-lines', true);
                
                ciOuterLineG.append('line')
                    .attr('x1', mapWidth/2)
                    .attr('x2', function (d) {
                        let biggest = 25;
                        if (!isNaN(parseFloat(d.properties.confidenceinterval.split('-')[1]))) {
                            biggest = parseFloat(d.properties.confidenceinterval.split('-')[1]);
                            if (biggest <= 25) {
                                biggest = 25;
                            } else if (biggest >= 70) {
                                biggest = 70;
                            }
                        }
                        return (mapWidth/2) + biggest + 30; 
                    })
                    .attr('y1', 50)
                    .attr('y2', 50)
                    .attr('stroke', '#666')
                    .attr('stroke-width', function (d) {
                        if (isNaN(parseFloat(d.properties.confidenceinterval.split('-')[1]))) {
                            return 0;
                        } else {
                            return 1;
                        }
                    });

                ciOuterLineG.append('text')
                    .attr('x', function (d) {
                        let biggest = 25;
                        if (!isNaN(parseFloat(d.properties.confidenceinterval.split('-')[1]))) {
                            biggest = parseFloat(d.properties.confidenceinterval.split('-')[1]);
                            if (biggest <= 25) {
                                biggest = 25;
                            } else if (biggest >= 70) {
                                biggest = 70;
                            } 
                        }
                        return (mapWidth/2) + biggest + 35; 
                    })
                    .attr('y', 55)
                    .text(function (d) {
                        let biggest = parseFloat(d.properties.confidenceinterval.split('-')[1]);
                        if (isNaN(biggest)) {
                            return '';
                        } else {
                            return biggest;
                        }
                    })

                let ciOuterG = ciSVG.append('g')
                    .classed('ci-dots', true);
                    
                let bigDot = ciOuterG.append('circle')
                    .attr('cx', mapWidth/2)
                    .attr('cy', 70)
                    .attr('r', function (d) {
                        let biggest = 25;
                        if (!isNaN(parseFloat(d.properties.confidenceinterval.split('-')[1]))) {
                            biggest = parseFloat(d.properties.confidenceinterval.split('-')[1]);
                            if (biggest <= 25) {
                                biggest = 25;
                            } else if (biggest >= 70) {
                                biggest = 70;
                            }
                        }
                        return biggest; 
                    })
                    .attr('fill', '#93e1f5')
                    .attr('fill-opacity', 1)
                    .style('stroke', '#fff')
                    .style('stroke-width', '0');

                let medDot = ciOuterG.append('circle')
                    .attr('cx', mapWidth/2)
                    .attr('cy', 70)
                    .attr('r', function (d) {
                        let halfway = 10;
                        if (!isNaN(parseFloat(d.properties.prevalenceper10000))) {
                            halfway = parseFloat(d.properties.prevalenceper10000);
                            if (!isNaN(parseFloat(d.properties.confidenceinterval.split('-')[1]))){
                                let biggest = parseFloat(d.properties.confidenceinterval.split('-')[1]);
                                if (biggest <= 25) {
                                    halfway = halfway + (25 - biggest);
                                } else if (biggest >= 70) {
                                    halfway = halfway - (biggest - 70);
                                }
                            }
                            if (halfway < 10) {
                                halfway = 10;
                            }
                        }
                        return halfway;
                    })
                    .attr('fill', '#00bcf0')
                    .attr('fill-opacity', 1)
                    .style('stroke', '#fff')
                    .style('stroke-width', 1);

                let ciInnerLineG = ciSVG.append('g')
                    .classed('ci-lines', true);
                
                ciInnerLineG.append('line')
                    .attr('x1', mapWidth/2)
                    .attr('x2', function (d) {
                        let biggest = 25;
                        if (!isNaN(parseFloat(d.properties.confidenceinterval.split('-')[1]))) {
                            biggest = parseFloat(d.properties.confidenceinterval.split('-')[1]);
                            if (biggest <= 25) {
                                biggest = 25;
                            } else if (biggest >= 70) {
                                biggest = 70;
                            }
                        }
                        return (mapWidth/2) + biggest + 20; 
                    })
                    .attr('y1', 70)
                    .attr('y2', 70)
                    .attr('stroke', '#666')
                    .attr('stroke-width', function (d) {
                        if (isNaN(parseFloat(d.properties.confidenceinterval.split('-')[1]))) {
                            return 0;
                        } else {
                            return 1;
                        }
                    });

                ciInnerLineG.append('text')
                    .attr('x', function (d) {
                        let biggest = 25;
                        if (!isNaN(parseFloat(d.properties.confidenceinterval.split('-')[1]))) {
                            biggest = parseFloat(d.properties.confidenceinterval.split('-')[1]);
                            if (biggest <= 25) {
                                biggest = 25;
                            } else if (biggest >= 70) {
                                biggest = 70;
                            }
                        }
                        return (mapWidth/2) + biggest + 25; 
                    })
                    .attr('y', 75)
                    .text(function (d) {
                        let smallest = parseFloat(d.properties.confidenceinterval.split('-')[0]);
                        if (isNaN(smallest)) {
                            return '';
                        } else {
                            return smallest;
                        }
                    })                

                let ciInnerG = ciSVG.append('g')
                    .classed('ci-dots', true);

                let smallDot = ciInnerG.append('circle')
                    .attr('cx', mapWidth/2)
                    .attr('cy', 70)
                    .attr('r', function (d) {
                        let smallest = 5;
                        if (!isNaN(parseFloat(d.properties.confidenceinterval.split('-')[0]))) {
                            smallest = parseFloat(d.properties.confidenceinterval.split('-')[0]);
                            if (!isNaN(parseFloat(d.properties.confidenceinterval.split('-')[1]))) {
                                let biggest = parseFloat(d.properties.confidenceinterval.split('-')[1]);
                                if (biggest <= 25) {
                                    smallest = smallest + (25 - biggest);
                                } else if (biggest >= 70) {
                                    smallest = smallest - (biggest - 70);
                                }
                                if (smallest < 5) {
                                    smallest = 5;
                                }
                            }
                        }
                        return smallest; 
                    })
                    .attr('fill', '#009bcc')
                    .attr('fill-opacity', 1)
                    .style('stroke', '#fff')
                    .style('stroke-width', '0');

                d3.select('#studies_tbody').selectAll('tr').sort(function(a, b){ 
                    return a.properties.pk - b.properties.pk; 
                });

                $('.collapse').collapse({
                    toggle: false
                });
     
            });
        }
        
        // point color function
        function pointColor(feature) {
            if (feature.properties.recommended == 'yes' || feature.properties.recommended == 'Yes') {
                return '#03C0FF';
            } else {
                return '#007095';
            }
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

    // initialize
    app.list.loadWorldMap();

    /*
    if (timeline_type == 'studied') {
        $('#earliest-label').text('Earliest year studied');
        $('#latest-label').text('Latest year studied');
    } else {
        $('#earliest-label').text('Earliest publication date');
        $('#latest-label').text('Latest publication date');
    }
    */

    });
}
