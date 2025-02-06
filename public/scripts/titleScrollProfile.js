var headerTitles = ["Better Call Saul", "Neon Genesis Evangelion", "Mad Men", "Succession", "Inception", "Dexter", "The Boys", "Man of Steel", "your mom lol"];
var dupeSelectedTitle = -1;

//put these in the database
//form database table from trending show/movie titles?

function beginHeaderTitleAnimation() {
    let selectedTitle = 0;
    let headerShift = document.querySelector("#headerTitle");
    headerShift.classList.add("headerShift");

    setTimeout(()=> {
        selectedTitle = Math.floor(Math.random() * headerTitles.length)
        let finalTitle = preventDupeTitle(selectedTitle)
        //console.log(selectedTitle);
        headerShift.innerHTML = `${headerTitles[finalTitle]}`
        dupeSelectedTitle = finalTitle;
    }, 2500);
    
}

function preventDupeTitle(title){
    let isDupe = true;
    do {
        //console.log(title)
        //console.log(dupeSelectedTitle)
        if(title === dupeSelectedTitle){
            title = Math.floor(Math.random() * headerTitles.length)
        } else{
            isDupe = false;
            return title;
        }
    } while(isDupe = true)
}

setInterval(beginHeaderTitleAnimation, 5000)


