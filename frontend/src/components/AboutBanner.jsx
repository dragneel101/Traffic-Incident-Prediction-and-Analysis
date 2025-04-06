export default function AboutBanner() {
    return (
      <div className="relative bg-white shadow-lg overflow-hidden w-full my-10 px-4 md:px-12">
        {/* Layout container */}
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[300px]">
          {/* Left side content */}
          <div className="p-8 flex flex-col justify-center">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">Collision Predictor</h2>
            <h3 className="text-2xl font-semibold text-green-600 mb-4"></h3>
            <p className="text-gray-700 leading-relaxed">
                This project is a full-stack <strong className="text-black">real-time traffic collision risk prediction system</strong> built to help users make safer travel decisions. It integrates historical accident datasets with live traffic data, weather forecasts, and contextual metadata (like time of day and location) to estimate the probability of collisions along a specified route. The application not only predicts but also visualizes risk zones and offers smart routing suggestions based on risk levels.
              </p>
              <p className="text-gray-700">
                The project was conceived to address the growing need for proactive, data-driven traffic safety tools—especially in densely populated urban settings like Toronto. From commuters to emergency services, the platform supports a wide range of users seeking safer journeys.
              </p>
          </div>
  
          {/* Right side image */}
          <div className="relative min-h-[300px]">
            <img
              src="/assets/city-banner.png"
              alt="City Skyline"
              className="w-full h-full object-cover"
            />

  
            {/* Circle badge (optional) */}
            <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-purple-700 rounded-full w-24 h-24 flex items-center justify-center shadow-md text-center hidden md:flex p-2">
                <img
                    src="/assets/logo.png"
                    alt="Logo"
                    className="rounded-full w-full h-full object-contain"
                />       
            </div>
          </div>
        </div>
      </div>
    );
  }
  