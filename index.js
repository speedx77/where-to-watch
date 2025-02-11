import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv"
import multer from "multer";
import path from "path";

//process.env.TMDB_KEY
//process.env.TRACK_CLIENT_ID
const app = express();
const port = 3001;
env.config();
const salt = Number(process.env.SALT);
const upload = multer({ dest: "uploads/" });

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie : {
            maxAge: 1000 * 60 * 60 * 24 //24 hrs
        }
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
    let isUserAutheneticated = false;

    if(req.isAuthenticated()){
        const email = req.user.email;
        var pfp = null;
        isUserAutheneticated = true;
        try {
            const pfpRead = await db.query("SELECT pfpfilename FROM users WHERE email = $1", [email])
            if(pfpRead.rows[0].pfpfilename === null){
                pfp = "assets/pfp.png";
            } else{
                //console.log(pfpRead.rows[0].pfp)
                pfp = `/image/${pfpRead.rows[0].pfpfilename}`;
            }
        } catch(error){
            console.log(error)
        }
        res.status(200).render("home.ejs", {auth: isUserAutheneticated, pfp: pfp});


    } else {
        isUserAutheneticated = false;
        res.status(200).render("home.ejs", {auth: isUserAutheneticated});
    }

});

app.get('/test', (req, res) => {
    res.render("test.ejs")
})

