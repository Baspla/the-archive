export function HeroBlock({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center py-16 px-4 sm:px-6 lg:px-8 gap-4 bg-gradient-to-b dark:from-indigo-800 dark:via-indigo-600/35 from-indigo-400 to-indigo-400 dark:to-transparent text-white">
            {children}
        </div>
    );
}