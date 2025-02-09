const watchlistButton = document.querySelector("#watchlist");
const watchlistIcon = document.querySelector("#watchlistStatus");
const id = document.querySelector("#heroTitle").getAttribute("data-content-id");
const type = document.querySelector("#heroTitle").getAttribute("data-content-type");
const name = document.querySelector("#heroTitle").getAttribute("data-content-name");
const watchlistText = document.querySelector("#watchlistText");
const like = document.querySelector("#like");
const dislike = document.querySelector("#dislike");
var watchlist = null;
var likeList = null;
var dislikeList = null;
console.log(id)




async function pullWatchlist(){
    await fetch("/watchlist").then(response=> response.json()).then(data => {watchlist = data});
    console.log(watchlist);
}

async function pullLikes(){
    await fetch("/likes").then(response => response.json()).then(data => {likeList = data});
    console.log(likeList)
}

async function pullDislikes(){
    await fetch("/dislikes").then(response => response.json()).then(data => {dislikeList = data});
    console.log(dislikeList)
}

async function watchlistCheck(){
    let check = watchlist.some((element) => element.hasOwnProperty("contentid") && element.contentid === Number(id));

    if(check){
        watchlistText.innerHTML = "Saved"

        watchlistIcon.style.backgroundImage = "url('/assets/check.png')";

        watchlistButton.addEventListener("mouseover", (event) => {
            watchlistIcon.style.backgroundImage = "url('/assets/delete.png')";
        })
        
        watchlistButton.addEventListener("mouseout", (event) => {
            watchlistIcon.style.backgroundImage = "url(/assets/check.png)";
        })
    } else {
        watchlistText.innerHTML = "Add to Watchlist"

        watchlistButton.addEventListener("mouseout", (event) => {
            watchlistIcon.style.backgroundImage = "url(/assets/add.png)";
        })
    }
}

async function likesCheck(){
    let check = likeList.some((element) => element.hasOwnProperty("contentid") && element.contentid === Number(id))

    if(check){
        like.style.backgroundImage = "url('/assets/like-purple-fill.png')"
    } else{
        like.style.backgroundImage = "url('/assets/like.png')"
    }
}

async function dislikesCheck(){
    let check = dislikeList.some((element) => element.hasOwnProperty("contentid") && element.contentid === Number(id))

    if(check){
        dislike.style.backgroundImage = "url('/assets/dislike-purple-fill.png')"
    } else{
        dislike.style.backgroundImage = "url('/assets/dislike.png')"
    }
}

like.addEventListener("click", async function(event) {
    let check = likeList.some((element) => element.hasOwnProperty("contentid") && element.contentid === Number(id))

    if(dislike.style.backgroundImage = "url('/assets/dislike-purple-fill.png')"){
        await fetch("/delete/dislikes", {
            method: "POST",
            body: new URLSearchParams({
                "type" : type,
                "id" : id
            })
        })

        dislike.style.backgroundImage = "url('/assets/dislike.png')"
        
        await fetch("/add/likes", {
            method: "POST",
            body: new URLSearchParams({
                "type" : type,
                "name" : name,
                "id" : id
            })
        })
    } else {
        if(!check) {
            await fetch("/add/likes", {
                method: "POST",
                body: new URLSearchParams({
                    "type" : type,
                    "name" : name,
                    "id" : id
                })
            })
        } else {
            await fetch("/delete/likes", {
                method: "POST",
                body: new URLSearchParams({
                    "type" : type,
                    "id" : id
                })
            })
        }
    }

    

    await pullLikes();
    await likesCheck();

});

dislike.addEventListener("click", async function(event) {
    let check = dislikeList.some((element) => element.hasOwnProperty("contentid") && element.contentid === Number(id));

    if(!check) {
        await fetch("/add/dislikes", {
            method: "POST",
            body: new URLSearchParams({
                "type" : type,
                "name" : name,
                "id" : id
            })
        })
    } else {
        await fetch("/delete/dislikes", {
            method: "POST",
            body: new URLSearchParams({
                "type" : type,
                "id" : id
            })
        })
    }

    await pullDislikes();
    await dislikesCheck();
})

async function editWatchlist(){
    let check = watchlist.some((element) => element.hasOwnProperty("contentid") && element.contentid === Number(id));

    if(!check){
        await fetch("/add/watchlist", {
            method: "POST",
            body: new URLSearchParams({
                "type" : type,
                "name" : name,
                "id" : id
            })
        });
    } else {
        await fetch("/delete/watchlist", {
            method: "POST",
            body: new URLSearchParams({
                "type" : type,
                "id" : id
            })
        })
    }
    await pullWatchlist();
    await watchlistCheck();
}

async function pageStart(){
    await pullWatchlist();
    await watchlistCheck();
    await pullLikes();
    await pullDislikes();
    await likesCheck();
    await dislikesCheck();
    //await editWatchlist();
}

pageStart();