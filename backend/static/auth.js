document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        fetch(`${window.location.origin}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                sessionStorage.setItem("authToken", data.token); // Store auth token
                window.location.href = "index.html"; // Redirect to prediction page
            } else {
                errorMessage.textContent = "Invalid credentials. Please try again.";
            }
        })
        .catch(error => {
            console.error("Login error:", error);
            errorMessage.textContent = "Server error. Try again later.";
        });
    });
});
