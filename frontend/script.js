document.getElementById("prediction-form").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const startAddress = document.getElementById("start_address").value.trim();
    const endAddress = document.getElementById("end_address").value.trim();
    
    if (!startAddress || !endAddress) {
        document.getElementById("result").innerText = "Please enter both start and end addresses.";
        return;
    }
    
    const requestData = {
        start_address: startAddress,
        end_address: endAddress
    };
    
    try {
        console.log("[INFO] Sending request to server with addresses:", requestData);
        document.getElementById("result").innerText = "Processing request...";
        
        const response = await fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("[INFO] Received response from server:", result);
        
        if (result.error) {
            document.getElementById("result").innerText = "Error: " + result.error;
        } else {
            document.getElementById("result").innerText = "Collision Risk Score: " + result.collision_risk.toFixed(2);
        }
    } catch (error) {
        console.error("[ERROR] Error fetching prediction:", error);
        document.getElementById("result").innerText = "Error processing request. Please try again later.";
    }
});

// Ensure autocomplete suggestions work properly
document.addEventListener("DOMContentLoaded", function() {
    function setupAutocomplete(inputId, suggestionsId) {
        const input = document.getElementById(inputId);
        const suggestions = document.getElementById(suggestionsId);
        
        input.addEventListener("input", function() {
            if (input.value.length < 3) {
                suggestions.innerHTML = "";
                return;
            }
            
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${input.value}.json?access_token=sk.eyJ1Ijoia2hhaXR1ciIsImEiOiJjbTdlZGc1ZHEwY3RoMmtvZWVteTd3N2FoIn0.YKCU9Yip1CMYgyI4kH-4-Q`)
            .then(response => response.json())
            .then(data => {
                suggestions.innerHTML = "";
                data.features.forEach(feature => {
                    const div = document.createElement("div");
                    div.classList.add("autocomplete-suggestion");
                    div.textContent = feature.place_name;
                    div.addEventListener("click", function() {
                        input.value = feature.place_name;
                        suggestions.innerHTML = "";
                    });
                    suggestions.appendChild(div);
                });
            });
        });
    }
    
    setupAutocomplete("start_address", "start_suggestions");
    setupAutocomplete("end_address", "end_suggestions");
});
