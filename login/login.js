/* =========================================================
   ELEMENTS
========================================================= */

const passwordInput = document.getElementById("password");
const showPasswordButton = document.getElementById("showPassword");
const loginForm = document.getElementById("loginForm");
const signInButton = document.querySelector(".signin-button");


/* =========================================================
   SHOW / HIDE PASSWORD
========================================================= */

showPasswordButton.addEventListener("click", () => {

    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";

    showPasswordButton.textContent = isPassword ? "Hide" : "Show";

    showPasswordButton.setAttribute(
        "aria-label",
        isPassword ? "Hide password" : "Show password"
    );

});


/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener("submit", (event) => {

    event.preventDefault();

    // Change button text
    signInButton.querySelector("span").textContent = "Signing in...";


    /* =====================================================
       GET USER INPUT
    ===================================================== */

    let x = document.getElementById("usernameOrEmail").value;
    let y = document.getElementById("password").value;


    /* =====================================================
       GET REGISTERED USERS FROM LOCAL STORAGE
    ===================================================== */

    let data = JSON.parse(localStorage.getItem("registerusers")) || [];
    //console.log(data);
    //console.log(Object.keys(data));
    //let k = Object.keys(data);
    //console.log(k);
    // for (let x = 1; x <= 10; x++) {
    //     console.log("hello");
    // }

    /* =====================================================
       CHECK LOGIN
    ===================================================== */

    let result = data.find(function validateuser(userdetails) {

        return (
            (userdetails.user_username === x ||
                userdetails.user_email === x) &&
            userdetails.user_password === y
        );

    });


    /* =====================================================
       LOGIN RESULT
    ===================================================== */

    if (result) {

        window.location.href =
            "/Users/dhruvmakwana/Dev/Twigg Website/home/home.html";

    } else {

        alert("Incorrect username/email or password");

        signInButton.querySelector("span").textContent = "Sign In";

    }

});