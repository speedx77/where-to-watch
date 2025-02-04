var pwd = document.querySelector("#pwdBar");
var confirmPwd = document.querySelector("#confirmPwdBar");
var signUp = document.querySelector("#signUpForm");
var alert = document.querySelector("#pwdAlert")
var reveal = document.querySelector("#pwdReveal")
var revealText = document.querySelector("#pwdRevealText")
var revealImg = document.querySelector("#pwdRevealImg")


signUp.addEventListener("submit", function(event) {
    if(pwd.value != confirmPwd.value){
        event.preventDefault();
        alert.style.display = "block";
    } else{
        alert.style.display = "none";
        return true;
    }
})

function revealPass() {
    if(pwd.type === "password"){
        pwd.type = "text";
        confirmPwd.type = "text";
        revealText.innerHTML = "Hide Password";
        revealImg.setAttribute("src", "/assets/view.png");
    } else {
        pwd.type = "password"
        confirmPwd.type = "password"
        revealText.innerHTML = "Show Password";
        revealImg.setAttribute("src", "/assets/hide.png");
    }
}

reveal.addEventListener("click", revealPass);

