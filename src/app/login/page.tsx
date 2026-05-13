"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ login: "", password: "" });
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      await login(form.login, form.password);
      router.push("/dashboard");
    } catch {
      setErro("Login ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "hsl(var(--background))" }}
    >
      {/* Card de Login */}
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
        }}
      >
        {/* Header */}
        <div className="px-8 pt-10 pb-6 text-center">
          <div
            className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "hsl(var(--primary) / 0.2)" }}
          >
            <span className="text-2xl">🏢</span>
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "hsl(var(--foreground))" }}
          >
            Sistema de Condomínios
          </h1>
          <p className="mt-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Faça login para acessar o painel
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-4">
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Login
            </label>
            <input
              required
              placeholder="seu.login"
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
              style={{
                background: "hsl(var(--input))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
              onFocus={(e) => {
                (e.target as HTMLElement).style.borderColor = "hsl(var(--ring))";
              }}
              onBlur={(e) => {
                (e.target as HTMLElement).style.borderColor = "hsl(var(--border))";
              }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "hsl(var(--foreground))" }}
            >
              Senha
            </label>
            <input
              required
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
              style={{
                background: "hsl(var(--input))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
              onFocus={(e) => {
                (e.target as HTMLElement).style.borderColor = "hsl(var(--ring))";
              }}
              onBlur={(e) => {
                (e.target as HTMLElement).style.borderColor = "hsl(var(--border))";
              }}
            />
          </div>

          {erro && (
            <p className="text-sm text-center" style={{ color: "hsl(var(--color-danger))" }}>
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-70"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
