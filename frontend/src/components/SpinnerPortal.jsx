// src/components/SpinnerPortal.jsx
import React from "react";
import ReactDOM from "react-dom";

const SpinnerPortal = () => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
      <div className="h-16 w-16 border-4 border-t-indigo-500 border-white rounded-full animate-spin" />
    </div>,
    document.body
  );
};

export default SpinnerPortal;
