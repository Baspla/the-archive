export function Subtitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl text-zinc-600 dark:text-zinc-400 mt-2">
      {children}
    </h2>
  );
}