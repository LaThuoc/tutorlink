import { Star } from "lucide-react";

export function Stars({ count = 5, size = 16 }: { count?: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${count} trên 5 sao`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} width={size} height={size} className="fill-amber-400 text-amber-400" aria-hidden="true" />
      ))}
    </span>
  );
}
