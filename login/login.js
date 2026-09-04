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

    signInButton.querySelector("span").textContent = "Signing in...";
});