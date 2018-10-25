$(document).ready(function (){

    d3.json("https://www.spectrumnews.org/wp-json/wp/v2/pages/62361").then(function(data) {
        content = data;
        $("#wp-content").html(content.content.rendered);   
        if(window.location.hash) {
            location.hash = window.location.hash;
        }
    });

});
