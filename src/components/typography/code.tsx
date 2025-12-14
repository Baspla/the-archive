export function Code({ children }: { children: React.ReactNode }) {
    return (
        <code className="font-mono bg-zinc-200 dark:bg-zinc-800 rounded px-1 py-0.5">
            {children}
        </code>
    );
}