import { app } from './app.js';

export function ttInitList() {
    $(document).ready(function (){
        // app.list scope
        app.list = {};
        
        const table = d3.select('#studies-table');

        // map projection
        const fixedWidth = 509;
        const fixedHeight = 323;

        const projection = d3.geoKavrayskiy7()
            .scale(250);

        // function to create paths from map projection
        const path = d3.geoPath().projection(projection);

        let world = null;

        app.list.loadWorldMap = function() {
            d3.json(world_atlas).then(function(data) {
                world = data;
                app.list.addRows();
            });
        }

        // function to render mini SVG map
        app.list.renderMiniMap = function(studyData, placeholderId) {
            const placeholder = d3.select('#' + placeholderId);
            let mapSVG = placeholder.append('svg')
                .attr('width', '509px')
                .attr('height', '323px')
                .attr('viewBox', '0 0 509 323')
                .classed('bg-white border-white border-4', true)
                .attr('id', 'map_svg_' + studyData.properties.pk);

            let mapG = mapSVG.append('g')
                .classed('countries', true)
                .attr('id', 'map_svg_g_' + studyData.properties.pk);

            mapG.selectAll('path')
                .data(topojson.feature(world, world.objects.countries).features.filter(function(d){
                    return d.id !== '010';
                }))
                .enter().append('path')
                .attr('d', path)
                .attr('fill', '#ccc');

            mapG.append('path')
                .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
                .classed('country-borders', true)
                .attr('d', path)
                .attr('fill', 'none')
                .attr('stroke', '#FFF')
                .each(function() {
                    d3.select(this).attr('stroke-width', '1px');
                });

            const studiesG = mapG.append('g');

            studiesG.append('circle')
                .attr('cx', function() { 
                    return projection(studyData.geometry.coordinates)[0]; 
                })
                .attr('cy', function() { 
                    return projection(studyData.geometry.coordinates)[1]; 
                })
                .attr('r', 8)
                .style('fill', pointColor(studyData))
                .style('fill-opacity', '1')
                .attr('id', 'map_dot_' + studyData.properties.pk);

            mapSVG.each(function() {
                let zoom = d3.zoom()
                    .on('zoom', function() {
                        d3.select('#map_svg_g_' + studyData.properties.pk)
                          .attr('transform', d3.event.transform);
                    });
                d3.select('#map_svg_' + studyData.properties.pk)
                  .call(zoom.scaleTo, 1)
                  .call(zoom.translateTo, projection(studyData.geometry.coordinates)[0] - 30, projection(studyData.geometry.coordinates)[1] + 75);
            });
        };

        app.list.addRows = function() {
            $('#studies-table tbody').remove();     
            d3.json('/studies-api/' + app.api_call_param_string).then(function(data) {
                studies = data;

                // update the results count
                document.getElementById('results-count').textContent = studies.features.length;

                // map from study primary key to its data for later lookup
                app.list.studiesByPk = {};
                studies.features.forEach(function(d) {
                    app.list.studiesByPk[d.properties.pk] = d;
                });

                let enter_selection = table.append('tbody')
                    .attr('id', 'studies-table_tbody')
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
                        return '#accordion_menu_' + d.properties.pk;
                    })
                    .classed('border-light-gray2 border-b-1.25', true);

                const toggletd = row1.append('th')
                    .attr('scope', 'row')
                    .classed('p-0 pl-3.75 w-toggle', true);

                toggletd.append('img')
                    .attr('src', chevron_down)
                    .attr('alt', 'chevron down icon')
                    .classed('chevron-down cursor-pointer', true);
                
                row1.append('td')
                    .text(function (d) { 
                        return d.properties.yearpublished; 
                    })
                    .classed('w-td1', true);

                row1.append('td')
                    .html(function (d) { 
                        const authors = d.properties.authors.replace('et al.', '<em>et al.</em>');
                        return authors; 
                    })
                    .classed('w-td2 pr-8', true);

                row1.append('td')
                    .text(function (d) { 
                        return d.properties.country; 
                    })
                    .classed('w-td3', true);

                row1.append('td')
                    .text(function (d) { 
                        return d.properties.area.replace(/ *([|]) */g, '$1').split('|').join(', ');
                    })
                    .classed('w-td4 pr-8', true);

                row1.append('td')
                    .text(function (d) { 
                        return d.properties.samplesize; 
                    })
                    .classed('w-td5', true);

                row1.append('td')
                    .text(function (d) { 
                        return d.properties.prevalenceper10000.replace(/ *([|]) */g, '$1').split('|').join(', ');
                    })
                    .classed('w-td6', true);

                row1.append('td')
                    .text(function (d) { 
                        return d.properties.confidenceinterval.replace(/ *([|]) */g, '$1').split('|').join(', '); 
                    })

                let row2 = enter_selection.insert('tr')
                    .classed('collapse bg-tan', true)
                    .attr('id', function (d) { 
                        return 'accordion_menu_' + d.properties.pk; 
                    })
                    .attr('data-collapse-target', 'true');

                let card_div = row2.append('td')
                    .attr('colspan', '9')
                    .append('div')
                    .classed('flex', true)

                card_div.append('div')
                    .classed('w-listcard pl-13.75 pr-8', true)
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

                        let links_string = '';
                        if (links.length > 0) {
                            links_string = links
                                .map(link => `<div class="mt-3 text-4 text-med-navy tracking-2 leading-6.25">${link}</div>`)
                                .join('');
                            links_string = links_string.replace('>Spectrum', '><em>Spectrum</em>');
                        }

                        return '<div class="text-4 text-med-navy tracking-2 leading-6.25"><strong>Age (Years):</strong> ' + age + '</div>' +
                        '<div class="mt-3 text-4 text-med-navy tracking-2 leading-6.25"><strong>Individuals with autism:</strong> ' + d.properties.individualswithautism + '</div>' +
                        '<div class="mt-3 text-4 text-med-navy tracking-2 leading-6.25"><strong>Diagnostic criteria:</strong> ' + diagnosticcriteria + '</div>' +
                        '<div class="mt-3 text-4 text-med-navy tracking-2 leading-6.25"><strong>Diagnostic tools:</strong> ' + diagnostictools + '</div>' +
                        '<div class="mt-3 text-4 text-med-navy tracking-2 leading-6.25"><strong>Percent w/average IQ:</strong> ' + d.properties.percentwaverageiq + '</div>' +
                        '<div class="mt-3 text-4 text-med-navy tracking-2 leading-6.25"><strong>Sex ratio (M:F):</strong> ' + d.properties.sexratiomf + '</div>' +
                        '<div class="mt-3 text-4 text-med-navy tracking-2 leading-6.25"><strong>Year(s) studied:</strong> ' + d.properties.yearsstudied + '</div>' +
                        '<div class="mt-3 text-4 text-med-navy tracking-2 leading-6.25"><strong>Category:</strong> ' + d.properties.categoryadpddorasd + '</div>' +
                        links_string;
                    });

                // add placeholder that we will add map to when expanded
                card_div.append('div')
                    .attr('id', function(d) { return 'map_placeholder_' + d.properties.pk; });

                d3.select('#studies-table_tbody').selectAll('tr').sort(function(a, b){ 
                    return a.properties.pk - b.properties.pk; 
                });

                $('[data-collapse-target]').collapse({
                    toggle: false
                });

                $('[data-collapse-target]').on('shown.bs.collapse', function() {
                    var collapseId = $(this).attr('id'); // e.g., "accordion_menu_123"
                    var pk = collapseId.replace('accordion_menu_', '');
                    var placeholder = $('#map_placeholder_' + pk);
                    if (placeholder.children().length === 0) {
                        var studyData = app.list.studiesByPk[pk];
                        app.list.renderMiniMap(studyData, 'map_placeholder_' + pk);
                    }
                });
            });
        }
        
        // point color function
        function pointColor(feature) {
            return '#D14D57';
            /*
            this functionality is no longer used, commenting out for now and to be removed later if not needed
            if (feature.properties.recommended == 'yes' || feature.properties.recommended == 'Yes') {
                // standard darker red
                return '#910E1C';
            } else {
                // light red
                return '#D14D57';
            }
            */
        }

        // listener to toggle arrows on click
        $(document).on('click', '.study_row', function(){
            $(this).find('.chevron-down').toggleClass('open');
        });

        // initialize
        app.list.loadWorldMap();
    });
}
