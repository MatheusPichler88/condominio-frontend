"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import PageLayout from "@/components/PageLayout";

// Interface para tipagem do formulário
interface ComunicadoForm {
  TITULO: string;
  MENSAGEM: string;
  DT_COMUNICADO: string;
  HR_COMUNICADO: string;
  TIPO: string;
}

const inputStyle = { background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" };
const labelStyle = { color: "hsl(var(--muted-foreground))", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em" };

export default function ComunicadosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<ComunicadoForm>({ TITULO: "", MENSAGEM: "", DT_COMUNICADO: "", HR_COMUNICADO: "", TIPO: "" });
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
      const res = await api.get("/comunicados");
      setItems(res.data);
    } catch { showToast("Erro ao carregar dados.", "err"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/comunicados/${editId}`, form);
        showToast("Comunicado atualizado!", "ok"); 
        setEditId(null);
      } else {
        await api.post("/comunicados", form);
        showToast("Comunicado cadastrado!", "ok");
      }
      setForm({ TITULO: "", MENSAGEM: "", DT_COMUNICADO: "", HR_COMUNICADO: "", TIPO: "" }); 
      carregar();
    } catch { 
      showToast("Erro ao salvar.", "err"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Confirma a exclusão?")) return;
    try { 
      await api.delete(`/comunicados/${id}`); 
      showToast("Excluído com sucesso.", "ok"); 
      carregar(); 
    } catch { 
      showToast("Erro ao excluir.", "err"); 
    }
  };

  const handleEdit = (row: any) => {
    setForm({ 
      TITULO: row.TITULO, 
      MENSAGEM: row.MENSAGEM, 
      DT_COMUNICADO: row.DT_COMUNICADO, 
      HR_COMUNICADO: row.HR_COMUNICADO, 
      TIPO: row.TIPO 
    });
    setEditId(row.ID_COMUNICADO);
  };

  return (
    <PageLayout title="Comunicado" description="Comunicados oficiais da administração para os moradores.">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg animate-in fade-in"
          style={{ background: toast.tipo === "ok" ? "hsl(142, 71%, 35%)" : "hsl(0, 84%, 45%)", color: "white" }}>
          {toast.msg}
        </div>
      )}

      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>
          {editId ? "Editar Comunicado" : "Novo Comunicado"}
        </h3>
        {editId && (
          <button 
            onClick={() => { setEditId(null); setForm({ TITULO: "", MENSAGEM: "", DT_COMUNICADO: "", HR_COMUNICADO: "", TIPO: "" }); }}
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
          <label style={labelStyle} className="block mb-1.5">Título *</label>
          <input required type="text" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}
            placeholder="Ex: Manutenção da Piscina" value={form.TITULO} onChange={(e) => setForm({ ...form, TITULO: e.target.value })} />
        </div>

        <div className="flex-1" style={{ minWidth: "180px" }}>
          <label style={labelStyle} className="block mb-1.5">Tipo</label>
          <input type="text" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}
            placeholder="Ex: Urgente, Informativo" value={form.TIPO} onChange={(e) => setForm({ ...form, TIPO: e.target.value })} />
        </div>

        <div className="flex-1" style={{ minWidth: "180px" }}>
          <label style={labelStyle} className="block mb-1.5">Data *</label>
          <input required type="date" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}
            value={form.DT_COMUNICADO} onChange={(e) => setForm({ ...form, DT_COMUNICADO: e.target.value })} />
        </div>

        <div className="flex-1" style={{ minWidth: "180px" }}>
          <label style={labelStyle} className="block mb-1.5">Hora *</label>
          <input required type="time" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}
            value={form.HR_COMUNICADO} onChange={(e) => setForm({ ...form, HR_COMUNICADO: e.target.value })} />
        </div>

        <div className="w-full">
          <label style={labelStyle} className="block mb-1.5">Mensagem *</label>
          <textarea required className="w-full px-4 py-2.5 rounded-lg text-sm outline-none min-h-[80px]" style={inputStyle}
            placeholder="Detalhes do aviso..." value={form.MENSAGEM} onChange={(e) => setForm({ ...form, MENSAGEM: e.target.value })} />
        </div>

        <div className="flex justify-end w-full">
          <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-lg text-sm font-bold disabled:opacity-60 transition-all hover:brightness-110"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
            {loading ? "Salvando..." : editId ? "Atualizar" : "Salvar"}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid hsl(var(--border))" }}>
        <table className="w-full text-left text-sm">
          <thead style={{ background: "hsl(var(--secondary))" }}>
            <tr>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}># Comunicado</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>Título</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>Tipo</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>Data / Hora</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-right" style={{ color: "hsl(var(--primary))" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Nenhum registro encontrado.</td></tr>
            ) : (
              items.map((row) => (
                <tr key={row.ID_COMUNICADO} className="group border-b hover:bg-[hsl(var(--secondary))]" style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="px-5 py-3.5 font-bold text-[hsl(var(--muted-foreground))]">#{row.ID_COMUNICADO}</td>
                  <td className="px-5 py-3.5 text-[hsl(var(--foreground))] font-bold">{row.TITULO}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold" style={{ background: "hsl(217,91%,60%,0.2)", color: "hsl(217,91%,75%)" }}>
                      {row.TIPO || "Geral"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--muted-foreground))]">
                    {new Date(row.DT_COMUNICADO).toLocaleDateString('pt-BR')} às {row.HR_COMUNICADO}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(row)} className="p-2 rounded-lg text-[hsl(263,70%,68%)]" title="Editar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(row.ID_COMUNICADO)} className="p-2 rounded-lg text-[hsl(0,84%,65%)]" title="Excluir">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
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