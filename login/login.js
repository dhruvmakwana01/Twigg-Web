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
       LOGIN DATA
    ===================================================== */

    let data = [
        {
            username: "admin@twigg.in",
            password: "twigg123"
        }
    ];


    /* =====================================================
       GET USER INPUT
    ===================================================== */

    let x = document.getElementById("email").value;
    let y = document.getElementById("password").value;


    /* =====================================================
       CHECK LOGIN
    ===================================================== */

    let result = data.find(function validateuser(userdetails) {

        return userdetails.username === x &&
               userdetails.password === y;

    });


    /* =====================================================
       LOGIN RESULT
    ===================================================== */

    if (result) {

        // Correct login
        window.location.href =
            "/Users/dhruvmakwana/Dev/Twigg Website/home/home.html";

    } else {

        // Incorrect login
        alert("Incorrect email or password");

        // Change button back
        signInButton.querySelector("span").textContent = "Sign In";

    }

});