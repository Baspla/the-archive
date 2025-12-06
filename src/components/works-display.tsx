import Link from "next/link";
import { WorkWithPenName } from "@/lib/db/schema";

export interface WorksDisplayProps {
    works: Array<WorkWithPenName>;
    title: string;
}

export async function WorksDisplay({ works, title }: WorksDisplayProps) {
    return (
        <div className="w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <div className=" gap-4 flex flex-row flex-wrap">
                {works.map((work) => (
                    <div key={work.id} className="p-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-48 flex flex-col gap-2">
                        <Link href={`/works/${work.id}`} className="font-bold hover:underline">
                            {work.title? work.title : "Unbenanntes Werk - "+work.id.substring(0, 4)}
                        </Link>
                        <span className="text-sm dark:text-zinc-400 text-zinc-600">{work.penName.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}