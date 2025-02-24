document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("prediction-form");
    const resultDiv = document.getElementById("result");
    const startInput = document.getElementById("start_address");
    const endInput = document.getElementById("end_address");
    const startSuggestions = document.getElementById("start_suggestions");
    const endSuggestions = document.getElementById("end_suggestions");

    const API_URL = window.location.hostname === "localhost"
    ? "http://localhost:5000/predict"  // Local development
    : window.location.hostname.includes("traffic.khaitu.ca")
        ? "https://traffic.khaitu.ca/predict"  // Live deployment using domain
        : "http://10.0.0.252:5000/predict";  // Server IP


    const MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoia2hhaXR1ciIsImEiOiJjbTdlZGN2bTMwY3IyMmpvcWUzejc4ajMzIn0.JpG-_mV4iS_hBDQ61tutVg"; // Replace with your actual public key
    
    // Ontario bounding box
    const ONTARIO_BBOX = "-95.1562,41.6766,-74.3439,56.85";

    // Initialize Mapbox
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-79.3832, 43.6532], // Default to Toronto
        zoom: 10
    });

    let startMarker, endMarker, routeLayer;

    // 🟢 Function to fetch road-following route from Mapbox Directions API
    async function getRoute(startCoords, endCoords) {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.routes.length > 0) {
                return data.routes[0].geometry; // Return the best route
            } else {
                console.error("No route found.");
                return null;
            }
        } catch (error) {
            console.error("Error fetching route:", error);
            return null;
        }
    }

    // 🟢 Function to update map with road-following route
    async function updateMap(startCoords, endCoords, riskScore) {
        if (startMarker) startMarker.remove();
        if (endMarker) endMarker.remove();
        if (map.getLayer('route')) {
            map.removeLayer('route');
            map.removeSource('route');
        }

        const riskColor = riskScore < 2 ? "green" : riskScore < 4 ? "orange" : "red";

        startMarker = new mapboxgl.Marker({ color: riskColor })
            .setLngLat([startCoords[1], startCoords[0]]) // Ensure [longitude, latitude]
            .setPopup(new mapboxgl.Popup().setText("Start Location"))
            .addTo(map);

        endMarker = new mapboxgl.Marker({ color: riskColor })
            .setLngLat([endCoords[1], endCoords[0]]) // Ensure [longitude, latitude]
            .setPopup(new mapboxgl.Popup().setText("End Location"))
            .addTo(map);

        // Fetch road-following route
        const routeGeoJSON = await getRoute(startCoords, endCoords);
        
        if (routeGeoJSON) {
            map.addSource('route', { type: 'geojson', data: routeGeoJSON });

            map.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: { "line-join": "round", "line-cap": "round" },
                paint: { "line-color": riskColor, "line-width": 5, "line-opacity": 0.8 }
            });

            map.fitBounds([startCoords.reverse(), endCoords.reverse()], { padding: 50 });
        }
    }

    // 🟢 Auto-suggestion function (Ontario-only)
    function setupAutocomplete(inputElement, suggestionsElement) {
        let debounceTimeout;

        inputElement.addEventListener("input", function () {
            const query = inputElement.value.trim();

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

                    data.features.forEach((feature) => {
                        if (feature.context && feature.context.some(ctx => ctx.text.includes("Ontario"))) {
                            const div = document.createElement("div");
                            div.classList.add("autocomplete-suggestion");
                            div.textContent = feature.place_name;
                            div.addEventListener("click", function () {
                                inputElement.value = feature.place_name;
                                suggestionsElement.style.display = "none"; 
                            });
                            suggestionsElement.appendChild(div);
                        }
                    });

                    if (!suggestionsElement.innerHTML.trim()) {
                        suggestionsElement.innerHTML = "<div class='autocomplete-suggestion'>No Ontario addresses found</div>";
                    }

                    suggestionsElement.style.display = "block";

                } catch (error) {
                    console.error("[ERROR] Autocomplete failed:", error);
                    suggestionsElement.innerHTML = "<div class='autocomplete-suggestion'>Error fetching data</div>";
                    suggestionsElement.style.display = "block";
                }
            }, 300);
        });

        document.addEventListener("click", function (event) {
            if (!inputElement.contains(event.target) && !suggestionsElement.contains(event.target)) {
                suggestionsElement.style.display = "none";
            }
        });
    }

    // 🟢 Initialize auto-suggestion for both address fields
    setupAutocomplete(startInput, startSuggestions);
    setupAutocomplete(endInput, endSuggestions);

    // 🟢 Handle form submission
    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const startAddress = startInput.value.trim();
        const endAddress = endInput.value.trim();
        if (!startAddress || !endAddress) {
            resultDiv.innerText = "⚠️ Please enter both start and end addresses.";
            return;
        }

        resultDiv.innerHTML = "⏳ Processing request...";

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ start_address: startAddress, end_address: endAddress }),
            });

            if (!response.ok) throw new Error(`Server error: ${response.status}`);

            const result = await response.json();
            if (result.error) {
                resultDiv.innerHTML = `<span class="error">⚠️ ${result.error}</span>`;
                return;
            }

            const riskScore = result.collision_risk.toFixed(2);
            resultDiv.innerHTML = `<strong>🚦 Collision Risk Score:</strong> ${riskScore}`;

            const startCoords = await getCoordinates(startAddress);
            const endCoords = await getCoordinates(endAddress);

            if (startCoords && endCoords) updateMap(startCoords, endCoords, riskScore);
        } catch (error) {
            console.error("[ERROR] Request failed:", error);
            resultDiv.innerHTML = `<span class="error">⚠️ Error processing request. Try again later.</span>`;
        }
    });

    async function getCoordinates(address) {
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1&country=CA`
            );
            const data = await response.json();
            if (data.features.length) {
                let [lon, lat] = data.features[0].center;
                return [lat, lon];
            }
        } catch (error) {
            console.error("[ERROR] Failed to get coordinates:", error);
        }
        return null;
    }
});
