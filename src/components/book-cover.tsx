import { cn } from "@/lib/utils";
import Link from "next/link";

interface BookCoverProps {
  id: string;
  title: string | null;
  authorName: string | null;
  teaserDate?: Date | null;
  publicationDate?: Date | null;
  className?: string;
}

const gradients = [
  "from-red-500 to-orange-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-purple-500 to-pink-500",
  "from-yellow-500 to-orange-500",
  "from-indigo-500 to-purple-500",
  "from-pink-500 to-rose-500",
  "from-slate-500 to-slate-700",
  "from-teal-500 to-green-500",
  "from-violet-500 to-fuchsia-500",
];

const getGradient = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

export function BookCover({
  id,
  title,
  authorName,
  teaserDate,
  publicationDate,
  className,
}: BookCoverProps) {
  const gradient = getGradient(id);
  const isTeasered = !!teaserDate && !publicationDate;
  const isSecret = !teaserDate && !publicationDate;
  const isPublishedButNotTeasered = !!publicationDate && !teaserDate;

  return (
    <Link href={`/works/${id}`} className={cn("group block", className)}>
      <div
        className={cn(
          "relative aspect-[2/3] w-full overflow-hidden rounded-r-md rounded-l-sm shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl",
          "bg-gradient-to-br",
          gradient
        )}
      >
        {/* Banners */}
        {isTeasered && (
          <div className="absolute top-3 -right-10 z-20 w-32 rotate-45 bg-yellow-400 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-yellow-900 shadow-sm">
            Teaser
          </div>
        )}
        {isSecret && (
          <div className="absolute top-3 -right-10 z-20 w-32 rotate-45 bg-slate-900 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-100 shadow-sm">
            Secret
          </div>
        )}
        {isPublishedButNotTeasered && (
          <div className="absolute top-3 -right-10 z-20 w-32 rotate-45 bg-red-400 py-1 text-center text-[10px] font-bold uppercase tracking-wider text-red-900 shadow-sm">
            Bad State
          </div>
        )}

        {/* Spine effect */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/20 z-10" />
        <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-white/10 z-10" />

        {/* Content */}
        <div className="flex h-full flex-col justify-between p-4 text-white">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold leading-tight line-clamp-4 break-words">
              {title}
            </h3>
          </div>
          <div className="mt-auto">
            <p className="text-xs font-medium opacity-90 line-clamp-1">
              {authorName}
            </p>
          </div>
        </div>

        {/* Texture overlay (optional) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
      </div>
    </Link>
  );
}
