var pwd = document.querySelector("#pwdBar");
var reveal = document.querySelector("#pwdReveal")
var revealText = document.querySelector("#pwdRevealText")
var revealImg = document.querySelector("#pwdRevealImg")

function revealPass() {
    if(pwd.type === "password"){
        pwd.type = "text";
        revealText.innerHTML = "Hide Password";
        revealImg.setAttribute("src", "/assets/view.png");
    } else {
        pwd.type = "password"
        revealText.innerHTML = "Show Password";
        revealImg.setAttribute("src", "/assets/hide.png");
    }
}

reveal.addEventListener("click", revealPass);

