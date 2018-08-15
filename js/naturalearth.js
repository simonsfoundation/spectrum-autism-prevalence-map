
// constants
const width = $("#map").width();
const height = $("#map").height();

// map projection
const projection = d3.geoNaturalEarth1()
    .scale(250)
    .translate([width / 2, height / 2]);

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

// add map data to the world map g container
d3.json("https://unpkg.com/world-atlas@1/world/110m.json").then(function(world) {
    g.append("g")
        .attr("id", "countries")
        .selectAll("path")
        .data(topojson.feature(world, world.objects.countries).features)
        .enter().append("path")
        .attr("d", path);

    g.append("path")
        .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
        .attr("id", "country-borders")
        .attr("d", path);

    addOverlay();
});

// add overlay dataset
function addOverlay() {
    d3.json("https://spreadsheets.google.com/feeds/list/1_cvjG5FD9ZsErdguV5se3IMqi3AxcSKl_JBB1JRyOMo/1/public/values?alt=json").then(function(data) {
        console.log(data.feed.entry);
    });
}




// set up map for zooming
const g_zoom = d3.select("#g");
const svg_zoom = d3.select('#svg');

const zoom = d3.zoom()
    .scaleExtent([1/2, 4])
    .on("zoom", zoomed);

svg_zoom.call(zoom);

// define zooming function for zooming map
function zoomed() {
    g_zoom.attr('transform', `translate(${d3.event.transform.x},  ${d3.event.transform.y}) scale(${d3.event.transform.k})`);
};

// define function zoom transiton 
function transition(zoomLevel) {
    svg_zoom.transition()
        .delay(100)
        .duration(700)
        .call(zoom.scaleBy, zoomLevel);
        //.call(zoom.transform, transform);
        //.on("end", function() { canvas.call(transition); });
}

// set up listeners for zoom
d3.selectAll('button').on('click', function() {
    // zoom in 0.2 each time
    if (this.id === 'zoom-in') {
        transition(1.5); 
    }
    // zoom out 0.2 each time
    if (this.id === 'zoom-out') {
        transition(0.5); 
    }
    // return to initial state
    if (this.id === 'zoom_init') {
        svg_zoom.transition()
            .delay(100)
            .duration(700)
            .call(zoom.scaleTo, 1); 
    }
});
