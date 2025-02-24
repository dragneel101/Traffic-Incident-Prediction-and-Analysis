# 🚦 Traffic Collision Risk Predictor

The **Traffic Collision Risk Predictor** is a **web-based application** that predicts **collision risk scores** between two locations in **Ontario, Canada**. It uses **Flask** for the backend, **Mapbox API** for geolocation, and a **Machine Learning model** to assess risk based on historical data.

## 🌟 Features
✅ **Ontario-only address auto-suggestions**  
✅ **Interactive Mapbox visualization** with route display  
✅ **Color-coded risk markers** (🟢 Low, 🟠 Medium, 🔴 High)  
✅ **Machine Learning risk assessment** using historical collision data  
✅ **Flask API for predictions**  

---

## 📂 Project Structure
```
Traffic_Predictor/
│── backend/
│   ├── app.py                    # Flask API for predictions
│   ├── train_model.py             # Script to train and save the ML model
│   ├── requirements.txt           # Required dependencies
│   ├── static/                    # Frontend assets
│   │   ├── index.html              # Main UI
│   │   ├── script.js               # Handles API calls & Mapbox visualization
│   │   ├── styles.css              # UI styling
│── Data/
│   ├── model.pkl                  # Saved Machine Learning model
│   ├── Traffic_Collisions_Open_Data.geojson  # Collision dataset
│── README.md                      # Project documentation
```

---

## 🚀 **Installation & Setup**
### **🔹 1. Clone the Repository**
```sh
git clone https://github.com/YOUR_USERNAME/Traffic_Predictor.git
cd Traffic_Predictor
```

### **🔹 2. Install Dependencies**
Navigate to the backend folder:
```sh
cd backend
pip install -r requirements.txt
```

### **🔹 3. Train the Model**
```sh
python train_model.py
```
🔹 This **loads the dataset, trains a Nearest Neighbors model, and saves it as `model.pkl`**.

### **🔹 4. Start the Flask API**
```sh
python app.py
```
🔹 The Flask server should start at **`http://localhost:5000`**.

### **🔹 5. Open the Frontend**
- Open **`backend/static/index.html`** in your browser  
- OR run a local HTTP server:
```sh
cd backend/static
python -m http.server 8000
```
- Open **`http://localhost:8000`** in your browser.

---

## 🎯 **Usage**
1️⃣ **Enter a start & end address (Ontario-only auto-suggestions).**  
2️⃣ **Click "Predict Collision Risk".**  
3️⃣ **The risk score appears, and the map updates with the route.**  

🟢 **Green Marker = Low Risk**  
🟠 **Orange Marker = Medium Risk**  
🔴 **Red Marker = High Risk**  

---

## 🔗 **API Endpoints**
| Endpoint          | Method | Description |
|------------------|--------|-------------|
| `/predict`       | `POST` | Predicts collision risk for given addresses |
| `/`              | `GET`  | Serves the frontend (`index.html`) |

### **📌 Example Request (POST)**
```json
{
    "start_address": "42 Kimberley Crescent, Brampton, Ontario",
    "end_address": "20 Ashurst Crescent, Brampton, Ontario"
}
```

### **📌 Example Response**
```json
{
    "collision_risk": 2.56
}
```

---

## 📌 **Environment Variables**
To **keep API keys secure**, store them in an `.env` file (for Flask):
```
MAPBOX_ACCESS_TOKEN=pk.YOUR_PUBLIC_KEY
```

Load it in `app.py`:
```python
from dotenv import load_dotenv
import os
load_dotenv()
MAPBOX_API_KEY = os.getenv("MAPBOX_ACCESS_TOKEN")
```

---

## 👩‍💻 **Contributing**
🔹 **Fork the repository**  
🔹 **Create a new branch** (`git checkout -b feature-name`)  
🔹 **Commit your changes** (`git commit -m "Added new feature"`)  
🔹 **Push to GitHub** (`git push origin feature-name`)  
🔹 **Create a Pull Request** 🚀  

---

## 📜 **License**
This project is licensed under the **MIT License**.

---

## 📞 **Contact**
For questions or feedback, reach out via:  
📧 **Email:** your.email@example.com  
📌 **GitHub:** [YourUsername](https://github.com/YOUR_USERNAME)

---

### 🚀 **Happy Coding!** 🎉
