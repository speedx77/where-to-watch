import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import {tmdbKey, traktClientId} from "./secrets/secrets.js";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv"

const app = express();
const port = 3001;
env.config();
const salt = Number(process.env.SALT);

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});
db.connect();

//---------------------------------------------

app.get("/", async (req, res) => {
    res.status(200).render("home.ejs")
});

app.get("/signup", async(req, res) => {

    res.status(200).render("signup.ejs")
})

app.post("/register", async(req, res) => {
    const email = req.body.email;
    const password = req.body.pwd;

    console.log(password)
    console.log(salt)

    try {
        const checkEmails = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        console.log(checkEmails.rows)

        if (checkEmails.rows.length > 0){
            res.status(200).render("signup.ejs", {error: "Email Already Exists"})
        } else {
            bcrypt.hash(password, salt, async (err, hash) => {
                if (err){
                    console.log("Error Hashing Password", err);
                } else {

                    try {
                        const result = await db.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *", 
                            [email, hash]
                        );
                        const user = result.rows[0];
                        req.login(user, (err) => {
                            console.log('success');
                            res.redirect("/")
                        })

                    } catch(error){
                        console.log(error)
                    }

                }
            })
        }

    } catch(error){
        console.log(error)
    }
})

app.get("/login", async(req, res) => {
    res.status(200).render("login.ejs")
})


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
    var wasSearchTermFound = false;

    var searchPackage = [];
    var contentScore = [];

    // https://api.trakt.tv/search/movie?query=cars
    try{
        movieResponse = await axios.get(`https://api.trakt.tv/search/movie?query=${searchTerm}`, {
            headers : {
                "Content-Type" : "application/json",
                "trakt-api-version" : 2,
                "trakt-api-key" : traktClientId
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
                "trakt-api-key" : traktClientId
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

            if(movieResult[i].movie.ids.tmdb === null){
                i++
            } else {
                try {

                    var detailResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieResult[i].movie.ids.tmdb}?language=en-US`, {
                            headers : {
                                "accept" : "application/json",
                                "Authorization" : `Bearer ${tmdbKey}`
                            }
                        }
                    )
                    
                    try {
    
                        var imageResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieResult[i].movie.ids.tmdb}/images`, {
                                headers : {
                                    "accept" : "application/json",
                                    "Authorization" : `Bearer ${tmdbKey}`
                                }
                            }
                        )
                        
    
                        searchPackage.push({
                            id: movieResult[i].movie.ids.tmdb,
                            popularity: detailResponse.data.popularity,                            
                            type: movieResult[i].type,
                            year : movieResult[i].movie.year,
                            title : movieResult[i].movie.title,
                            description : detailResponse.data.overview,
                            poster : `https://image.tmdb.org/t/p/w500${imageResponse.data.posters[0].file_path}`
            
                        })
    
                    } catch(error) {
                        if (error.response && error.response.status === 404) {
                            console.log("Movie Not Found");
                        }
                    }
    
                } catch(error) {
                    if (error.response && error.response.status === 404) {
                        console.log("Movie Not Found");
                    }
                }
            }
            //console.log(imageResponse.data.id)
            //console.log(imageResponse.posters)

            
        }
    }

    if (showResult.length ===  0){
        console.log("No shows found")
    } else {
        for (var i = 0; i < showResult.length; i++){

            if(showResult[i].show.ids.tmdb === null){
                i++
            } else {
                try {

                    var detailResponse = await axios.get(`https://api.themoviedb.org/3/tv/${showResult[i].show.ids.tmdb}?language=en-US`, {
                            headers : {
                                "accept" : "application/json",
                                "Authorization" : `Bearer ${tmdbKey}`
                            }
                        }
                    )

                    try {

                        var imageResponse = await axios.get(`https://api.themoviedb.org/3/tv/${showResult[i].show.ids.tmdb}/images`, {
                                headers : {
                                    "accept" : "application/json",
                                    "Authorization" : `Bearer ${tmdbKey}`
                                }
                            }
                        )

                        //console.log(detailResponse)

                        searchPackage.push({
                            id: showResult[i].show.ids.tmdb,
                            popularity: detailResponse.data.popularity,
                            type: showResult[i].type,
                            year : showResult[i].show.year,
                            title : showResult[i].show.title,
                            description : detailResponse.data.overview,
                            poster : `https://image.tmdb.org/t/p/w500${imageResponse.data.posters[0].file_path}`
            
                        })
                        
                    } catch(error) {}
    
                } catch(error) {
                    if (error.response && error.response.status === 404) {
                        console.log("Movie Not Found");
                    }
                }
            }
            
        }
    }
    //need to sort by closest match and then popularity score
    searchPackage.sort((element1, element2) => element2.popularity - element1.popularity)

    wasSearchTermFound = true
    //res.status(200).send(searchPackage)
    res.status(200).render("results.ejs", {wasSearchTermFound : wasSearchTermFound, searchData : searchPackage});

})

