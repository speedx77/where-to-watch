import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
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

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});