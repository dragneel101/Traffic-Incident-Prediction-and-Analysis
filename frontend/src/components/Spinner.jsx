import React from "react";

const Spinner = ({ fullscreen = false }) => {
  if (fullscreen) {
    return (
      <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-indigo-600 border-solid"></div>
    </div>
  );
};

export default Spinner;
