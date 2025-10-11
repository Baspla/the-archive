import { Header } from "@/components/layout/header";
import { SessionProvider } from "next-auth/react";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SessionProvider>
        <Header />
        {children}
      </SessionProvider>
    </>
  );
}
