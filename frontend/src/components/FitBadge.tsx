// Colored pill showing an overall fit category
import type { FitCategory } from "@/lib/api";

// Tailwind classes per fit category
const STYLES: Record<FitCategory, string> = {
  "Strong Fit": "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Good Fit": "bg-blue-100 text-blue-800 border-blue-300",
  "Partial Fit": "bg-amber-100 text-amber-800 border-amber-300",
  "Not a Fit": "bg-red-100 text-red-800 border-red-300",
};

export default function FitBadge({ fit }: { fit: FitCategory }) {
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-sm font-medium ${STYLES[fit]}`}
    >
      {fit}
    </span>
  );
}
