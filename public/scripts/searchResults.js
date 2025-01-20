
var results = document.getElementsByClassName("result")

for(var i = 0; i < results.length; i++){
    if (results[i].getAttribute("data-content-type") === "show") {
        results[i].setAttribute("href", `/show/${results[i].getAttribute("data-tmdb-id")}`)
    } else if(results[i].getAttribute("data-content-type") === "movie") {
        results[i].setAttribute("href", `/movie/${results[i].getAttribute("data-tmdb-id")}`)
    }
}