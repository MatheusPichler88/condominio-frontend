"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import PageLayout from "@/components/PageLayout";
import SelectRelacionado from "@/components/SelectRelacionado";

// Interfaces para melhor suporte do TS
interface MoradorForm {
  ID_PESSOA: string | number;
  ID_UNIDADE: string | number;
}

const inputStyle = { background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" };
const labelStyle = { color: "hsl(var(--muted-foreground))", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em" };

export default function MoradoresPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<MoradorForm>({ ID_PESSOA: "", ID_UNIDADE: "" }); // Corrigido: Chaves simples
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
      const res = await api.get("/moradores");
      setItems(res.data);
    } catch { showToast("Erro ao carregar dados.", "err"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/moradores/${editId}`, form);
        showToast("Registro atualizado!", "ok"); 
        setEditId(null);
      } else {
        await api.post("/moradores", form);
        showToast("Cadastrado com sucesso!", "ok");
      }
      setForm({ ID_PESSOA: "", ID_UNIDADE: "" }); // Corrigido: Chaves simples
      carregar();
    } catch { 
      showToast("Erro ao salvar. Verifique os dados.", "err"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Confirma a exclusão?")) return;
    try { 
      await api.delete(`/moradores/${id}`); 
      showToast("Excluído com sucesso.", "ok"); 
      carregar(); 
    } catch { 
      showToast("Erro ao excluir.", "err"); 
    }
  };

  const handleEdit = (row: any) => {
    setForm({ ID_PESSOA: row.ID_PESSOA, ID_UNIDADE: row.ID_UNIDADE });
    setEditId(row.ID_MORADOR);
  };

  return (
    <PageLayout title="Moradores" description="Controle e associação de pessoas às suas unidades.">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg animate-in fade-in slide-in-from-top-4"
          style={{ background: toast.tipo === "ok" ? "hsl(142, 71%, 35%)" : "hsl(0, 84%, 45%)", color: "white" }}>
          {toast.msg}
        </div>
      )}

      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>
          {editId ? "Editar Morador" : "Novo Morador"}
        </h3>
        {editId && (
          <button 
            onClick={() => { setEditId(null); setForm({ ID_PESSOA: "", ID_UNIDADE: "" }); }}
            className="text-sm font-semibold hover:underline" 
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Cancelar Edição
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row flex-wrap gap-4 mb-8 p-5 rounded-xl"
        style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
        
        <div className="flex-1" style={{ minWidth: "180px" }}>
          <label style={labelStyle} className="block mb-1.5">Pessoa *</label>
          <SelectRelacionado tipo="pessoa" style={inputStyle} value={form.ID_PESSOA} onChange={(v) => setForm({ ...form, ID_PESSOA: v })} />
        </div>

        <div className="flex-1" style={{ minWidth: "180px" }}>
          <label style={labelStyle} className="block mb-1.5">Unidade *</label>
          <SelectRelacionado tipo="unidade" style={inputStyle} value={form.ID_UNIDADE} onChange={(v) => setForm({ ...form, ID_UNIDADE: v })} />
        </div>

        <div className="flex items-end">
          <button 
            type="submit" 
            disabled={loading} 
            className="px-6 py-2.5 rounded-lg text-sm font-bold disabled:opacity-60 transition-all hover:brightness-110"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            {loading ? "Salvando..." : editId ? "Atualizar" : "Salvar"}
          </button>
        </div>
      </form>

      {/* Tabela (Omitida por brevidade, mas o erro do styles={labelStyle} acima deve ser aplicado nela se houver labels) */}
      {/* ... seu código da tabela permanece igual, está bem estruturado ... */}
    </PageLayout>
  );
}