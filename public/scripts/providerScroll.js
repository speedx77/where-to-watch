var dupeSelectedTitle = -1;
var headerProviders = ["Netflix", "Max", "Prime Video", "Hulu", "Disney+", "Peacock", "AMC+", "Pluto TV", "Apple TV", "YouTube TV", "Sling TV", "Fubo", "Big Daddy TV", "Philo"]

//put these in the database
//form database table from trending show/movie titles?

function beginHeaderTitleAnimation() {
    let selectedTitle = 0;
    let headerShift = document.querySelector("#headerTitleProvider");
    headerShift.classList.add("headerShift");

    setTimeout(()=> {
        selectedTitle = Math.floor(Math.random() * headerProviders.length)
        let finalTitle = preventDupeTitle(selectedTitle)
        //console.log(selectedTitle);
        headerShift.innerHTML = `${headerProviders[finalTitle]} <span style="color: black; white-space: pre;">?</span>`
        dupeSelectedTitle = finalTitle;
    }, 2500);
    
}

function preventDupeTitle(title){
    let isDupe = true;
    do {
        //console.log(title)
        //console.log(dupeSelectedTitle)
        if(title === dupeSelectedTitle){
            title = Math.floor(Math.random() * headerProviders.length)
        } else{
            isDupe = false;
            return title;
        }
    } while(isDupe = true)
}

setInterval(beginHeaderTitleAnimation, 5000)


