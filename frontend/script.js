document.getElementById("prediction-form").addEventListener("submit", function(event) {
    event.preventDefault();

    let data = {
        "OCC_HOUR": parseInt(document.getElementById("occ_hour").value),
        "OCC_DOW": parseInt(document.getElementById("occ_dow").value),
        "OCC_MONTH": parseInt(document.getElementById("occ_month").value),
        "AUTOMOBILE": parseInt(document.getElementById("automobile").value),
        "MOTORCYCLE": parseInt(document.getElementById("motorcycle").value),
        "PASSENGER": parseInt(document.getElementById("passenger").value),
        "BICYCLE": parseInt(document.getElementById("bicycle").value),
        "PEDESTRIAN": parseInt(document.getElementById("pedestrian").value)
    };

    fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        mode: "cors",
        headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        document.getElementById("result").innerText = "Predicted Injury Collisions: " + result.predicted_injury_collisions;
    })
    .catch(error => console.error("Error:", error));
});
