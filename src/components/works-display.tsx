import Link from "next/link";
import { Work } from "@/lib/db/schema";

export interface WorksDisplayProps {
    works: Array<Work>;
    title: string;
}

export async function WorksDisplay({ works, title }: WorksDisplayProps) {
    return (
        <div className="w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <div className=" gap-4 flex flex-row flex-wrap">
                {works.map((work) => (
                    <div key={work.id} className="p-4 bg-zinc-800 rounded-md w-48">
                        <Link href={`/works/${work.id}`}>
                            {work.title? work.title : "Unbenanntes Werk - "+work.id.substring(0, 4)}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}