"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/services/auth";
import {
  Home, Users, Building2, Wrench, Truck, UserCheck,
  Calendar, FileText, Receipt, LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Painel", icon: Home },
  { href: "/pessoas", label: "Pessoas", icon: Users },
  { href: "/moradores", label: "Moradores", icon: Building2 },
  { href: "/funcionarios", label: "Funcionários", icon: Wrench },
  { href: "/fornecedores", label: "Fornecedores", icon: Truck },
  { href: "/visitantes", label: "Visitantes", icon: UserCheck },
  { href: "/unidades", label: "Unidades", icon: Building2 },
  { href: "/areas-comuns", label: "Áreas Comuns", icon: Calendar },
  { href: "/reservas", label: "Reservas", icon: Calendar },
  { href: "/boletos", label: "Boletos", icon: Receipt },
  { href: "/comunicados", label: "Comunicados", icon: FileText },
  { href: "/contratos", label: "Contratos", icon: FileText },
  { href: "/contas-pagar", label: "Contas a Pagar", icon: Receipt },
  { href: "/contas-receber", label: "Contas a Receber", icon: Receipt },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside
      className="w-64 flex flex-col h-screen sticky top-0 z-50"
      style={{
        borderRight: "1px solid hsl(var(--border))",
        background: "hsl(var(--card))",
      }}
    >
      {/* Header */}
      <div
        className="p-6 flex items-center gap-3"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-lg"
          style={{
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
          }}
        >
          C
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>
            CondoAdmin
          </p>
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            Sistema de Gestão
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        <p
          className="text-[10px] font-bold uppercase tracking-widest px-3 py-2"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          Menu Principal
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = path === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 relative"
              style={{
                color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                background: isActive ? "hsl(var(--secondary))" : "transparent",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r"
                  style={{ background: "hsl(var(--primary))" }}
                />
              )}
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer logout */}
      <div className="p-3" style={{ borderTop: "1px solid hsl(var(--border))" }}>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: "hsl(var(--muted-foreground))" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "hsl(var(--foreground))";
            (e.currentTarget as HTMLElement).style.background = "hsl(var(--secondary))";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "hsl(var(--muted-foreground))";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <LogOut className="h-4 w-4" />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}