app.get("/profile", async (req, res) => {
    console.log(req.user)
    let isUserAutheneticated = false;

    if(req.isAuthenticated()){
        isUserAutheneticated = true
        const email = req.user.email;
        var pfp = null;
        var name = null;
        var watchlist = null;
        var watchlistPackage = [];
        var likePackage = [];
        var dislikeList = null;
        var dislikePackage = [];
        const userId = req.user.userid;
        console.log(userId);

        try {
            const pfpRead = await db.query("SELECT displayname, pfpfilename FROM users WHERE email = $1", [email])
            name = pfpRead.rows[0].displayname;
            if(pfpRead.rows[0].pfpfilename === null){
                pfp = "assets/pfp.png";
            } else{
                //console.log(pfpRead.rows[0].pfp)
                pfp = `/image/${pfpRead.rows[0].pfpfilename}`;
            }

        } catch(error){
            console.log(error)
        }

        
        //await fetch("http:localhost:3001/watchlist").then(response=> response.json()).then(data => {watchlist = data})
        try {
            const watchlistLookup = await db.query("SELECT * FROM watchlist WHERE userId = $1", [userId])
            watchlist = watchlistLookup.rows[0];
            /*replace async in foreach with promiseAll
            if(watchlistLookup.rows.length > 0){
                watchlistLookup.rows.forEach(async (element)=> {
                    if (element.type === 'Show'){
                        try{
                            var imageResponse = await axios.get(`https://api.themoviedb.org/3/tv/${element.contentid}/images`, {
                                headers : {
                                    "accept" : "application/json",
                                    "Authorization" : `Bearer ${process.env.TMDB_KEY}`
                                }
                            }
                        )
        
                        watchlistPackage.push({
                            contentid: element.contentid,
                            type: element.type,
                            poster: `https://image.tmdb.org/t/p/w500${imageResponse.data.posters[0].file_path}`,
    
                        })
                        console.log("in try:", watchlistPackage)
                        } catch(error){
                            console.log(error)
                        }
                    } else if (element.type === 'Movie'){
                        try{
                            var imageResponse = await axios.get(`https://api.themoviedb.org/3/movie/${element.contentid}/images`, {
                                headers : {
                                    "accept" : "application/json",
                                    "Authorization" : `Bearer ${process.env.TMDB_KEY}`
                                }
                            }
                        )
                        } catch(error){
                            console.log(error)
                        }
                    }
                    console.log("in for each", watchlistPackage)

                    

                })

                console.log("in if block:", watchlistPackage)

            } else{
            }
            */
           for(var i = 0; i < watchlistLookup.rows.length; i++){
            if (watchlistLookup.rows[i].type === 'Show'){
                try{
                    var imageResponse = await axios.get(`https://api.themoviedb.org/3/tv/${watchlistLookup.rows[i].contentid}/images`, {
                        headers : {
                            "accept" : "application/json",
                            "Authorization" : `Bearer ${process.env.TMDB_KEY}`
                        }
                    }
                )

                watchlistPackage.push({
                    contentid: watchlistLookup.rows[i].contentid,
                    type: watchlistLookup.rows[i].type,
                    poster: `https://image.tmdb.org/t/p/w500${imageResponse.data.posters[0].file_path}`,

                })
                //console.log("in try:", watchlistPackage)
                } catch(error){
                    console.log(error)
                }
            } else if (watchlistLookup.rows[i].type === 'Movie'){
                try{
                    var imageResponse = await axios.get(`https://api.themoviedb.org/3/movie/${watchlistLookup.rows[i].contentid}/images`, {
                        headers : {
                            "accept" : "application/json",
                            "Authorization" : `Bearer ${process.env.TMDB_KEY}`
                        }
                    }
                )

                watchlistPackage.push({
                    contentid: watchlistLookup.rows[i].contentid,
                    type: watchlistLookup.rows[i].type,
                    poster: `https://image.tmdb.org/t/p/w500${imageResponse.data.posters[0].file_path}`,

                })
                } catch(error){
                    console.log(error)
                }
            }
           }
        } catch(error){
            console.log(error)
        }

        try{
            const likeLookup = await db.query("SELECT userId, contentname, contentid, type FROM likes WHERE liked=$1 AND userId=$2",
                ['like', userId]);
            let likeList = likeLookup.rows;

            for(var i=0; i < likeList.length; i++){
                if(likeList[i].type === 'Show'){

                    try{
                        var imageResponse = await axios.get(`https://api.themoviedb.org/3/tv/${likeList[i].contentid}/images`, {
                                headers : {
                                    "accept" : "application/json",
                                    "Authorization" : `Bearer ${process.env.TMDB_KEY}`
                                }
                            }
                        )

                        likePackage.push({
                            contentid: likeList[i].contentid,
                            type: likeList[i].type,
                            poster: `https://image.tmdb.org/t/p/w500${imageResponse.data.posters[0].file_path}`,
                        })
                    } catch(error){
                        console.log(error)
                    }
                    
                } else if(likeList[i].type === 'Movie') {
                    try{
                        var imageResponse = await axios.get(`https://api.themoviedb.org/3/movie/${likeList[i].contentid}/images`, {
                                headers : {
                                    "accept" : "application/json",
                                    "Authorization" : `Bearer ${process.env.TMDB_KEY}`
                                }
                            }
                        )

                        likePackage.push({
                            contentid: likeList[i].contentid,
                            type: likeList[i].type,
                            poster: `https://image.tmdb.org/t/p/w500${imageResponse.data.posters[0].file_path}`,
                        })
                    } catch(error){
                        console.log(error)
                    }
                }
            }


        } catch(error){
            console.log(error)
        }

        try{
            const dislikeLookup = await db.query("SELECT userId, contentname, contentid, type FROM likes WHERE liked=$1 AND userId = $2",
                ['dislike', userId]);
            let dislikeList = dislikeLookup.rows;

            for(var i=0; i < dislikeList.length; i++){
                if(dislikeList[i].type === 'Show'){

                    try{
                        var imageResponse = await axios.get(`https://api.themoviedb.org/3/tv/${dislikeList[i].contentid}/images`, {
                                headers : {
                                    "accept" : "application/json",
                                    "Authorization" : `Bearer ${process.env.TMDB_KEY}`
                                }
                            }
                        )

                        dislikePackagelikePackage.push({
                            contentid: dislikeList[i].contentid,
                            type: dislikeList[i].type,
                            poster: `https://image.tmdb.org/t/p/w500${imageResponse.data.posters[0].file_path}`,
                        })
                    } catch(error){
                        console.log(error)
                    }
                    
                } else if(dislikeList[i].type === 'Movie') {
                    try{
                        var imageResponse = await axios.get(`https://api.themoviedb.org/3/movie/${dislikeList[i].contentid}/images`, {
                                headers : {
                                    "accept" : "application/json",
                                    "Authorization" : `Bearer ${process.env.TMDB_KEY}`
                                }
                            }
                        )

                        dislikePackage.push({
                            contentid: dislikeList[i].contentid,
                            type: dislikeList[i].type,
                            poster: `https://image.tmdb.org/t/p/w500${imageResponse.data.posters[0].file_path}`,
                        })
                    } catch(error){
                        console.log(error)
                    }
                }
            }


        } catch(error){
            console.log(error)
        }


        console.log("in final:", watchlistPackage)
        console.log("in final", likePackage)
        console.log("in final", dislikePackage)
        res.status(200).render("profile.ejs", {auth: isUserAutheneticated, email : email, pfp: pfp, name: name, watchlist: watchlistPackage, like: likePackage, dislike: dislikePackage})
    } else{
        res.redirect("/")
    }
 
})

