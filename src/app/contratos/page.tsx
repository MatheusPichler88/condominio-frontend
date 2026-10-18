"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import PageLayout from "@/components/PageLayout";
import SelectRelacionado from "@/components/SelectRelacionado";

// Definição de tipos para o formulário de contrato
interface ContratoForm {
  ID_FORNECEDOR: string;
  DESCRICAO: string;
  DATA_INICIO: string;
  DATA_FIM: string;
  VALOR: string;
}

const inputStyle = { background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" };
const labelStyle = { color: "hsl(var(--muted-foreground))", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em" };

export default function ContratosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<ContratoForm>({ ID_FORNECEDOR: "", DESCRICAO: "", DATA_INICIO: "", DATA_FIM: "", VALOR: "" });
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
      const res = await api.get("/contratos");
      setItems(res.data);
    } catch { showToast("Erro ao carregar dados.", "err"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/contratos/${editId}`, form);
        showToast("Contrato atualizado!", "ok"); 
        setEditId(null);
      } else {
        await api.post("/contratos", form);
        showToast("Contrato cadastrado!", "ok");
      }
      setForm({ ID_FORNECEDOR: "", DESCRICAO: "", DATA_INICIO: "", DATA_FIM: "", VALOR: "" }); 
      carregar();
    } catch { 
      showToast("Erro ao salvar.", "err"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Confirma a exclusão deste contrato?")) return;
    try { 
      await api.delete(`/contratos/${id}`); 
      showToast("Excluído com sucesso.", "ok"); 
      carregar(); 
    } catch { 
      showToast("Erro ao excluir.", "err"); 
    }
  };

  const handleEdit = (row: any) => {
    setForm({ 
      ID_FORNECEDOR: row.ID_FORNECEDOR, 
      DESCRICAO: row.DESCRICAO, 
      DATA_INICIO: row.DATA_INICIO, 
      DATA_FIM: row.DATA_FIM, 
      VALOR: row.VALOR 
    });
    setEditId(row.ID_CONTRATO);
  };

  return (
    <PageLayout title="Contratos" description="Acordos comerciais, prestação de serviços e documentação legal.">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg animate-in fade-in"
          style={{ background: toast.tipo === "ok" ? "hsl(142, 71%, 35%)" : "hsl(0, 84%, 45%)", color: "white" }}>
          {toast.msg}
        </div>
      )}

      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>
          {editId ? "Editar Contrato" : "Novo Contrato"}
        </h3>
        {editId && (
          <button 
            onClick={() => { setEditId(null); setForm({ ID_FORNECEDOR: "", DESCRICAO: "", DATA_INICIO: "", DATA_FIM: "", VALOR: "" }); }}
            className="text-sm font-semibold hover:underline" 
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Cancelar Edição
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row flex-wrap gap-4 mb-8 p-5 rounded-xl"
        style={{ background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
        
        <div className="flex-1" style={{ minWidth: "140px" }}>
          <label style={labelStyle} className="block mb-1.5">Fornecedor (ID) *</label>
          <SelectRelacionado tipo="fornecedor" style={inputStyle} value={form.ID_FORNECEDOR} onChange={(v) => setForm({ ...form, ID_FORNECEDOR: v })} />
        </div>

        <div className="flex-[2]" style={{ minWidth: "200px" }}>
          <label style={labelStyle} className="block mb-1.5">Descrição *</label>
          <input required type="text" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}
            placeholder="Ex: Manutenção Mensal" value={form.DESCRICAO} onChange={(e) => setForm({ ...form, DESCRICAO: e.target.value })} />
        </div>

        <div className="flex-1" style={{ minWidth: "140px" }}>
          <label style={labelStyle} className="block mb-1.5">Data Início *</label>
          <input required type="date" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}
            value={form.DATA_INICIO} onChange={(e) => setForm({ ...form, DATA_INICIO: e.target.value })} />
        </div>

        <div className="flex-1" style={{ minWidth: "140px" }}>
          <label style={labelStyle} className="block mb-1.5">Data Fim *</label>
          <input required type="date" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}
            value={form.DATA_FIM} onChange={(e) => setForm({ ...form, DATA_FIM: e.target.value })} />
        </div>

        <div className="flex-1" style={{ minWidth: "140px" }}>
          <label style={labelStyle} className="block mb-1.5">Valor (R$) *</label>
          <input required type="number" step="0.01" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}
            placeholder="0.00" value={form.VALOR} onChange={(e) => setForm({ ...form, VALOR: e.target.value })} />
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
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}># Contrato</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>Descrição / Fornecedor</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>Valor</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>Vigência</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-right" style={{ color: "hsl(var(--primary))" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Nenhum contrato encontrado.</td></tr>
            ) : (
              items.map((row) => (
                <tr key={row.ID_CONTRATO} className="group border-b hover:bg-[hsl(var(--secondary))]" style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="px-5 py-3.5 font-bold text-[hsl(var(--muted-foreground))]">#{row.ID_CONTRATO}</td>
                  <td className="px-5 py-3.5">
                    <span className="block font-medium text-[hsl(var(--foreground))]">{row.DESCRICAO}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded mt-1 inline-block" style={{ background: "hsl(217,91%,60%,0.15)", color: "hsl(217,91%,70%)" }}>
                      Fornecedor {row.ID_FORNECEDOR}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-[hsl(var(--foreground))]">R$ {Number(row.VALOR).toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-xs text-[hsl(var(--muted-foreground))]">
                    {new Date(row.DATA_INICIO).toLocaleDateString('pt-BR')} → {new Date(row.DATA_FIM).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(row)} className="p-2 rounded-lg text-[hsl(263,70%,68%)]" title="Editar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(row.ID_CONTRATO)} className="p-2 rounded-lg text-[hsl(0,84%,65%)]" title="Excluir">
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