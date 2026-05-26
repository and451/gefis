import { Router } from "express";
import { db, contratosTable, fornecedoresTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const COMPRASNET_BASE = "https://contratos.comprasnet.gov.br/api";
const AEB_UNIDADE_CODIGO = "203001";

interface ComprasnetFornecedor {
  tipo?: string;
  cnpj_cpf_idgener?: string;
  nome?: string;
}

interface ComprasnetContrato {
  id: number;
  numero: string;
  objeto: string;
  processo?: string;
  fornecedor?: ComprasnetFornecedor;
  situacao?: string;
  modalidade?: string;
  categoria?: string;
  data_assinatura?: string;
  vigencia_inicio?: string;
  vigencia_fim?: string;
  valor_inicial?: string;
  valor_global?: string;
  num_parcelas?: number;
}

function parseValor(valor: string | undefined | null): number {
  if (!valor) return 0;
  return parseFloat(valor.replace(/\./g, "").replace(",", ".")) || 0;
}

router.get("/buscar", async (req, res) => {
  const unidadeCodigo = (req.query.unidadeCodigo as string) || AEB_UNIDADE_CODIGO;
  const busca = (req.query.busca as string | undefined)?.toLowerCase();

  try {
    const response = await fetch(`${COMPRASNET_BASE}/contrato/ug/${unidadeCodigo}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: "Erro na consulta ao ComprasNet",
        detail: errorText,
      });
    }

    const raw = (await response.json()) as ComprasnetContrato[];

    let contratos = raw.map((c) => ({
      id: c.id,
      numero: c.numero,
      objeto: c.objeto,
      processo: c.processo ?? null,
      fornecedor: c.fornecedor
        ? {
            nome: c.fornecedor.nome ?? "",
            cnpj_cpf_idgener: c.fornecedor.cnpj_cpf_idgener ?? null,
            tipo: c.fornecedor.tipo ?? null,
          }
        : { nome: "", cnpj_cpf_idgener: null, tipo: null },
      situacao: c.situacao ?? null,
      modalidade: c.modalidade ?? null,
      categoria: c.categoria ?? null,
      data_assinatura: c.data_assinatura ?? null,
      vigencia_inicio: c.vigencia_inicio ?? null,
      vigencia_fim: c.vigencia_fim ?? null,
      valor_inicial: c.valor_inicial ?? null,
      valor_global: c.valor_global ?? null,
      num_parcelas: c.num_parcelas ?? null,
    }));

    if (busca) {
      contratos = contratos.filter(
        (c) =>
          c.objeto.toLowerCase().includes(busca) ||
          c.fornecedor.nome.toLowerCase().includes(busca) ||
          (c.numero && c.numero.toLowerCase().includes(busca)) ||
          (c.processo && c.processo.toLowerCase().includes(busca))
      );
    }

    contratos.sort((a, b) => {
      const va = parseValor(a.valor_global);
      const vb = parseValor(b.valor_global);
      return vb - va;
    });

    return res.json({ data: contratos, total: contratos.length });
  } catch (err) {
    req.log.error({ err }, "Erro ao consultar ComprasNet");
    return res.status(502).json({ error: "Falha na comunicação com o ComprasNet" });
  }
});

router.post("/importar", async (req, res) => {
  const { contratoId, fornecedorId: providedFornecedorId } = req.body as {
    contratoId?: number;
    fornecedorId?: number | null;
  };

  if (!contratoId || typeof contratoId !== "number") {
    return res.status(400).json({ error: "contratoId é obrigatório" });
  }

  let comprasnetContrato: ComprasnetContrato | null = null;

  try {
    const response = await fetch(`${COMPRASNET_BASE}/contrato/id/${contratoId}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });

    if (response.ok) {
      comprasnetContrato = (await response.json()) as ComprasnetContrato;
    }
  } catch (err) {
    req.log.warn({ err }, "Erro ao buscar contrato no ComprasNet para importação");
  }

  if (!comprasnetContrato) {
    return res.status(404).json({ error: "Contrato não encontrado no ComprasNet" });
  }

  let resolvedFornecedorId = providedFornecedorId ?? null;

  if (!resolvedFornecedorId && comprasnetContrato.fornecedor?.nome) {
    const { nome, cnpj_cpf_idgener } = comprasnetContrato.fornecedor;
    const cnpjLimpo = cnpj_cpf_idgener?.replace(/\D/g, "") ?? "";

    if (cnpjLimpo) {
      const [existing] = await db
        .select()
        .from(fornecedoresTable)
        .where(eq(fornecedoresTable.cnpjCpf, cnpjLimpo));

      if (existing) {
        resolvedFornecedorId = existing.id;
      } else {
        const tipo = comprasnetContrato.fornecedor.tipo === "FISICA" ? "PF" : "PJ";
        const [newFornecedor] = await db
          .insert(fornecedoresTable)
          .values({ nome, cnpjCpf: cnpjLimpo, tipoPessoa: tipo })
          .returning();
        resolvedFornecedorId = newFornecedor.id;
      }
    }
  }

  if (!resolvedFornecedorId) {
    const [defaultFornecedor] = await db.select().from(fornecedoresTable).limit(1);
    if (defaultFornecedor) resolvedFornecedorId = defaultFornecedor.id;
    else return res.status(400).json({ error: "Nenhum fornecedor disponível. Cadastre um fornecedor primeiro." });
  }

  const valorInicial = parseValor(comprasnetContrato.valor_inicial ?? comprasnetContrato.valor_global);
  const valorAtual = parseValor(comprasnetContrato.valor_global ?? comprasnetContrato.valor_inicial);
  const dataAssinatura = comprasnetContrato.data_assinatura ?? new Date().toISOString().split("T")[0];
  const dataVigenciaInicio = comprasnetContrato.vigencia_inicio ?? dataAssinatura;
  const dataVigenciaFim = comprasnetContrato.vigencia_fim
    ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const modalidadeMap: Record<string, string> = {
    "Pregão": "pregao_eletronico",
    "Concorrência": "concorrencia",
    "Dispensa": "dispensa",
    "Inexigibilidade": "inexigibilidade",
    "Adesão": "outros",
    "Tomada de Preços": "tomada_precos",
    "Convite": "convite",
  };

  const modalidade = modalidadeMap[comprasnetContrato.modalidade ?? ""] ?? "outros";

  const [created] = await db
    .insert(contratosTable)
    .values({
      numeroContrato: comprasnetContrato.numero || String(contratoId),
      objeto: comprasnetContrato.objeto,
      fornecedorId: resolvedFornecedorId,
      valorInicial: String(valorInicial),
      valorAtual: String(valorAtual),
      dataAssinatura,
      dataVigenciaInicio,
      dataVigenciaFim,
      status: "vigente",
      modalidade,
      categoriaProcesso: comprasnetContrato.categoria ?? null,
      processo: comprasnetContrato.processo ?? null,
      numeroParcelas: comprasnetContrato.num_parcelas ?? null,
      observacoes: `Importado do ComprasNet. ID: ${contratoId}`,
    })
    .returning();

  const [fornecedor] = await db
    .select()
    .from(fornecedoresTable)
    .where(eq(fornecedoresTable.id, resolvedFornecedorId));

  return res.status(201).json({ ...created, fornecedor: fornecedor ?? null, aditivos: [], alertas: [] });
});

export default router;
