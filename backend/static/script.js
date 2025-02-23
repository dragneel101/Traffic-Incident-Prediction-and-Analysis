document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("prediction-form");
    const resultDiv = document.getElementById("result");
    const startInput = document.getElementById("start_address");
    const endInput = document.getElementById("end_address");
    const startSuggestions = document.getElementById("start_suggestions");
    const endSuggestions = document.getElementById("end_suggestions");

    const API_URL = "http://localhost:5000/predict"; // Ensure this matches your Flask API URL
    const MAPBOX_ACCESS_TOKEN = "sk.eyJ1Ijoia2hhaXR1ciIsImEiOiJjbTdlZGc1ZHEwY3RoMmtvZWVteTd3N2FoIn0.YKCU9Yip1CMYgyI4kH-4-Q";

    // 🟢 Function to display loading state
    function showLoading(message = "Processing request...") {
        resultDiv.innerHTML = `<span class="loading">${message}</span>`;
    }

    // 🟢 Function to handle form submission
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const startAddress = startInput.value.trim();
        const endAddress = endInput.value.trim();

        if (!startAddress || !endAddress) {
            resultDiv.innerText = "⚠️ Please enter both start and end addresses.";
            return;
        }

        const requestData = { start_address: startAddress, end_address: endAddress };

        try {
            console.log("[INFO] Sending request to server:", requestData);
            showLoading();

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const result = await response.json();
            console.log("[INFO] Received response:", result);

            if (result.error) {
                resultDiv.innerHTML = `<span class="error">⚠️ ${result.error}</span>`;
            } else {
                resultDiv.innerHTML = `<strong>🚦 Collision Risk Score:</strong> ${result.collision_risk.toFixed(2)}`;
            }
        } catch (error) {
            console.error("[ERROR] Request failed:", error);
            resultDiv.innerHTML = `<span class="error">⚠️ Error processing request. Please try again later.</span>`;
        }
    });

    // 🟢 Function for setting up autocomplete (Debounced to limit API calls)
    function setupAutocomplete(inputElement, suggestionsElement) {
        let debounceTimeout;

        inputElement.addEventListener("input", function () {
            const query = inputElement.value.trim();

            if (query.length < 3) {
                suggestionsElement.innerHTML = "";
                return;
            }

            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(async () => {
                try {
                    const response = await fetch(
                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=5&country=CA`
                    );

                    if (!response.ok) {
                        throw new Error("Failed to fetch suggestions.");
                    }

                    const data = await response.json();
                    suggestionsElement.innerHTML = "";

                    data.features.forEach((feature) => {
                        const div = document.createElement("div");
                        div.classList.add("autocomplete-suggestion");
                        div.textContent = feature.place_name;
                        div.addEventListener("click", function () {
                            inputElement.value = feature.place_name;
                            suggestionsElement.innerHTML = "";
                        });
                        suggestionsElement.appendChild(div);
                    });
                } catch (error) {
                    console.error("[ERROR] Autocomplete failed:", error);
                }
            }, 300); // Debounce time: 300ms
        });

        // Hide suggestions when clicking outside
        document.addEventListener("click", function (event) {
            if (!inputElement.contains(event.target) && !suggestionsElement.contains(event.target)) {
                suggestionsElement.innerHTML = "";
            }
        });
    }

    // 🟢 Initialize autocomplete for both address fields
    setupAutocomplete(startInput, startSuggestions);
    setupAutocomplete(endInput, endSuggestions);
});