app.get("/signup", async(req, res) => {
    let isUserAutheneticated = false;

    if(req.isAuthenticated()){
        isUserAutheneticated = true;
        res.redirect("/")
    } else{
        res.status(200).render("signup.ejs")
    }
})

app.get("/login", async(req, res) => {
    let isUserAutheneticated = false;

    if(req.isAuthenticated()){
        isUserAutheneticated = true;
        res.redirect("/")
    } else{
        res.render("login.ejs", {error: req.session.messages});
    }
    
})

app.get("/testResult", async (req, res) => {
    res.render("results.ejs")
})

app.get("/logout", (req, res) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });

app.get("/watchlist", async (req, res) => {
    let isAuthenticated = false;
    if(req.isAuthenticated()){
        const userId = req.user.userid
        try {
            const watchlistLookup = await db.query("SELECT * FROM watchlist WHERE userId = $1", [userId])
            res.send(watchlistLookup.rows);
        } catch(error){
            console.log(error)
        }
    } else{
        res.json({Credentials: "Missing Credentials"})
    }
        
});

app.get("/likes", async (req, res) =>{
    let isAuthenticated = false;
    if(req.isAuthenticated()){
        const userId = req.user.userid
        try {
            const likesLookup = await db.query("SELECT * FROM likes WHERE userId = $1 AND liked=$2", [userId, 'like'])
            res.send(likesLookup.rows);
        } catch(error){
            console.log(error)
        }
    } else{
        res.json({Credentials: "Missing Credentials"})
    }
})

app.get("/dislikes", async (req, res) =>{
    let isAuthenticated = false;
    if(req.isAuthenticated()){
        const userId = req.user.userid
        try {
            const dislikesLookup = await db.query("SELECT * FROM likes WHERE userId = $1 AND liked=$2", [userId, 'dislike'])
            res.send(dislikesLookup.rows);
        } catch(error){
            console.log(error)
        }
    } else{
        res.json({Credentials: "Missing Credentials"})
    }
})

app.post("/add/likes", async (req, res)=> {
    const type = req.body.type;
    const name = req.body.name;
    const id = req.body.id;
    let isAuthenticated = false;

    if(req.isAuthenticated()){
        try{
            const userId = req.user.userid;
            console.log(userId, type, name, id)
            const likeListInsert = await db.query("INSERT INTO likes (userId, contentname, contentid, type, liked) VALUES ($1, $2, $3, $4, $5)", 
                [userId, name, id, type, 'like']
            )
            res.status(200).send("Content Inserted")

        } catch(error) {
            console.log(error)
        }
    } else{
        res.json({Credentials : "Missing Credentials"})
    }

})

app.post("/delete/likes", async (req, res) => {
    const type = req.body.type;
    const id = req.body.id;
    let isAuthenticated = false;
    
    if(req.isAuthenticated()){
        try{
            const userId = req.user.userid;
            const likeDelete = await db.query("DELETE FROM likes WHERE userId = $1 AND contentid = $2 AND type= $3",
                [userId, id, type])
            res.status(200).send("Content Deleted")
        } catch(error){
            console.log(error)
        }    
        
    } else{
        res.json({Credentials: "Missing Credentials"})
    }
})

app.post("/add/dislikes", async (req, res)=> {
    const type = req.body.type;
    const name = req.body.name;
    const id = req.body.id;
    let isAuthenticated = false;

    if(req.isAuthenticated()){
        try{
            const userId = req.user.userid;
            console.log(userId, type, name, id)
            const dislikeInsert = await db.query("INSERT INTO likes (userId, contentname, contentid, type, liked) VALUES ($1, $2, $3, $4, $5)", 
                [userId, name, id, type, 'dislike']
            )
            res.status(200).send("Content Inserted")

        } catch(error) {
            console.log(error)
        }
    } else{
        res.json({Credentials : "Missing Credentials"})
    }

})

