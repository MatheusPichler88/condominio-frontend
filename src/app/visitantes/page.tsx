"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import PageLayout from "@/components/PageLayout";
import SelectRelacionado from "@/components/SelectRelacionado";

// Interface para manter o formulário tipado
interface VisitanteForm {
  ID_PESSOA: string;
  DOCUMENTO: string;
}

const inputStyle = { background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" };
const labelStyle = { color: "hsl(var(--muted-foreground))", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em" };

export default function VisitantesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<VisitanteForm>({ ID_PESSOA: "", DOCUMENTO: "" });
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
      const res = await api.get("/visitantes");
      setItems(res.data);
    } catch { showToast("Erro ao carregar dados.", "err"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/visitantes/${editId}`, form);
        showToast("Visitante atualizado!", "ok"); 
        setEditId(null);
      } else {
        await api.post("/visitantes", form);
        showToast("Visitante cadastrado!", "ok");
      }
      setForm({ ID_PESSOA: "", DOCUMENTO: "" }); 
      carregar();
    } catch (err: any) { 
      showToast(err?.response?.data?.message || "Erro ao salvar.", "err"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Confirma a exclusão deste visitante?")) return;
    try { 
      await api.delete(`/visitantes/${id}`); 
      showToast("Excluído com sucesso.", "ok"); 
      carregar(); 
    } catch (err: any) { 
      showToast(err?.response?.data?.message || "Erro ao excluir.", "err"); 
    }
  };

  const handleEdit = (row: any) => {
    setForm({ ID_PESSOA: row.ID_PESSOA, DOCUMENTO: row.DOCUMENTO });
    setEditId(row.ID_VISITANTE);
  };

  return (
    <PageLayout title="Visitantes" description="Gestão de controle de acesso e cadastro de visitantes.">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg animate-in fade-in slide-in-from-top-2"
          style={{ background: toast.tipo === "ok" ? "hsl(142, 71%, 35%)" : "hsl(0, 84%, 45%)", color: "white" }}>
          {toast.msg}
        </div>
      )}

      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>
          {editId ? "Editar Visitante" : "Novo Visitante"}
        </h3>
        {editId && (
          <button 
            onClick={() => { setEditId(null); setForm({ ID_PESSOA: "", DOCUMENTO: "" }); }}
            className="text-sm font-semibold hover:underline" 
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Cancelar Edição
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-8 p-5 rounded-xl"
        style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
        
        <div className="flex-1">
          <label style={labelStyle} className="block mb-1.5">Pessoa *</label>
          <SelectRelacionado tipo="pessoa" style={inputStyle} value={form.ID_PESSOA} onChange={(v) => setForm({ ...form, ID_PESSOA: v })} />
        </div>

        <div className="flex-[2]">
          <label style={labelStyle} className="block mb-1.5">Documento *</label>
          <input required type="text" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}
            placeholder="RG, CNH ou Passaporte..." value={form.DOCUMENTO} onChange={(e) => setForm({ ...form, DOCUMENTO: e.target.value })} />
        </div>

        <div className="flex items-end">
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
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}># Visitante</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>Ref. Pessoa</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>Documento</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-right" style={{ color: "hsl(var(--primary))" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={4} className="py-10 text-center text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Nenhum visitante encontrado.</td></tr>
            ) : (
              items.map((row) => (
                <tr key={row.ID_VISITANTE} className="group border-b hover:bg-[hsl(var(--secondary))]/50 transition-colors" style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="px-5 py-3.5 font-bold text-[hsl(var(--muted-foreground))]">#{row.ID_VISITANTE}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold" style={{ background: "hsl(217,91%,60%,0.15)", color: "hsl(217,91%,75%)" }}>
                      ID: {row.ID_PESSOA}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[hsl(var(--foreground))]">{row.DOCUMENTO}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(row)} className="p-2 rounded-lg text-[hsl(263,70%,68%)]" title="Editar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(row.ID_VISITANTE)} className="p-2 rounded-lg text-[hsl(0,84%,65%)]" title="Excluir">
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