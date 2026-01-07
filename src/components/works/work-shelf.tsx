import { WorkCover } from "@/components/works/work-cover";
import { WorkWithPenName } from "@/lib/db/schema";
import { cn, getWorkTitle } from "@/lib/utils";
import { TitleH2 } from "@/components/typography/title-h2";

interface WorkShelfProps {
  works: WorkWithPenName[];
  title?: string;
  className?: string;
  multiple?: boolean;
}

export function WorkShelf({ works, title, className, multiple }: WorkShelfProps) {
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

  if (multiple) {
    return (
      <div className={cn("w-full space-y-4", className)}>
        {title && (
          <TitleH2>{title}</TitleH2>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 px-1">
          {works.map((work) => (
            <WorkCover
              key={work.id}
              id={work.id}
              title={getWorkTitle(work)}
              authorName={work.penName.name}
              teaserDate={work.teaserDate}
              publicationDate={work.publicationDate}
            />
          ))}
        </div>
      </div>
    );
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
                title={getWorkTitle(work)}
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
