// const width = $("#map").width();
// const height = $("#map").height();

const projection = d3.geoBertin1953();
const path = d3.geoPath().projection(projection);

const svg = d3.select("#map").append("svg")
    .style("width", "100%")
    .style("height", "100%");
    
const g = svg.append("g");

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
});