app.post("/delete/dislikes", async (req, res) => {
    const type = req.body.type;
    const id = req.body.id;
    let isAuthenticated = false;
    
    if(req.isAuthenticated()){
        try{
            const userId = req.user.userid;
            const dislikeDelete = await db.query("DELETE FROM likes WHERE userId = $1 AND contentid = $2 AND type= $3",
                [userId, id, type])
            res.status(200).send("Content Deleted")
        } catch(error){
            console.log(error)
        }    
        
    } else{
        res.json({Credentials: "Missing Credentials"})
    }
})

app.post("/add/watchlist", async (req,res) =>{
    const type = req.body.type;
    const name = req.body.name;
    const id = req.body.id;
    let isAuthenticated = false;

    if(req.isAuthenticated()){
        try{
            const userId = req.user.userid;
            const watchlistInsert = await db.query("INSERT INTO watchlist (userId, contentname, contentid, type) VALUES ($1, $2, $3, $4)",
                [userId, name, id, type])
            res.status(200).send("Content Inserted")
        } catch(error){
            console.log(error)
        }
        
        
    } else{
        res.json({Credentials: "Missing Credentials"})
    }
});

app.post("/delete/watchlist", async (req,res) =>{
    const type = req.body.type;
    const id = req.body.id;
    let isAuthenticated = false;

    if(req.isAuthenticated()){
        try{
            const userId = req.user.userid;
            console.log(userId);
            console.log(type);
            console.log(id);
            const watchlistInsert = await db.query("DELETE FROM watchlist WHERE userId = $1 AND contentid = $2 AND type= $3",
                [userId, id, type])
            res.status(200).send("Content Deleted")
        } catch(error){
            console.log(error)
        }
        
        
    } else{
        res.json({Credentials: "Missing Credentials"})
    }
});

    

