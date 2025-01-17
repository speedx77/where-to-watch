import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import {tmdbKey, traktAPIKey} from "./secrets.js";

const app = express();
const port = 3001;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "where_to_watch",
    password: "test123",
    port: 5432,
});
//db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
    res.status(200).render("home.ejs")
});

/*
    search using watchNode
    Return list of items 
        with these items query 1. imdb 2. tmdb
    make calls for these items and pull metadata
    return metadata

    display metadata on FE

    ----------- new ideas 1/14 ------------

    search using traktAPI, find tmdb id
    display results via
        tmdb show/movie image via id
        tmdb show detail via id
    click on /show/id or /movie/id content/id
        display tmdb show/movie image via id
        tmdb show detail via id
        tmdb where to watch
        tmdb vendor images

        -we're not linking out to external service

*/
app.get("/testResult", async (req, res) => {
    res.render("results.ejs")
})

app.post("/search", async (req, res) => {
    let searchTerm = req.body.searchTerm;
    var movieResponse;
    var showResponse;
    var errorMsg = {
        error: "Show or Movie could not be found!",
        tryAgain: "Please Try Again!"
    };

    var searchPackage = [];

    // https://api.trakt.tv/search/movie?query=cars
    try{
        movieResponse = await axios.get(`https://api.trakt.tv/search/movie?query=${searchTerm}`, {
            headers : {
                "Content-Type" : "application/json",
                "trakt-api-version" : 2,
                "trakt-api-key" : "085da6080bfa1ca467eba85623f724c7602df0a966fe56b59748b8a1c7e72516"
            }
        })
    } catch(error){
        console.log(error)
        res.status(404).send(errorMsg)

    }
    try {
        showResponse = await axios.get(`https://api.trakt.tv/search/show?query=${searchTerm}`, {
            headers : {
                "Content-Type" : "application/json",
                "trakt-api-version" : 2,
                "trakt-api-key" : "085da6080bfa1ca467eba85623f724c7602df0a966fe56b59748b8a1c7e72516"
            }
        })
    } catch (error){
        console.log(error)
        res.status(404).send(errorMsg)
    }

    const movieResult = movieResponse.data;
    const showResult = showResponse.data;

    console.log(movieResult.length)
    console.log(showResult.length);

    let searchResults = {
        movie : movieResult,
        show : showResult
    }

    if (movieResult.length === 0){
        console.log("no movies found")
    } else{
        for (var i = 0; i < movieResult.length; i++){
            var detailResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieResult[i].movie.ids.tmdb}?language=en-US`, {
                    headers : {
                        "accept" : "application/json",
                        "Authorization" : `Bearer ${tmdbKey}`
                    }
                }
            )

            var imageResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieResult[i].movie.ids.tmdb}/images`, {
                    headers : {
                        "accept" : "application/json",
                        "Authorization" : `Bearer ${tmdbKey}`
                    }
                }
            )

            //console.log(imageResponse.data.id)
            //console.log(imageResponse.posters)

            searchPackage.push({
                type: movieResult[i].type,
                year : movieResult[i].movie.year,
                title : movieResult[i].movie.title,
                description : detailResponse.overview,
                poster : `https://image.tmdb.org/t/p/w500${imageResponse.data.posters[0].file_path}`

            })
        }
    }

    if (showResult.length ===  0){
        console.log("No shows found")
    } else {
        for (var i = 0; i < showResult.length; i++){
            var detailResponse = await axios.get(`https://api.themoviedb.org/3/tv/${showResult[i].show.ids.tmdb}?language=en-US`, {
                    headers : {
                        "accept" : "application/json",
                        "Authorization" : `Bearer ${tmdbKey}`
                    }
                }
            )

            var imageResponse = await axios.get(`https://api.themoviedb.org/3/tv/${showResult[i].show.ids.tmdb}/images`, {
                    headers : {
                        "accept" : "application/json",
                        "Authorization" : `Bearer ${tmdbKey}`
                    }
                }
            )

            searchPackage.push({
                type: showResult[i].type,
                year : showResult[i].show.year,
                title : showResult[i].show.title,
                description : showResult.overview,
                poster : `https://image.tmdb.org/t/p/w500${imageResponse.data.posters[0].file_path}`

            })
        }
    }

    res.status(200).send(searchPackage);

})


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});