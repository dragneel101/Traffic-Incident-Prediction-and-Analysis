document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("prediction-form");
    const resultDiv = document.getElementById("result");
    const startInput = document.getElementById("start_address");
    const endInput = document.getElementById("end_address");
    const startSuggestions = document.getElementById("start_suggestions");
    const endSuggestions = document.getElementById("end_suggestions");

    const API_URL = "http://localhost:5000/predict"; // Ensure this matches your Flask API URL
    const MAPBOX_ACCESS_TOKEN = "sk.eyJ1Ijoia2hhaXR1ciIsImEiOiJjbTdlZGc1ZHEwY3RoMmtvZWVteTd3N2FoIn0.YKCU9Yip1CMYgyI4kH-4-Q";
    
    // Bounding box for Ontario, Canada (Min Longitude, Min Latitude, Max Longitude, Max Latitude)
    const ONTARIO_BBOX = "-95.1562,41.6766,-74.3439,56.85";

    // Function to handle autocomplete
    function setupAutocomplete(inputElement, suggestionsElement) {
        let debounceTimeout;

        inputElement.addEventListener("input", function () {
            const query = inputElement.value.trim();
            
            // Hide the suggestion box if input is empty
            if (query.length < 3) {
                suggestionsElement.style.display = "none";
                return;
            }

            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(async () => {
                try {
                    const response = await fetch(
                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
                        `access_token=${MAPBOX_ACCESS_TOKEN}&limit=5&country=CA&bbox=${ONTARIO_BBOX}`
                    );

                    if (!response.ok) {
                        throw new Error("Failed to fetch suggestions.");
                    }

                    const data = await response.json();
                    suggestionsElement.innerHTML = "";

                    if (!data.features.length) {
                        suggestionsElement.innerHTML = "<div class='autocomplete-suggestion'>No results found</div>";
                        suggestionsElement.style.display = "block";
                        return;
                    }

                    // Populate suggestions
                    data.features.forEach((feature) => {
                        if (feature.context && feature.context.some(ctx => ctx.text.includes("Ontario"))) {
                            const div = document.createElement("div");
                            div.classList.add("autocomplete-suggestion");
                            div.textContent = feature.place_name;
                            div.addEventListener("click", function () {
                                inputElement.value = feature.place_name;
                                suggestionsElement.style.display = "none"; // Hide dropdown after selection
                            });
                            suggestionsElement.appendChild(div);
                        }
                    });

                    // Show no results if Ontario addresses are missing
                    if (!suggestionsElement.innerHTML.trim()) {
                        suggestionsElement.innerHTML = "<div class='autocomplete-suggestion'>No Ontario addresses found</div>";
                    }

                    suggestionsElement.style.display = "block"; // Show dropdown

                } catch (error) {
                    console.error("[ERROR] Autocomplete failed:", error);
                    suggestionsElement.innerHTML = "<div class='autocomplete-suggestion'>Error fetching data</div>";
                    suggestionsElement.style.display = "block";
                }
            }, 300); // Debounce time: 300ms
        });

        // Hide suggestions when clicking outside
        document.addEventListener("click", function (event) {
            if (!inputElement.contains(event.target) && !suggestionsElement.contains(event.target)) {
                suggestionsElement.style.display = "none";
            }
        });
    }

    // Initialize autocomplete for both address fields
    setupAutocomplete(startInput, startSuggestions);
    setupAutocomplete(endInput, endSuggestions);
});