app.post("/register", async(req, res) => {
    const email = req.body.email;
    const password = req.body.pwd;
    const name = req.body.name;

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
                        const result = await db.query("INSERT INTO users (displayname, email, password) VALUES ($1, $2, $3) RETURNING *", 
                            [name, email, hash]
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


app.get("/show/:id", async (req,res) => {
    let id = req.params.id
    let detailPagePackage;
    let isAuthenticated = false;

    if(req.isAuthenticated()){
        const email = req.user.email;
        var pfp = null;
        isAuthenticated = true;
        try {
            const pfpRead = await db.query("SELECT pfpfilename FROM users WHERE email = $1", [email])
            if(pfpRead.rows[0].pfpfilename === null){
                pfp = "assets/pfp.png";
            } else{
                //console.log(pfpRead.rows[0].pfp)
                pfp = `/image/${pfpRead.rows[0].pfpfilename}`;
            }
        } catch(error){
            console.log(error)
        }
    } 

    try{

        var detailResponse = await axios.get(`https://api.themoviedb.org/3/tv/${id}?language=en-US`, {
                    headers : {
                        "accept" : "application/json",
                        "Authorization" : `Bearer ${process.env.TMDB_KEY}`
                    }
                }
            )

            try {

                var providerResponse = await axios.get(`https://api.themoviedb.org/3/tv/${id}/watch/providers`, {
                    headers : {
                        "accept" : "application/json",
                        "Authorization" : `Bearer ${process.env.TMDB_KEY}`
                    }
                })

                
                try {

                    var imageResponse = await axios.get(`https://api.themoviedb.org/3/tv/${id}/images`, {
                            headers : {
                                "accept" : "application/json",
                                "Authorization" : `Bearer ${process.env.TMDB_KEY}`
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
    res.status(200).render("show-detail.ejs", {auth: isAuthenticated, pfp: pfp, detailPage : detailPagePackage})
})

app.get("/movie/:id", async (req,res) => {
    let id = req.params.id
    let detailPagePackage;
    let isAuthenticated = false;

    if(req.isAuthenticated()){
        const email = req.user.email;
        var pfp = null;
        isAuthenticated = true;
        try {
            const pfpRead = await db.query("SELECT pfpfilename FROM users WHERE email = $1", [email])
            if(pfpRead.rows[0].pfpfilename === null){
                pfp = "assets/pfp.png";
            } else{
                //console.log(pfpRead.rows[0].pfp)
                pfp = `/image/${pfpRead.rows[0].pfpfilename}`;
            }
        } catch(error){
            console.log(error)
        }
    } 

    try{

        var detailResponse = await axios.get(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, {
                    headers : {
                        "accept" : "application/json",
                        "Authorization" : `Bearer ${process.env.TMDB_KEY}`
                    }
                }
            )

            try {

                var providerResponse = await axios.get(`https://api.themoviedb.org/3/movie/${id}/watch/providers`, {
                    headers : {
                        "accept" : "application/json",
                        "Authorization" : `Bearer ${process.env.TMDB_KEY}`
                    }
                })

                
                try {

                    var imageResponse = await axios.get(`https://api.themoviedb.org/3/movie/${id}/images`, {
                            headers : {
                                "accept" : "application/json",
                                "Authorization" : `Bearer ${process.env.TMDB_KEY}`
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
    res.status(200).render("movie-detail.ejs", {auth: isAuthenticated, pfp: pfp, detailPage : detailPagePackage})
});



app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureMessage: "Invalid Credentials"
    })
    /* "/login",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureMessage: "Invalid Credentials"
    })
    */

    

)


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
                "trakt-api-key" : process.env.TRACK_CLIENT_ID
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
                "trakt-api-key" : process.env.TRACK_CLIENT_ID
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
                                "Authorization" : `Bearer ${process.env.TMDB_KEY}`
                            }
                        }
                    )
                    
                    try {
    
                        var imageResponse = await axios.get(`https://api.themoviedb.org/3/movie/${movieResult[i].movie.ids.tmdb}/images`, {
                                headers : {
                                    "accept" : "application/json",
                                    "Authorization" : `Bearer ${process.env.TMDB_KEY}`
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
                                "Authorization" : `Bearer ${process.env.TMDB_KEY}`
                            }
                        }
                    )

                    try {

                        var imageResponse = await axios.get(`https://api.themoviedb.org/3/tv/${showResult[i].show.ids.tmdb}/images`, {
                                headers : {
                                    "accept" : "application/json",
                                    "Authorization" : `Bearer ${process.env.TMDB_KEY}`
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

app.post("/changepfp", upload.single('newPfp'), async (req, res, next) => {
    console.log(req.file)
    const pfpFilename = req.file.filename;
    const pfpMimetype = req.file.mimetype;
    const pfpfilepath = req.file.path;
    //console.log(pfp)
    //console.log("filename:", pfp.filename)

    try{
        const pfpInsert = await db.query("UPDATE users SET (pfpfilename, pfpmimetype, pfpfilepath) = ($1, $2, $3) WHERE email = $4", 
            [pfpFilename, pfpMimetype, pfpfilepath, req.user.email]);
        res.redirect("/profile")
    } catch (error){
        console.log(error)
    }
})

app.get("/image/:filename", async (req, res) => {
    const filename = req.params.filename;

    
    try{
        const fileSearch = await db.query("SELECT * FROM users WHERE pfpfilename = $1", [filename]);

        if(fileSearch.rows.length > 0){
            const dirname = path.resolve();
            const fullfilepath = path.join(dirname, fileSearch.rows[0].pfpfilepath)
            console.log(fullfilepath)
            res.type(fileSearch.rows[0].pfpmimetype).sendFile(fullfilepath);
        } else{
            res.send("not found")
        }

    } catch(error){
        console.log(error)
    }
    
    
})

/*
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
*/

passport.use(
    "local",
    new Strategy({
        usernameField: "email",
        passwordField: "pwd"
    }, async function verify(username, password, cb) {
        try{
            const checkEmails = await db.query("SELECT * FROM users WHERE email = $1", [username]);
            if (checkEmails.rows.length > 0){
                const user = checkEmails.rows[0];
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
                });
            } else {
                return cb(null, false);
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
    console.log(`Server running on ${port}`);
});