import React from "react";
import RiskForm from "./components/RiskForm";
import RoutePlanner from "./components/RoutePlanner";

function App() {
  return (
    <div className="min-h-screen p-6">
      <header className="text-2xl font-semibold mb-4 text-indigo-600">
        🚦 Traffic Collision Risk Predictor
      </header>
      <main>
        <RiskForm/>
        <RoutePlanner/>
      </main>
    </div>
  );
}

export default App;
