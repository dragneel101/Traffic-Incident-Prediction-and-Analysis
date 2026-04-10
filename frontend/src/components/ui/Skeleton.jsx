export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gray-800 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}
