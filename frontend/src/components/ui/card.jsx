// src/components/ui/card.jsx
import React from "react";

export function Card({ children }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-200">
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-2 ${className}`}>{children}</div>;
}
