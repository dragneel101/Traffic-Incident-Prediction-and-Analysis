import React from "react";
import ReactDOM from "react-dom";

const SpinnerPortal = () => {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-gray-700 border-t-blue-500 rounded-full animate-spin" style={{ borderWidth: "3px" }} />
        <p className="text-sm text-gray-400 font-medium">Calculating route risk...</p>
      </div>
    </div>,
    document.body
  );
};

export default SpinnerPortal;
