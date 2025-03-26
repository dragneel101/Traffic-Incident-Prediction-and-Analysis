import React from "react";
import RoutePlanner from "./components/RoutePlanner";

function App() {
  return (
    <div className="min-h-screen p-6">
      <header className="text-2xl font-semibold mb-4 text-indigo-600">
        🚦 Route-Based Collision Risk Predictor
      </header>
      <main>
        <RoutePlanner />
      </main>
    </div>
  );
}

export default App;
