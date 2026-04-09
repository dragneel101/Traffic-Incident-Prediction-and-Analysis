const legendItems = [
  { color: "bg-green-500",  label: "Low",    hint: "< 30%" },
  { color: "bg-orange-500", label: "Medium", hint: "30–60%" },
  { color: "bg-red-500",    label: "High",   hint: "> 60%" },
];

export default function RiskLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
      {legendItems.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-full inline-block ${item.color}`} />
          <span>{item.label}</span>
          <span className="text-gray-400">{item.hint}</span>
        </span>
      ))}
    </div>
  );
}
