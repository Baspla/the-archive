import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getWorkTitle(work: { title: string | null | undefined; id: string }) {
  return work.title || `Unbenanntes Werk - ${work.id.substring(0, 4)}`;
}

