const imageInput = document.getElementById("imageUpload")
const pfp = document.getElementById("userPfp")

imageInput.addEventListener('change', (event) => {
    const files = event.target.files;

    if(files.length > 0){

        const file = files[0]

        const reader = new FileReader();

        reader.onload = (element) => {
            console.log("file data:", element.target.result);
            pfp.style.backgroundImage = `url('${element.target.result}')`

        }

        reader.readAsDataURL(file)
    }
});