export default function H1({ children }: { children: React.ReactNode }) {
    return (
        <h1 className="my-8 text-4xl font-extrabold tracking-tight text-balance">
            {children}
        </h1>
    );
}
