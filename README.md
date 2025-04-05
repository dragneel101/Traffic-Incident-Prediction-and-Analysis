# Traffic Incident Prediction and Analysis

A comprehensive solution for predicting and analyzing traffic incidents using external APIs, machine learning, and FastAPI. This application fetches real-time or historical weather data, retrieves route/geospatial details, processes that information through a trained model, and exposes predictions and analytics through a REST API.

---

## Table of Contents

1. [Overview](#overview)  
2. [Features](#features)  
3. [Architecture](#architecture)  
4. [Installation](#installation)  
5. [Environment Variables](#environment-variables)  
6. [Usage](#usage)  
7. [API Endpoints](#api-endpoints)  
8. [Data Flow](#data-flow)  
9. [Model Training and Updating](#model-training-and-updating)  
10. [Project Structure](#project-structure)  
11. [Contributing](#contributing)  
12. [License](#license)  

---

## 1. Overview

This repository hosts a FastAPI-based service that forecasts or analyzes traffic incidents. By combining weather conditions, location-based routing data, and historical traffic patterns, the application aims to give real-time or near real-time predictions for potential accidents, congestion, or other noteworthy incidents.

Example uses:

- City or state authorities wanting to predict high-risk areas for traffic accidents based on weather  
- Navigation providers looking to warn drivers of potential delays or hazards  
- Researchers studying correlations between environmental conditions and traffic incident patterns  

---

## 2. Features

- **Weather Data Integration**  
  Retrieves real-time and/or historical weather data via [OpenWeatherMap](https://openweathermap.org/api) and [Meteostat](https://dev.meteostat.net/).  
  - Temperature, precipitation, wind speed, etc., are used as inputs to the traffic incident model

- **Routing and Geospatial Data**  
  Uses [OpenRouteService](https://openrouteservice.org/) (ORS) to obtain route details, distances, or geocoding data, which may inform location-based incident forecasting

- **Predictive Modeling**  
  A scikit-learn model (stored in `./data/model.pkl` by default) generates a probability or classification of potential traffic incidents. You can update or retrain this model as new data becomes available

- **FastAPI Microservice**  
  A modern REST API with documented endpoints (via OpenAPI/Swagger UI) that accepts requests (e.g., weather or route queries) and returns predictions or other analytics

- **Extensible**  
  You can seamlessly integrate additional data sources or swap out the machine learning model for more advanced solutions (XGBoost, PyTorch, etc.) as your needs evolve

---

## 3. Architecture

A high-level illustration of the system’s components:

          +----------------------+
          |  External User/App  |
          +---------+-----------+
                    |
                    |  HTTP Request
                    |
           +--------v--------+
           |    FastAPI      |
           |  (main Service) |
           +--------+--------+
                    |
                    |  calls
                    |
     +--------------v---------------+
     |    Weather Providers (API)   |
     |  (OpenWeather, Meteostat)    |
     +--------------+---------------+
                    |
                    |  calls
                    |
   +----------------v----------------+
   |   OpenRouteService (API)       |
   |  (routing & geospatial data)   |
   +----------------+---------------+
                    |
                    |
                    v
        +----------------------+
        |  Machine Learning    |
        |   Model (scikit)    |
        +----------------------+



1. **FastAPI** handles incoming requests (for predictions or analytics).  
2. **External APIs** (OpenWeatherMap, Meteostat, ORS) supply data.  
3. **ML Model** uses combined data (weather, routes, historical incidents) to produce predictions, which are then returned as JSON responses.

---

## 4. Installation

### Prerequisites

- Python 3.7+  
- (Optional) A virtual environment tool such as `venv` or `conda`

### Steps

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/dragneel101/Traffic-Incident-Prediction-and-Analysis.git
   cd Traffic-Incident-Prediction-and-Analysis

2. **Install Dependencies**
