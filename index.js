import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import {watchModeApiKey} from "./secrets.js";

const app = express();
const port = 3001;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "where_to_watch",
    password: "test123",
    port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
    res.status(200).send("Where To Watch")
});

/*
    search using watchNode
    Return list of items 
        with these items query 1. imdb 2. tmdb
    make calls for these items and pull metadata
    return metadata

    display metadata on FE



*/

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});