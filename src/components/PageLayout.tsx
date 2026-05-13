"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/services/auth";
import Sidebar from "./Sidebar";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  actionButton?: ReactNode;
}

export default function PageLayout({ children, title, description, actionButton }: PageLayoutProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  if (!isClient) return null;

  return (
    <div className="flex h-screen" style={{ background: "hsl(var(--background))" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        {/* Header da página */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: "hsl(var(--foreground))" }}
            >
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                {description}
              </p>
            )}
          </div>
          {actionButton && <div>{actionButton}</div>}
        </div>

        {/* Conteúdo principal */}
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
