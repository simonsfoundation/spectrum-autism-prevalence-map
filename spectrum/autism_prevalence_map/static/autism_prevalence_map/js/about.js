$(document).ready(function (){

    d3.json("https://www.spectrumnews.org/wp-json/wp/v2/pages/62361").then(function(data) {
        content = data;
        console.log(content);
        $("#wp-content").html(content.content.rendered);   
    });

});