app.get("/show/:id", async (req,res) => {
    let id = req.params.id
    let detailPagePackage;


    try{

        var detailResponse = await axios.get(`https://api.themoviedb.org/3/tv/${id}?language=en-US`, {
                    headers : {
                        "accept" : "application/json",
                        "Authorization" : `Bearer ${tmdbKey}`
                    }
                }
            )

            try {

                var providerResponse = await axios.get(`https://api.themoviedb.org/3/tv/${id}/watch/providers`, {
                    headers : {
                        "accept" : "application/json",
                        "Authorization" : `Bearer ${tmdbKey}`
                    }
                })

                
                try {

                    var imageResponse = await axios.get(`https://api.themoviedb.org/3/tv/${id}/images`, {
                            headers : {
                                "accept" : "application/json",
                                "Authorization" : `Bearer ${tmdbKey}`
                            }
                        }
                    )

                    //types = flatrate, buy, ads (see providers example)
                    /*
                    id: showResult[i].show.ids.tmdb,
                            popularity: detailResponse.data.popularity,
                            type: showResult[i].type,
                            year : showResult[i].show.year,
                            title : showResult[i].show.title,
                            description : detailResponse.data.overview,
                            poster : `https://image.tmdb.org/t/p/w500${imageResponse.data.posters[0].file_path}`
                    */
                    detailPagePackage = {
                        id: id,
                        type: "Show",
                        premiere_date: detailResponse.data.first_air_date || null,
                        title: detailResponse.data.name || null,
                        tagline: detailResponse.data.tagline || null,
                        description: detailResponse.data.overview || null,
                        genres: detailResponse.data.genres || null,
                        poster: `https://image.tmdb.org/t/p/w500${imageResponse.data.posters[0].file_path}`,
                        backdrop: `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${imageResponse.data.backdrops[0].file_path}`,
                        providers: providerResponse.data.results.US

                    }

                    console.log(detailPagePackage);


                } catch (error) {
                    console.log(error)
                }


            } catch(error) {
                console.log(error)
            }

    } catch(error) {
        console.log(error)
    }

    

    //res.status(200).send(detailPagePackage)
    res.status(200).render("show-detail.ejs", {detailPage : detailPagePackage})
})

app.get("/movie/:id", async (req,res) => {
    let id = req.params.id
    let detailPagePackage;


    try{

        var detailResponse = await axios.get(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, {
                    headers : {
                        "accept" : "application/json",
                        "Authorization" : `Bearer ${tmdbKey}`
                    }
                }
            )

            try {

                var providerResponse = await axios.get(`https://api.themoviedb.org/3/movie/${id}/watch/providers`, {
                    headers : {
                        "accept" : "application/json",
                        "Authorization" : `Bearer ${tmdbKey}`
                    }
                })

                
                try {

                    var imageResponse = await axios.get(`https://api.themoviedb.org/3/movie/${id}/images`, {
                            headers : {
                                "accept" : "application/json",
                                "Authorization" : `Bearer ${tmdbKey}`
                            }
                        }
                    )

                    //types = flatrate, buy, ads (see providers example)
                    /*
                    id: showResult[i].show.ids.tmdb,
                            popularity: detailResponse.data.popularity,
                            type: showResult[i].type,
                            year : showResult[i].show.year,
                            title : showResult[i].show.title,
                            description : detailResponse.data.overview,
                            poster : `https://image.tmdb.org/t/p/w500${imageResponse.data.posters[0].file_path}`         
                            */

                            detailPagePackage = {
                                id: id,
                                type: "Movie",
                                premiere_date: detailResponse.data.release_date || null,
                                title: detailResponse.data.title || null,
                                tagline: detailResponse.data.tagline || null,
                                description: detailResponse.data.overview || null,
                                genres: detailResponse.data.genres || null,
                                poster: `https://image.tmdb.org/t/p/w500${imageResponse.data.posters[0].file_path}`,
                                backdrop: `https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${imageResponse.data.backdrops[0].file_path}`,
                                providers: providerResponse.data.results.US || null
        
                            }
                    

                } catch (error) {
                    console.log(error)
                }


            } catch(error) {
                console.log(error)
            }

    } catch(error) {
        console.log(error)
    }

    


    //res.status(200).send(detailPagePackage)
    res.status(200).render("movie-detail.ejs", {detailPage : detailPagePackage})
});



app.post("/like", async (req, res) =>{
    const userId = req.body.userId
    const like = req.body.isLiked;
    const contentName = req.body.contentName;
    const contentType = req.body.contentType;
    const contentId = req.body.contentId;

    //console.log(like)
    //INSERT INTO likes () VALUES ($1 $2 $3 $4) WHERE userId=$5
});

app.post("/like", async (req, res) =>{
    const userId = req.body.userId
    const disLike = req.body.isLiked;
    const contentName = req.body.contentName;
    const contentType = req.body.contentType;
    const contentId = req.body.contentId;

    //console.log(like)
    //INSERT INTO likes () VALUES ($1 $2 $3 $4) WHERE userId=$5
    //UPDATE items SET dislike to opposite?
})

passport.use("local",
    new Strategy(async function verify(email, password, cb) {
        try{
            const checkEmails = await db.query("SELECT * FROM users WHERE email = $1", [email]);

            if (result.rows.length > 0){
                const user = result.rows[0];
                const storedHashPassword = user.password;
                bcrypt.compare(password, storedHashPassword, (err, valid) => {
                    if (err){
                        console.error("Error comparing passwords:", err);
                        return cb(err);
                    } else {
                        if (valid) {
                            return cb(null, user);
                        } else {
                            return cb(null, false);
                        }
                    }
                })
            } else {
                return cb("User not found");
            }
        } catch(error) {
            console.log(error)
        }
    })
)

passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((user, cb) => {
    cb(null, user);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});