import { WorkCover } from "@/components/works/work-cover";
import { WorkWithPenName } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { TitleH2 } from "@/components/typography/title-h2";

interface WorkShelfProps {
  works: WorkWithPenName[];
  title?: string;
  className?: string;
}

export function WorkShelf({ works, title, className }: WorkShelfProps) {
  if (!works.length) {
    return (
      <div className={cn("w-full space-y-4", className)}>
        {title && (
          <TitleH2>{title}</TitleH2>
        )}
        <p className="px-1 text-muted-foreground">Keine Werke gefunden.</p>
      </div>
    )
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {title && (
        <TitleH2>{title}</TitleH2>
      )}
      <div className="relative w-full">
        <div className="flex w-full gap-6 overflow-x-auto pb-6 pt-2 px-1 snap-x">
          {works.map((work) => (
            <div key={work.id} className="w-[140px] flex-none snap-start">
              <WorkCover
                id={work.id}
                title={work.title}
                authorName={work.penName.name}
                teaserDate={work.teaserDate}
                publicationDate={work.publicationDate}
              />
            </div>
          ))}
        </div>
        {/* Fade gradients for scroll indication could go here */}
      </div>
    </div>
  );
}
