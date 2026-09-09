/* =========================================================
   ELEMENTS
========================================================= */

const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const showPasswordButton = document.getElementById("showPassword");
const showConfirmPasswordButton = document.getElementById("showConfirmPassword");

const signupForm = document.getElementById("signupForm");
const signupButton = document.querySelector(".signup-button");


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
   SHOW / HIDE CONFIRM PASSWORD
========================================================= */

showConfirmPasswordButton.addEventListener("click", () => {

    const isPassword = confirmPasswordInput.type === "password";

    confirmPasswordInput.type = isPassword ? "text" : "password";

    showConfirmPasswordButton.textContent = isPassword ? "Hide" : "Show";

    showConfirmPasswordButton.setAttribute(
        "aria-label",
        isPassword ? "Hide password" : "Show password"
    );

});


/* =========================================================
   SIGN UP
========================================================= */

signupForm.addEventListener("submit", (event) => {

    event.preventDefault();

    if (passwordInput.value !== confirmPasswordInput.value) {

        alert("Passwords do not match.");

        confirmPasswordInput.focus();

        return;
    }

    signupButton.querySelector("span").textContent = "Creating account...";

});

/* =========================================================
   REGISTER DATA AND PUSH TO LOCAL STORAGE
========================================================= */

function signup() {

    let username = document.getElementById("username").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    const user = {  //row created
        user_username: username,
        user_email: email,
        user_password: password
    };

    const users = JSON.parse(localStorage.getItem("registerusers")) || []; //fetch strings from local storage and parse it
    users.push(user); //push row to array
    localStorage.setItem("registerusers", JSON.stringify(users)); //stringify data and send to local storage
    alert("Welcome to Twigg! Your account is ready!")

}