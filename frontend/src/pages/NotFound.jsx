import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/6 rounded-full blur-3xl" />
      </div>

      <div className="text-center relative animate-slide-up">
        <p className="text-8xl font-extrabold text-transparent bg-gradient-to-b from-blue-400 to-blue-800 bg-clip-text mb-4 leading-none font-mono">
          404
        </p>
        <h2 className="text-2xl font-bold text-white mb-3">Page not found</h2>
        <p className="text-gray-500 mb-10 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
