"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { isAuthenticated } from "@/services/auth";
import { dashboardService } from "../services/dashboardService";
import { Users, Building2, Receipt, Calendar, FileText, Wrench } from "lucide-react";

interface Stats {
  moradores: number;
  funcionarios: number;
  comunicados: number;
  reservas: number;
  unidades: number;
  receita: number;
  despesa: number;
  saldo: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  loading?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5 transition-all"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
          {title}
        </p>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      {loading ? (
        <div
          className="h-8 w-24 rounded animate-pulse"
          style={{ background: "hsl(var(--secondary))" }}
        />
      ) : (
        <p className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
          {value}
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    moradores: 0,
    funcionarios: 0,
    comunicados: 0,
    reservas: 0,
    unidades: 0,
    receita: 0,
    despesa: 0,
    saldo: 0,
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setLoading(false);
      loadStats();
    }
  }, [router]);

  const loadStats = async () => {
    setStatsLoading(true);
    const data = await dashboardService.getStats();
    setStats(data);
    setStatsLoading(false);
  };

  if (loading) return null;

  return (
    <div className="flex h-screen" style={{ background: "hsl(var(--background))" }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Painel do Condomínio
            </h1>
            <p className="mt-1 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              Visão geral do sistema
            </p>
          </div>
          <button
            onClick={loadStats}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: "hsl(var(--secondary))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <svg
              className={`w-4 h-4 ${statsLoading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Atualizar
          </button>
        </div>

        {/* Cards Financeiros */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:col-span-2">
            <StatCard
              title="Média de Receitas"
              value={statsLoading ? "" : formatCurrency(stats.receita)}
              icon={Receipt}
              color="hsl(142, 71%, 45%)"
              loading={statsLoading}
            />
            <StatCard
              title="Despesas Projetadas"
              value={statsLoading ? "" : formatCurrency(stats.despesa)}
              icon={Receipt}
              color="hsl(0, 84%, 60%)"
              loading={statsLoading}
            />
          </div>

          {/* Card de Saldo em destaque */}
          <div
            className="rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden"
            style={{ background: "hsl(var(--primary))" }}
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
              style={{
                background: "white",
                transform: "translate(30%, -30%)",
                filter: "blur(20px)",
              }}
            />
            <div className="relative z-10">
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: "hsl(var(--primary-foreground) / 0.8)" }}
              >
                Balanço Atualizado
              </p>
              {statsLoading ? (
                <div className="h-10 w-36 rounded animate-pulse bg-white/20 mt-1" />
              ) : (
                <p
                  className="text-3xl md:text-4xl font-black tracking-tight"
                  style={{ color: "hsl(var(--primary-foreground))" }}
                >
                  {formatCurrency(stats.saldo)}
                </p>
              )}
            </div>
            <div
              className="relative z-10 mt-6 pt-4 flex items-center justify-between"
              style={{ borderTop: "1px solid hsl(var(--primary-foreground) / 0.2)" }}
            >
              <div>
                <p
                  className="text-xs"
                  style={{ color: "hsl(var(--primary-foreground) / 0.7)" }}
                >
                  Saúde Financeira
                </p>
                <p className="font-bold text-sm" style={{ color: "hsl(var(--primary-foreground))" }}>
                  {stats.saldo >= 0 ? "Positiva ✨" : "Atenção ⚠️"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção Operacional */}
        <div className="flex items-center gap-4 mb-5">
          <h2 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>
            Visão Operacional
          </h2>
          <div className="h-px flex-1" style={{ background: "hsl(var(--border))" }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <StatCard
            title="Moradores"
            value={stats.moradores}
            icon={Users}
            color="hsl(263, 70%, 68%)"
            loading={statsLoading}
          />
          <StatCard
            title="Funcionários Ativos"
            value={stats.funcionarios}
            icon={Wrench}
            color="hsl(217, 91%, 70%)"
            loading={statsLoading}
          />
          <StatCard
            title="Reservas Agendadas"
            value={stats.reservas}
            icon={Calendar}
            color="hsl(38, 92%, 60%)"
            loading={statsLoading}
          />
          <StatCard
            title="Comunicados"
            value={stats.comunicados}
            icon={FileText}
            color="hsl(142, 71%, 55%)"
            loading={statsLoading}
          />
        </div>

        {/* Unidades */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: "hsl(var(--foreground))" }}>
              Capacidade e Ocupação
            </h3>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                background: "hsl(var(--primary) / 0.15)",
                color: "hsl(var(--primary))",
              }}
            >
              Unidades Cadastradas
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black"
              style={{
                background: "hsl(var(--secondary))",
                color: "hsl(var(--foreground))",
                border: `4px solid hsl(var(--primary))`,
              }}
            >
              {statsLoading ? "..." : stats.unidades}
            </div>
            <div>
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                Total de unidades mapeadas no sistema.
              </p>
              <p className="text-xs mt-1 font-semibold" style={{ color: "hsl(var(--primary))" }}>
                <Building2 className="inline h-3 w-3 mr-1" />
                Estrutura registrada no banco de dados
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
