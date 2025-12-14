export function Subtitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl text-zinc-100 dark:text-zinc-300 mt-2">
      {children}
    </h2>
  );
}