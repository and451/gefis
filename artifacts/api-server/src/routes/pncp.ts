import { Router } from "express";
import { db, contratosTable, fornecedoresTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  BuscarPncpQueryParams,
  BuscarOrgaoPncpParams,
  ImportarPncpBody,
} from "@workspace/api-zod";

const router = Router();

const PNCP_BASE = "https://pncp.gov.br/api/consulta/v1";
const PNCP_ORGAO_BASE = "https://pncp.gov.br/api/pncp/v1";

router.get("/buscar", async (req, res) => {
  const query = BuscarPncpQueryParams.safeParse(req.query);
  if (!query.success) return res.status(400).json({ error: "Parâmetros inválidos", details: query.error.issues });

  const { cnpj, dataInicial, dataFinal, pagina = 1, tamanhoPagina = 10 } = query.data;

  const url = new URL(`${PNCP_BASE}/contratos`);
  url.searchParams.set("dataInicial", dataInicial);
  url.searchParams.set("dataFinal", dataFinal);
  url.searchParams.set("pagina", String(pagina));
  url.searchParams.set("tamanhoPagina", String(tamanhoPagina));
  if (cnpj) {
    url.searchParams.set("cnpjOrgao", cnpj.replace(/\D/g, ""));
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "SysCont/1.0 (Agencia Espacial Brasileira)",
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      req.log.warn({ status: response.status, url: url.toString(), errorText }, "PNCP retornou erro HTTP");
      return res.status(response.status).json({ error: "Erro na consulta ao PNCP", detail: errorText });
    }

    const data = await response.json() as {
      data: unknown[];
      totalRegistros: number;
      totalPaginas: number;
      numeroPagina: number;
    };

    return res.json({
      data: data.data ?? [],
      totalRegistros: data.totalRegistros ?? 0,
      totalPaginas: data.totalPaginas ?? 0,
      numeroPagina: data.numeroPagina ?? pagina,
    });
  } catch (err: any) {
    req.log.error({ err, url: url.toString() }, "Erro ao consultar PNCP");
    if (err.name === "TimeoutError") {
      return res.status(504).json({ error: "Tempo de consulta ao PNCP excedido. Tente novamente mais tarde." });
    }
    return res.status(502).json({ error: "Falha na comunicação com o PNCP", detail: err.message });
  }
});

router.get("/orgao/:cnpj", async (req, res) => {
  const params = BuscarOrgaoPncpParams.safeParse({ cnpj: req.params.cnpj });
  if (!params.success) return res.status(400).json({ error: "CNPJ inválido" });

  try {
    const response = await fetch(`${PNCP_ORGAO_BASE}/orgaos/${params.data.cnpj}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Órgão não encontrado no PNCP" });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    req.log.error({ err }, "Erro ao buscar órgão no PNCP");
    return res.status(502).json({ error: "Falha na comunicação com o PNCP" });
  }
});

router.post("/importar", async (req, res) => {
  const body = ImportarPncpBody.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Dados inválidos" });

  const { numeroControlePNCP, fornecedorId } = body.data;

  const [cnpjOrgao, tipoStr, seqAno] = numeroControlePNCP.split("-");
  if (!cnpjOrgao || !seqAno) {
    return res.status(400).json({ error: "Formato inválido de número de controle PNCP" });
  }

  const [seqStr, anoStr] = seqAno.split("/");
  const ano = anoStr ?? new Date().getFullYear().toString();

  const url = `${PNCP_BASE}/orgaos/${cnpjOrgao}/compras/${ano}/${seqStr}/contratos`;

  let pncpContrato: Record<string, unknown> | null = null;

  try {
    const listUrl = new URL(`${PNCP_BASE}/contratos`);
    listUrl.searchParams.set("dataInicial", `${ano}0101`);
    listUrl.searchParams.set("dataFinal", `${ano}1231`);
    listUrl.searchParams.set("pagina", "1");
    listUrl.searchParams.set("tamanhoPagina", "50");

    const response = await fetch(listUrl.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });

    if (response.ok) {
      const data = await response.json() as { data: Array<Record<string, unknown>> };
      pncpContrato = data.data?.find((c) => c["numeroControlePNCP"] === numeroControlePNCP) ?? null;
    }
  } catch (err) {
    req.log.warn({ err }, "Erro ao buscar contrato no PNCP para importação");
  }

  let resolvedFornecedorId = fornecedorId ?? null;

  if (!resolvedFornecedorId && pncpContrato) {
    const niFornecedor = pncpContrato["niFornecedor"] as string | undefined;
    const nomeFornecedor = pncpContrato["nomeRazaoSocialFornecedor"] as string | undefined;
    const tipoPessoa = (pncpContrato["tipoPessoa"] as string | undefined) ?? "PJ";

    if (niFornecedor && nomeFornecedor) {
      const [existingFornecedor] = await db
        .select()
        .from(fornecedoresTable)
        .where(eq(fornecedoresTable.cnpjCpf, niFornecedor));

      if (existingFornecedor) {
        resolvedFornecedorId = existingFornecedor.id;
      } else {
        const [newFornecedor] = await db
          .insert(fornecedoresTable)
          .values({ nome: nomeFornecedor, cnpjCpf: niFornecedor, tipoPessoa })
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

  const valorInicial = pncpContrato
    ? Number(pncpContrato["valorInicial"] ?? pncpContrato["valorGlobal"] ?? 0)
    : 0;
  const dataAssinatura = pncpContrato
    ? String(pncpContrato["dataAssinatura"] ?? new Date().toISOString().split("T")[0]).split("T")[0]
    : new Date().toISOString().split("T")[0];
  const dataVigenciaInicio = pncpContrato
    ? String(pncpContrato["dataVigenciaInicio"] ?? dataAssinatura).split("T")[0]
    : dataAssinatura;
  const dataVigenciaFim = pncpContrato
    ? String(pncpContrato["dataVigenciaFim"] ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()).split("T")[0]
    : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const objeto = pncpContrato
    ? String(pncpContrato["objetoContrato"] ?? "Importado do PNCP")
    : "Importado do PNCP";

  const categoriaProcesso = pncpContrato
    ? (pncpContrato["categoriaProcesso"] as { nome?: string } | undefined)?.nome ?? null
    : null;

  const processo = pncpContrato ? String(pncpContrato["processo"] ?? "") || null : null;

  const [created] = await db.insert(contratosTable).values({
    numeroContrato: seqStr ?? numeroControlePNCP,
    numeroControlePncp: numeroControlePNCP,
    objeto,
    fornecedorId: resolvedFornecedorId,
    valorInicial: String(valorInicial),
    valorAtual: String(valorInicial),
    dataAssinatura,
    dataVigenciaInicio,
    dataVigenciaFim,
    status: "vigente",
    modalidade: "outros",
    categoriaProcesso,
    processo,
  }).returning();

  const [fornecedor] = await db.select().from(fornecedoresTable).where(eq(fornecedoresTable.id, resolvedFornecedorId));

  return res.status(201).json({ ...created, fornecedor: fornecedor ?? null, aditivos: [], alertas: [] });
});

export default router;
