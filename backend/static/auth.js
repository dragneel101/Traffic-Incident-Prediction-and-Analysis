document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");

    const API_URL = window.location.hostname === "localhost"
        ? "http://localhost:5000/login"
        : window.location.hostname.includes("traffic.khaitu.ca")
            ? "https://traffic.khaitu.ca/login"
            : "http://10.0.0.252:5000/login";

    if (!loginForm) {
        console.warn("⚠️ Login form not found!");
        return;
    }

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!username || !password) {
            errorMessage.textContent = "⚠️ Please enter both username and password.";
            return;
        }

        errorMessage.textContent = "⏳ Logging in...";

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (response.status === 401) {
                errorMessage.textContent = "⚠️ Invalid credentials. Please try again.";
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                errorMessage.textContent = `⚠️ ${errorData.error || "Login failed."}`;
                return;
            }

            // ✅ Save token after successful login
            const data = await response.json();
            sessionStorage.setItem("authToken", data.token);
            window.location.href = "index.html";

        } catch (error) {
            errorMessage.textContent = "⚠️ Unable to connect. Please try again later.";
        }
    });
});
