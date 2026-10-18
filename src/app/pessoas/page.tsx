"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import PageLayout from "@/components/PageLayout";

type Pessoa = {
  ID_PESSOA: number;
  NOME: string;
  TIPO_PESSOA: "FISICA" | "JURIDICA";
  CPF_CNPJ: string;
  DATA_CADASTRO: string;
};

const FORM_VAZIO = { NOME: "", TIPO_PESSOA: "", CPF_CNPJ: "" };

// Estilos reutilizáveis
const inputStyle = {
  background: "hsl(var(--input))",
  border: "1px solid hsl(var(--border))",
  color: "hsl(var(--foreground))",
};

const labelStyle = {
  color: "hsl(var(--muted-foreground))",
  fontSize: "0.7rem",
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
};

export default function PessoasPage() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tipo: "ok" | "err" } | null>(null);

  const showToast = (msg: string, tipo: "ok" | "err") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
      const res = await api.get("/pessoas");
      setPessoas(res.data);
    } catch {
      showToast("Erro ao carregar pessoas.", "err");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const hoje = new Date().toISOString().split("T")[0];
      if (editId) {
        await api.put(`/pessoas/${editId}`, form);
        showToast("Pessoa atualizada com sucesso!", "ok");
        setEditId(null);
      } else {
        await api.post("/pessoas", { ...form, DATA_CADASTRO: hoje });
        showToast("Pessoa cadastrada com sucesso!", "ok");
      }
      setForm(FORM_VAZIO);
      carregar();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Erro ao salvar pessoa.", "err");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Confirma a exclusão desta pessoa?")) return;
    try {
      await api.delete(`/pessoas/${id}`);
      showToast("Pessoa excluída.", "ok");
      carregar();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Erro ao excluir.", "err");
    }
  };

  const handleEdit = (p: Pessoa) => {
    setForm({ NOME: p.NOME, TIPO_PESSOA: p.TIPO_PESSOA, CPF_CNPJ: p.CPF_CNPJ });
    setEditId(p.ID_PESSOA);
  };

  const cancelar = () => { setEditId(null); setForm(FORM_VAZIO); };

  return (
    <PageLayout title="Pessoas" description="Cadastro geral de pessoas físicas e jurídicas.">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg"
          style={{
            background: toast.tipo === "ok" ? "hsl(142, 71%, 35%)" : "hsl(0, 84%, 45%)",
            color: "white",
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Formulário */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>
          {editId ? "Editar Pessoa" : "Nova Pessoa"}
        </h3>
        {editId && (
          <button
            onClick={cancelar}
            className="text-sm font-semibold"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Cancelar Edição
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-4 mb-8 p-5 rounded-xl"
        style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}
      >
        <div className="flex-1">
          <label style={labelStyle} className="block mb-1.5">Nome / Razão Social *</label>
          <input
            required
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
            style={inputStyle}
            placeholder="Nome completo..."
            value={form.NOME}
            onChange={(e) => setForm({ ...form, NOME: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <label style={labelStyle} className="block mb-1.5">Tipo de Pessoa *</label>
          <select
            required
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
            style={inputStyle}
            value={form.TIPO_PESSOA}
            onChange={(e) => setForm({ ...form, TIPO_PESSOA: e.target.value })}
          >
            <option value="">Selecione...</option>
            <option value="FISICA">Física</option>
            <option value="JURIDICA">Jurídica</option>
          </select>
        </div>
        <div className="flex-1">
          <label style={labelStyle} className="block mb-1.5">CPF / CNPJ *</label>
          <input
            required
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
            style={inputStyle}
            placeholder="000.000.000-00"
            value={form.CPF_CNPJ}
            onChange={(e) => setForm({ ...form, CPF_CNPJ: e.target.value })}
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-60"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            {loading ? "Salvando..." : editId ? "Atualizar" : "Salvar"}
          </button>
        </div>
      </form>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid hsl(var(--border))" }}>
        <table className="w-full text-left text-sm">
          <thead style={{ background: "hsl(var(--secondary))" }}>
            <tr>
              {["#", "Nome", "Tipo", "CPF/CNPJ", "Cadastro", "Ações"].map((h, i) => (
                <th
                  key={h}
                  className="px-5 py-3 text-xs font-bold uppercase tracking-wider"
                  style={{
                    color: "hsl(var(--primary))",
                    textAlign: i === 5 ? "right" : "left",
                    borderBottom: "1px solid hsl(var(--border))",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pessoas.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-sm"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  Nenhuma pessoa encontrada no sistema.
                </td>
              </tr>
            ) : (
              pessoas.map((p) => (
                <tr
                  key={p.ID_PESSOA}
                  className="group transition-colors"
                  style={{ borderBottom: "1px solid hsl(var(--border))" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "hsl(var(--secondary))")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = "transparent")
                  }
                >
                  <td className="px-5 py-3.5 font-bold" style={{ color: "hsl(var(--muted-foreground))" }}>
                    #{p.ID_PESSOA}
                  </td>
                  <td className="px-5 py-3.5 font-medium" style={{ color: "hsl(var(--foreground))" }}>
                    {p.NOME}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-bold"
                      style={{
                        background:
                          p.TIPO_PESSOA === "FISICA"
                            ? "hsl(263, 70%, 58% / 0.2)"
                            : "hsl(217, 91%, 60% / 0.2)",
                        color:
                          p.TIPO_PESSOA === "FISICA"
                            ? "hsl(263, 70%, 75%)"
                            : "hsl(217, 91%, 75%)",
                      }}
                    >
                      {p.TIPO_PESSOA}
                    </span>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {p.CPF_CNPJ}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {p.DATA_CADASTRO
                      ? new Date(p.DATA_CADASTRO).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "hsl(263, 70%, 68%)" }}
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(p.ID_PESSOA)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "hsl(0, 84%, 65%)" }}
                        title="Excluir"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}
