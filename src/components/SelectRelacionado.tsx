"use client";
import { useEffect, useState } from "react";
import api from "@/services/api";

type Tipo = "pessoa" | "unidade" | "morador" | "fornecedor" | "area";

interface Opcao {
  id: number;
  label: string;
}

interface SelectRelacionadoProps {
  tipo: Tipo;
  value: string | number;
  onChange: (valor: string) => void;
  style?: React.CSSProperties;
  required?: boolean;
}

// Monta a lista de opções (id + nome legível) de cada entidade relacionada
async function carregarOpcoes(tipo: Tipo): Promise<Opcao[]> {
  if (tipo === "pessoa") {
    const res = await api.get("/pessoas");
    return res.data.map((p: any) => ({ id: p.ID_PESSOA, label: `${p.NOME} (${p.CPF_CNPJ})` }));
  }
  if (tipo === "unidade") {
    const res = await api.get("/unidades");
    return res.data.map((u: any) => ({ id: u.ID_UNIDADE, label: `${u.NUM_UNIDADE}${u.BLOCO ? ` - Bloco ${u.BLOCO}` : ""}` }));
  }
  if (tipo === "area") {
    const res = await api.get("/areas-comuns");
    return res.data.map((a: any) => ({ id: a.ID_AREA_COMUM, label: a.NOME }));
  }
  // morador e fornecedor só guardam o ID da pessoa, então o nome vem de /pessoas
  const [lista, pessoas] = await Promise.all([
    api.get(tipo === "morador" ? "/moradores" : "/fornecedores"),
    api.get("/pessoas"),
  ]);
  const nomes = new Map<number, string>(pessoas.data.map((p: any) => [p.ID_PESSOA, p.NOME]));
  return lista.data.map((item: any) => {
    const id = tipo === "morador" ? item.ID_MORADOR : item.ID_FORNECEDOR;
    return { id, label: `${nomes.get(item.ID_PESSOA) ?? "Sem nome"} (#${id})` };
  });
}

export default function SelectRelacionado({ tipo, value, onChange, style, required = true }: SelectRelacionadoProps) {
  const [opcoes, setOpcoes] = useState<Opcao[]>([]);

  useEffect(() => {
    carregarOpcoes(tipo).then(setOpcoes).catch(() => setOpcoes([]));
  }, [tipo]);

  return (
    <select
      required={required}
      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
      style={style}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Selecione...</option>
      {opcoes.map((o) => (
        <option key={o.id} value={o.id}>{o.label}</option>
      ))}
    </select>
  );
}
