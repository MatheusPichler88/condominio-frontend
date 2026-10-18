"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import PageLayout from "@/components/PageLayout";
import SelectRelacionado from "@/components/SelectRelacionado";

// Interface para organizar os dados do formulário
interface ReservaForm {
  ID_MORADOR: string;
  ID_AREA_COMUM: string;
  DATA_RESERVA: string;
  HR_INICIO: string;
  HR_FIM: string;
}

const inputStyle = { background: "hsl(var(--input))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" };
const labelStyle = { color: "hsl(var(--muted-foreground))", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em" };

export default function ReservasPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<ReservaForm>({ ID_MORADOR: "", ID_AREA_COMUM: "", DATA_RESERVA: "", HR_INICIO: "", HR_FIM: "" });
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
      const res = await api.get("/reservas");
      setItems(res.data);
    } catch { showToast("Erro ao carregar dados.", "err"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/reservas/${editId}`, form);
        showToast("Reserva atualizada!", "ok"); 
        setEditId(null);
      } else {
        await api.post("/reservas", form);
        showToast("Reserva cadastrada!", "ok");
      }
      setForm({ ID_MORADOR: "", ID_AREA_COMUM: "", DATA_RESERVA: "", HR_INICIO: "", HR_FIM: "" }); 
      carregar();
    } catch { 
      showToast("Erro ao salvar.", "err"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Confirma a exclusão desta reserva?")) return;
    try { 
      await api.delete(`/reservas/${id}`); 
      showToast("Excluído com sucesso.", "ok"); 
      carregar(); 
    } catch { 
      showToast("Erro ao excluir.", "err"); 
    }
  };

  const handleEdit = (row: any) => {
    setForm({ 
      ID_MORADOR: row.ID_MORADOR, 
      ID_AREA_COMUM: row.ID_AREA_COMUM, 
      DATA_RESERVA: row.DATA_RESERVA, 
      HR_INICIO: row.HR_INICIO, 
      HR_FIM: row.HR_FIM 
    });
    setEditId(row.ID_RESERVA);
  };

  return (
    <PageLayout title="Reservas" description="Agendamento de áreas comuns para uso dos moradores.">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg animate-in fade-in"
          style={{ background: toast.tipo === "ok" ? "hsl(142, 71%, 35%)" : "hsl(0, 84%, 45%)", color: "white" }}>
          {toast.msg}
        </div>
      )}

      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold" style={{ color: "hsl(var(--foreground))" }}>
          {editId ? "Editar Reserva" : "Nova Reserva"}
        </h3>
        {editId && (
          <button 
            onClick={() => { setEditId(null); setForm({ ID_MORADOR: "", ID_AREA_COMUM: "", DATA_RESERVA: "", HR_INICIO: "", HR_FIM: "" }); }}
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
          <label style={labelStyle} className="block mb-1.5">Morador *</label>
          <SelectRelacionado tipo="morador" style={inputStyle} value={form.ID_MORADOR} onChange={(v) => setForm({ ...form, ID_MORADOR: v })} />
        </div>

        <div className="flex-1" style={{ minWidth: "140px" }}>
          <label style={labelStyle} className="block mb-1.5">Área Comum *</label>
          <SelectRelacionado tipo="area" style={inputStyle} value={form.ID_AREA_COMUM} onChange={(v) => setForm({ ...form, ID_AREA_COMUM: v })} />
        </div>

        <div className="flex-1" style={{ minWidth: "140px" }}>
          <label style={labelStyle} className="block mb-1.5">Data *</label>
          <input required type="date" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}
            value={form.DATA_RESERVA} onChange={(e) => setForm({ ...form, DATA_RESERVA: e.target.value })} />
        </div>

        <div className="flex-1" style={{ minWidth: "120px" }}>
          <label style={labelStyle} className="block mb-1.5">Hora Início *</label>
          <input required type="time" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}
            value={form.HR_INICIO} onChange={(e) => setForm({ ...form, HR_INICIO: e.target.value })} />
        </div>

        <div className="flex-1" style={{ minWidth: "120px" }}>
          <label style={labelStyle} className="block mb-1.5">Hora Fim *</label>
          <input required type="time" className="w-full px-4 py-2.5 rounded-lg text-sm outline-none" style={inputStyle}
            value={form.HR_FIM} onChange={(e) => setForm({ ...form, HR_FIM: e.target.value })} />
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
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}># Reserva</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>Local</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>Morador</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider" style={{ color: "hsl(var(--primary))" }}>Data / Horário</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-right" style={{ color: "hsl(var(--primary))" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Nenhuma reserva encontrada.</td></tr>
            ) : (
              items.map((row) => (
                <tr key={row.ID_RESERVA} className="group border-b hover:bg-[hsl(var(--secondary))]" style={{ borderColor: "hsl(var(--border))" }}>
                  <td className="px-5 py-3.5 font-bold text-[hsl(var(--muted-foreground))]">#{row.ID_RESERVA}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold" style={{ background: "hsl(142,71%,45%,0.15)", color: "hsl(142,71%,70%)" }}>
                      Área {row.ID_AREA_COMUM}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold" style={{ background: "hsl(217,91%,60%,0.15)", color: "hsl(217,91%,70%)" }}>
                      Morador {row.ID_MORADOR}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-[hsl(var(--foreground))]">
                      {new Date(row.DATA_RESERVA).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="ml-2 text-[11px] font-semibold text-[hsl(var(--muted-foreground))] uppercase">
                      {row.HR_INICIO} – {row.HR_FIM}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(row)} className="p-2 rounded-lg text-[hsl(263,70%,68%)]" title="Editar">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(row.ID_RESERVA)} className="p-2 rounded-lg text-[hsl(0,84%,65%)]" title="Excluir">
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