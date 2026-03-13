import { formatSilver, formatSilverCompact } from "@/lib/utils/formatting";

interface SilverDisplayProps {
  amount: number;
  compact?: boolean;
  className?: string;
  showSign?: boolean;
}

export default function SilverDisplay({
  amount,
  compact = false,
  className = "",
  showSign = false,
}: SilverDisplayProps) {
  const formatted = compact ? formatSilverCompact(amount) : formatSilver(amount);
  const colorClass = amount > 0 ? "text-green-400" : amount < 0 ? "text-red-400" : "text-gray-400";
  const sign = showSign && amount > 0 ? "+" : "";

  return (
    <span className={`font-mono ${colorClass} ${className}`}>
      {sign}{formatted}
    </span>
  );
}
