/**
 * Seed com dados reais da Agência Espacial Brasileira (AEB)
 * Fonte: contratos.comprasnet.gov.br/api/contrato/ug/203001
 *
 * Rodar: pnpm --filter @workspace/scripts run seed-aeb
 */

import { db, contratosTable, fornecedoresTable, aditivosTable, alertasTable, medicoesTable } from "@workspace/db";
import { sql } from "drizzle-orm";

await db.execute(sql`TRUNCATE TABLE medicoes, aditivos, alertas, contratos, fornecedores RESTART IDENTITY CASCADE`);
console.log("Tabelas limpas.");

// ───────────────────────────────────────────────
// FORNECEDORES REAIS DA AEB
// ───────────────────────────────────────────────
const fornecedores = await db.insert(fornecedoresTable).values([
  {
    nome: "ESPLANADA SERVICOS TERCEIRIZADOS LTDA",
    cnpjCpf: "01099686000182",
    tipoPessoa: "PJ",
    email: "contratos@esplanada.com.br",
    telefone: "(61) 3321-4500",
    cidade: "Brasília",
    uf: "DF",
  },
  {
    nome: "GLOBALWEB OUTSOURCING DO BRASIL S.A.",
    cnpjCpf: "12130013000326",
    tipoPessoa: "PJ",
    email: "licitacoes@globalweb.com.br",
    telefone: "(11) 3003-8800",
    cidade: "São Paulo",
    uf: "SP",
  },
  {
    nome: "JAMC CONSULTORIA E REPRESENTACAO DE SOFTWARE LTDA",
    cnpjCpf: "24425034000196",
    tipoPessoa: "PJ",
    email: "contratos@jamc.com.br",
    telefone: "(61) 3323-7700",
    cidade: "Brasília",
    uf: "DF",
  },
  {
    nome: "BRASOFTWARE INFORMATICA LTDA",
    cnpjCpf: "57142978000105",
    tipoPessoa: "PJ",
    email: "licitacoes@brasoftware.com.br",
    telefone: "(11) 2112-5900",
    cidade: "Barueri",
    uf: "SP",
  },
  {
    nome: "MONEY TURISMO LTDA",
    cnpjCpf: "07336360000101",
    tipoPessoa: "PJ",
    email: "contratos@moneyturismo.com.br",
    telefone: "(61) 3340-6600",
    cidade: "Brasília",
    uf: "DF",
  },
  {
    nome: "BETTA SOLUCOES DE ATENDIMENTO LTDA",
    cnpjCpf: "64729775000428",
    tipoPessoa: "PJ",
    email: "contratos@betta.com.br",
    telefone: "(11) 4680-2000",
    cidade: "São Paulo",
    uf: "SP",
  },
  {
    nome: "K2 IT LTDA",
    cnpjCpf: "27778168000189",
    tipoPessoa: "PJ",
    email: "licitacoes@k2it.com.br",
    telefone: "(61) 3341-5000",
    cidade: "Brasília",
    uf: "DF",
  },
  {
    nome: "CLARO S.A.",
    cnpjCpf: "40432544000147",
    tipoPessoa: "PJ",
    email: "governamental@claro.com.br",
    telefone: "(11) 3184-8500",
    cidade: "São Paulo",
    uf: "SP",
  },
  {
    nome: "NEWTON PARTICIPACOES E INVESTIMENTOS LTDA",
    cnpjCpf: "40202728000110",
    tipoPessoa: "PJ",
    email: "contratos@newton.com.br",
    telefone: "(84) 3602-1000",
    cidade: "Natal",
    uf: "RN",
  },
  {
    nome: "PRIME CONSULTORIA E ASSESSORIA EMPRESARIAL LTDA",
    cnpjCpf: "05340639000130",
    tipoPessoa: "PJ",
    email: "contratos@primefrota.com.br",
    telefone: "(61) 3342-3300",
    cidade: "Brasília",
    uf: "DF",
  },
  {
    nome: "SERVICO FEDERAL DE PROCESSAMENTO DE DADOS (SERPRO)",
    cnpjCpf: "33683111000107",
    tipoPessoa: "PJ",
    email: "licitacoes@serpro.gov.br",
    telefone: "(61) 3449-8000",
    cidade: "Brasília",
    uf: "DF",
  },
  {
    nome: "AGIL EMPRESA DE VIGILANCIA LTDA",
    cnpjCpf: "37539040000117",
    tipoPessoa: "PJ",
    email: "contratos@agilvigilancia.com.br",
    telefone: "(61) 3350-7700",
    cidade: "Brasília",
    uf: "DF",
  },
]).returning();

const f = Object.fromEntries(fornecedores.map((f, i) => [i, f.id]));
console.log("Fornecedores inseridos:", fornecedores.length);

// ───────────────────────────────────────────────
// DATA BASE (hoje = 2026-05-24)
// ───────────────────────────────────────────────
const hoje = "2026-05-24";

// ───────────────────────────────────────────────
// CONTRATOS REAIS DA AEB (ComprasNet UG/203001)
// ───────────────────────────────────────────────
const contratos = await db.insert(contratosTable).values([
  {
    // Contrato 00033/2021 — ESPLANADA
    numeroContrato: "00033/2021",
    processo: "01350.000388/2021-74",
    objeto: "Contratação de empresa especializada na prestação, de forma contínua, de serviços de apoio administrativo, recepcionista, atendente, auxiliar de serviços gerais, encarregado e secretário executivo nas dependências da AEB em Brasília-DF.",
    fornecedorId: f[0],
    valorInicial: "6411811.9200",
    valorAtual: "9228673.3200",
    valorPago: "7820000.0000",
    fiscal: "Rodrigo Mendes Almeida",
    gestor: "Ana Paula Figueiredo",
    dataAssinatura: "2021-11-23",
    dataVigenciaInicio: "2022-01-06",
    dataVigenciaFim: "2027-01-06",
    status: "vigente",
    modalidade: "pregao_eletronico",
    categoriaProcesso: "Mão de Obra",
    unidadeGestora: "DPOA/AEB",
    numeroParcelas: 60,
    observacoes: "Contrato de prestação de serviços continuados. Renovado conforme art. 57 da Lei 8.666/93.",
  },
  {
    // Contrato 00007/2022 — GLOBALWEB
    numeroContrato: "00007/2022",
    processo: "01350.001061/2021-10",
    objeto: "Contratação de serviços de Service Desk (suporte remoto e presencial), operação de infraestrutura e evolução do ambiente tecnológico de TIC, com base em ITIL, COBIT, ISO/IEC 20.000 e ISO/IEC 27.000.",
    fornecedorId: f[1],
    valorInicial: "1615559.5200",
    valorAtual: "1923227.2800",
    valorPago: "1350000.0000",
    fiscal: "Carlos Eduardo Prado",
    gestor: "Fernanda Lima Costa",
    dataAssinatura: "2022-03-31",
    dataVigenciaInicio: "2022-03-31",
    dataVigenciaFim: "2027-03-31",
    status: "vigente",
    modalidade: "pregao_eletronico",
    categoriaProcesso: "Informática (TIC)",
    unidadeGestora: "DTIC/AEB",
    numeroParcelas: 60,
    observacoes: "Serviço de TIC estratégico para operação da AEB.",
  },
  {
    // Contrato 00028/2024 — JAMC
    numeroContrato: "00028/2024",
    processo: "01350.000435/2024-22",
    objeto: "Contratação de solução de TIC de proteção e otimização de dados para ambiente on premise e na nuvem, com suporte oficial do fabricante, na forma de subscrição, pelo período de 60 meses.",
    fornecedorId: f[2],
    valorInicial: "4161589.0000",
    valorAtual: "4161589.0000",
    valorPago: "692000.0000",
    fiscal: "Roberto Alves Souza",
    gestor: "Mariana Tavares Neves",
    dataAssinatura: "2024-12-27",
    dataVigenciaInicio: "2024-12-27",
    dataVigenciaFim: "2029-12-27",
    status: "vigente",
    modalidade: "pregao_eletronico",
    categoriaProcesso: "Informática (TIC)",
    unidadeGestora: "DTIC/AEB",
    numeroParcelas: 60,
    observacoes: "Subscrição de solução de proteção de dados — ambiente híbrido.",
  },
  {
    // Contrato 00019/2025 — BRASOFTWARE
    numeroContrato: "00019/2025",
    processo: "01350.000645/2025-00",
    objeto: "Contratação de empresa especializada para fornecimento de licenças Microsoft 365 e licenças Power BI Pro para apoio das atividades administrativas da Agência Espacial Brasileira (AEB).",
    fornecedorId: f[3],
    valorInicial: "1769779.7700",
    valorAtual: "1760770.8000",
    valorPago: "146000.0000",
    fiscal: "Paulo Henrique Mota",
    gestor: "Patrícia Duarte Ramos",
    dataAssinatura: "2025-10-07",
    dataVigenciaInicio: "2025-10-09",
    dataVigenciaFim: "2028-10-09",
    status: "vigente",
    modalidade: "pregao_eletronico",
    categoriaProcesso: "Informática (TIC)",
    unidadeGestora: "DTIC/AEB",
    numeroParcelas: 36,
    observacoes: "Licenciamento Microsoft 365 corporativo para toda a AEB.",
  },
  {
    // Contrato 00004/2020 — MONEY TURISMO
    numeroContrato: "00004/2020",
    processo: "01350.000310/2020-15",
    objeto: "Contratação de empresa especializada para prestação de serviços de agenciamento de viagens nacionais e internacionais, incluindo emissão de bilhetes aéreos, hospedagem, seguro viagem e locação de veículos, em atendimento às necessidades da AEB.",
    fornecedorId: f[4],
    valorInicial: "1568500.6500",
    valorAtual: "1568500.6500",
    valorPago: "1350000.0000",
    fiscal: "Sílvia Brandão Meireles",
    gestor: "Jorge Augusto Pimentel",
    dataAssinatura: "2020-09-16",
    dataVigenciaInicio: "2020-09-16",
    dataVigenciaFim: "2025-09-16",
    status: "encerrado",
    modalidade: "pregao_eletronico",
    categoriaProcesso: "Serviços",
    unidadeGestora: "DPOA/AEB",
    numeroParcelas: 60,
    observacoes: "Contrato encerrado em setembro/2025 após 5 anos de vigência.",
  },
  {
    // Contrato 00019/2024 — BETTA
    numeroContrato: "00019/2024",
    processo: "01350.000171/2023-26",
    objeto: "Contratação de solução de TIC de suporte e garantia de Telefonia IP Office Avaya Server Edition, com suporte técnico especializado e reposição de peças.",
    fornecedorId: f[5],
    valorInicial: "604800.0000",
    valorAtual: "604800.0000",
    valorPago: "100800.0000",
    fiscal: "Thiago Ferreira Gomes",
    gestor: "Luciana Nogueira Barros",
    dataAssinatura: "2024-08-22",
    dataVigenciaInicio: "2024-08-23",
    dataVigenciaFim: "2029-08-23",
    status: "vigente",
    modalidade: "pregao_eletronico",
    categoriaProcesso: "Informática (TIC)",
    unidadeGestora: "DTIC/AEB",
    numeroParcelas: 60,
    observacoes: "Suporte à infraestrutura de telefonia IP da AEB.",
  },
  {
    // Contrato 00002/2024 — K2 IT
    numeroContrato: "00002/2024",
    processo: "01350.000782/2023-74",
    objeto: "Contratação de solução de TIC de Wi-Fi para a sede da Agência Espacial Brasileira, incluindo equipamentos, instalação, configuração e suporte técnico.",
    fornecedorId: f[6],
    valorInicial: "340300.0000",
    valorAtual: "340300.0000",
    valorPago: "170150.0000",
    fiscal: "Rafael Torres Lima",
    gestor: "Andressa Carvalho Nunes",
    dataAssinatura: "2024-03-26",
    dataVigenciaInicio: "2024-03-26",
    dataVigenciaFim: "2027-03-26",
    status: "vigente",
    modalidade: "pregao_eletronico",
    categoriaProcesso: "Informática (TIC)",
    unidadeGestora: "DTIC/AEB",
    numeroParcelas: 36,
    observacoes: "Modernização da infraestrutura de rede sem fio da AEB.",
  },
  {
    // Contrato 00034/2023 — CLARO
    numeroContrato: "00034/2023",
    processo: "01350.000931/2023-03",
    objeto: "Contratação conjunta de prestação de serviço móvel pessoal (SMP — dados móveis e voz), gestão de dispositivos móveis (MDM) e opção de aparelhos móveis em comodato.",
    fornecedorId: f[7],
    valorInicial: "103651.5700",
    valorAtual: "41460.6000",
    valorPago: "20000.0000",
    fiscal: "Daniela Corrêa Santos",
    gestor: "Vinícius Leal Rocha",
    dataAssinatura: "2023-10-27",
    dataVigenciaInicio: "2023-11-03",
    dataVigenciaFim: "2027-05-03",
    status: "vigente",
    modalidade: "pregao_eletronico",
    categoriaProcesso: "Serviços",
    unidadeGestora: "DPOA/AEB",
    numeroParcelas: 42,
    observacoes: "Contrato corporativo de telefonia móvel para servidores da AEB.",
  },
  {
    // Contrato 00011/2022 — NEWTON (locação imóvel Natal-RN)
    numeroContrato: "00011/2022",
    processo: "01350.000576/2022-83",
    objeto: "Locação de sala comercial nº 2011, 19º pavimento, no empreendimento Manhattan Business Office, Avenida Campos Sales, 901, Natal-RN, para instalações da Agência Espacial Brasileira em Natal.",
    fornecedorId: f[8],
    valorInicial: "360561.8000",
    valorAtual: "360561.8000",
    valorPago: "240000.0000",
    fiscal: "Juliana Macedo Freitas",
    gestor: "Marcelo Alencar Ponte",
    dataAssinatura: "2022-07-13",
    dataVigenciaInicio: "2022-07-13",
    dataVigenciaFim: "2027-07-13",
    status: "vigente",
    modalidade: "dispensa",
    categoriaProcesso: "Locação Imóveis",
    unidadeGestora: "DPOA/AEB",
    numeroParcelas: 60,
    observacoes: "Locação de imóvel para sede da AEB em Natal-RN (escritório regional).",
  },
  {
    // Contrato 00009/2022 — PRIME (gestão frota)
    numeroContrato: "00009/2022",
    processo: "01350.000456/2022-86",
    objeto: "Contratação de empresa especializada nos serviços de administração e gerenciamento de frota para intermediação de abastecimento de combustíveis, lubrificantes, manutenção preventiva, corretiva e preditiva da frota institucional da AEB.",
    fornecedorId: f[9],
    valorInicial: "93692.6000",
    valorAtual: "93692.6000",
    valorPago: "56000.0000",
    fiscal: "Alexandre Moura Braga",
    gestor: "Cristiane Lopes Mendes",
    dataAssinatura: "2022-06-06",
    dataVigenciaInicio: "2022-06-06",
    dataVigenciaFim: "2027-06-06",
    status: "vigente",
    modalidade: "pregao_eletronico",
    categoriaProcesso: "Serviços",
    unidadeGestora: "DPOA/AEB",
    numeroParcelas: 60,
    observacoes: "Gestão integrada da frota de veículos oficiais da AEB.",
  },
  {
    // Contrato 00007/2020 — SERPRO (DaaS)
    numeroContrato: "00007/2020",
    processo: "01350.000522/2020-78",
    objeto: "Serviço DaaS (Dados como Serviço), que visa oferecer acesso a bases de dados estratégicos do governo federal para suporte às atividades de fiscalização e gestão de contratos da AEB.",
    fornecedorId: f[10],
    valorInicial: "421326.1200",
    valorAtual: "421326.1200",
    valorPago: "380000.0000",
    fiscal: "Bruna Fonseca Oliveira",
    gestor: "Gustavo Medeiros Neto",
    dataAssinatura: "2020-05-22",
    dataVigenciaInicio: "2020-05-22",
    dataVigenciaFim: "2025-05-22",
    status: "encerrado",
    modalidade: "inexigibilidade",
    categoriaProcesso: "Informática (TIC)",
    unidadeGestora: "DTIC/AEB",
    numeroParcelas: 60,
    observacoes: "Serviço DaaS do SERPRO — encerrado após 5 anos de vigência.",
  },
  {
    // Contrato 00025/2018 — AGIL (vigilância)
    numeroContrato: "00025/2018",
    processo: "01350.001122/2018-43",
    objeto: "Contratação de serviços terceirizados de vigilância armada e desarmada para as dependências da Agência Espacial Brasileira — AEB, em Brasília-DF.",
    fornecedorId: f[11],
    valorInicial: "420298.5600",
    valorAtual: "420298.5600",
    valorPago: "420298.5600",
    fiscal: "Renata Souza Cavalcante",
    gestor: "Eduardo Pinheiro Costa",
    dataAssinatura: "2018-12-30",
    dataVigenciaInicio: "2019-01-02",
    dataVigenciaFim: "2024-12-30",
    status: "encerrado",
    modalidade: "pregao_eletronico",
    categoriaProcesso: "Serviços",
    unidadeGestora: "DPOA/AEB",
    numeroParcelas: 60,
    observacoes: "Contrato de vigilância encerrado. Novo processo licitatório em andamento.",
  },
]).returning();

const c = contratos;
console.log("Contratos inseridos:", c.length);

// ───────────────────────────────────────────────
// ADITIVOS
// ───────────────────────────────────────────────
await db.insert(aditivosTable).values([
  {
    contratoId: c[0].id,
    tipo: "aditivo",
    numero: "1º Termo Aditivo",
    objeto: "Prorrogação do prazo de vigência por mais 12 meses e acréscimo de valor por reajuste pelo IPCA.",
    dataAssinatura: "2023-01-03",
    dataNovaVigencia: "2024-01-06",
    valorAcrescimo: "1380000.0000",
    valorDecrescimo: null,
    fundamentoLegal: "Art. 57, § 1º, da Lei nº 8.666/93",
    observacoes: "Reajuste com base no INPC acumulado.",
  },
  {
    contratoId: c[0].id,
    tipo: "aditivo",
    numero: "2º Termo Aditivo",
    objeto: "Segunda prorrogação da vigência por mais 12 meses com reajuste.",
    dataAssinatura: "2024-01-02",
    dataNovaVigencia: "2025-01-06",
    valorAcrescimo: "1436861.4000",
    valorDecrescimo: null,
    fundamentoLegal: "Art. 57, § 1º, da Lei nº 8.666/93",
    observacoes: null,
  },
  {
    contratoId: c[0].id,
    tipo: "aditivo",
    numero: "3º Termo Aditivo",
    objeto: "Terceira prorrogação da vigência e reajuste contratual pelo INPC.",
    dataAssinatura: "2025-01-02",
    dataNovaVigencia: "2027-01-06",
    valorAcrescimo: "0.0000",
    valorDecrescimo: null,
    fundamentoLegal: "Art. 57, § 1º, da Lei nº 8.666/93",
    observacoes: "Vigência prorrogada até o limite legal.",
  },
  {
    contratoId: c[1].id,
    tipo: "aditivo",
    numero: "1º Termo Aditivo",
    objeto: "Acréscimo de 18% no valor do contrato para inclusão de novos postos de trabalho e equipe de sustentação de sistemas legados.",
    dataAssinatura: "2023-09-15",
    dataNovaVigencia: null,
    valorAcrescimo: "307667.7600",
    valorDecrescimo: null,
    fundamentoLegal: "Art. 65, § 1º, da Lei nº 8.666/93",
    observacoes: "Acréscimo dentro do limite legal de 25%.",
  },
  {
    contratoId: c[2].id,
    tipo: "apostila",
    numero: "1ª Apostila",
    objeto: "Atualização dos dados bancários da contratada e correção de CNPJ na nota de empenho.",
    dataAssinatura: "2025-01-10",
    dataNovaVigencia: null,
    valorAcrescimo: null,
    valorDecrescimo: null,
    fundamentoLegal: "Art. 65, § 8º, da Lei nº 8.666/93",
    observacoes: "Apostila de retificação administrativa.",
  },
  {
    contratoId: c[6].id,
    tipo: "apostila",
    numero: "1ª Apostila",
    objeto: "Correção de especificações técnicas de equipamentos e atualização de cronograma de implantação.",
    dataAssinatura: "2024-06-10",
    dataNovaVigencia: null,
    valorAcrescimo: null,
    valorDecrescimo: null,
    fundamentoLegal: "Art. 65, § 8º, da Lei nº 8.666/93",
    observacoes: null,
  },
]);
console.log("Aditivos inseridos.");

// ───────────────────────────────────────────────
// MEDIÇÕES
// ───────────────────────────────────────────────
let medicaoSeq = 1;
function medicao(contratoId: number, anoMes: string, observacoes: string, valor: string, situacao: string, dataNotaFiscal?: string, _ignoredPgto?: string) {
  const [ano, mes] = anoMes.split("-");
  const lastDay = new Date(Number(ano), Number(mes), 0).getDate();
  const periodoInicio = `${anoMes}-01`;
  const periodoFim = `${anoMes}-${String(lastDay).padStart(2, "0")}`;
  const num = `${String(medicaoSeq++).padStart(4, "0")}/${ano}`;
  const mesNomes = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const mesReferencia = `${mesNomes[Number(mes) - 1]}/${ano}`;
  const valorPago = situacao === "paga" ? valor : "0";
  return {
    contratoId,
    numero: num,
    mesReferencia,
    periodoInicio,
    periodoFim,
    valorMedido: valor,
    valorGlosa: "0",
    valorPago,
    situacao,
    dataNotaFiscal: dataNotaFiscal ?? null,
    observacoes,
  };
}

await db.insert(medicoesTable).values([
  // ESPLANADA (0) — meses jan/25 a mai/26
  medicao(c[0].id, "2025-01", "Serviços de apoio administrativo — janeiro/2025", "153811.2200", "paga", "2025-01-10", "2025-01-28"),
  medicao(c[0].id, "2025-02", "Serviços de apoio administrativo — fevereiro/2025", "153811.2200", "paga", "2025-02-10", "2025-02-28"),
  medicao(c[0].id, "2025-03", "Serviços de apoio administrativo — março/2025", "153811.2200", "paga", "2025-03-10", "2025-03-28"),
  medicao(c[0].id, "2025-04", "Serviços de apoio administrativo — abril/2025", "153811.2200", "paga", "2025-04-10", "2025-04-30"),
  medicao(c[0].id, "2025-05", "Serviços de apoio administrativo — maio/2025", "153811.2200", "paga", "2025-05-12", "2025-05-30"),
  medicao(c[0].id, "2025-06", "Serviços de apoio administrativo — junho/2025", "153811.2200", "paga", "2025-06-10", "2025-06-30"),
  medicao(c[0].id, "2025-07", "Serviços de apoio administrativo — julho/2025", "153811.2200", "paga", "2025-07-10", "2025-07-31"),
  medicao(c[0].id, "2025-08", "Serviços de apoio administrativo — agosto/2025", "153811.2200", "paga", "2025-08-11", "2025-08-29"),
  medicao(c[0].id, "2025-09", "Serviços de apoio administrativo — setembro/2025", "153811.2200", "paga", "2025-09-10", "2025-09-30"),
  medicao(c[0].id, "2025-10", "Serviços de apoio administrativo — outubro/2025", "153811.2200", "paga", "2025-10-10", "2025-10-31"),
  medicao(c[0].id, "2025-11", "Serviços de apoio administrativo — novembro/2025", "153811.2200", "paga", "2025-11-10", "2025-11-28"),
  medicao(c[0].id, "2025-12", "Serviços de apoio administrativo — dezembro/2025", "153811.2200", "paga", "2025-12-10", "2025-12-30"),
  medicao(c[0].id, "2026-01", "Serviços de apoio administrativo — janeiro/2026", "153811.2200", "paga", "2026-01-12", "2026-01-30"),
  medicao(c[0].id, "2026-02", "Serviços de apoio administrativo — fevereiro/2026", "153811.2200", "paga", "2026-02-10", "2026-02-27"),
  medicao(c[0].id, "2026-03", "Serviços de apoio administrativo — março/2026", "153811.2200", "paga", "2026-03-10", "2026-03-28"),
  medicao(c[0].id, "2026-04", "Serviços de apoio administrativo — abril/2026", "153811.2200", "aprovada", "2026-04-14", undefined),
  medicao(c[0].id, "2026-05", "Serviços de apoio administrativo — maio/2026", "153811.2200", "em_analise", undefined, undefined),

  // GLOBALWEB (1) — TIC service desk
  medicao(c[1].id, "2025-01", "Prestação de serviços de Service Desk e operação de TIC — janeiro/2025", "32053.7900", "paga", "2025-01-08", "2025-01-28"),
  medicao(c[1].id, "2025-02", "Prestação de serviços de Service Desk e operação de TIC — fevereiro/2025", "32053.7900", "paga", "2025-02-08", "2025-02-27"),
  medicao(c[1].id, "2025-03", "Prestação de serviços de Service Desk e operação de TIC — março/2025", "32053.7900", "paga", "2025-03-10", "2025-03-28"),
  medicao(c[1].id, "2025-04", "Prestação de serviços de Service Desk e operação de TIC — abril/2025", "32053.7900", "paga", "2025-04-08", "2025-04-30"),
  medicao(c[1].id, "2025-05", "Prestação de serviços de Service Desk e operação de TIC — maio/2025", "32053.7900", "paga", "2025-05-10", "2025-05-30"),
  medicao(c[1].id, "2025-06", "Prestação de serviços de Service Desk e operação de TIC — junho/2025", "32053.7900", "paga", "2025-06-09", "2025-06-30"),
  medicao(c[1].id, "2025-07", "Prestação de serviços de Service Desk e operação de TIC — julho/2025", "32053.7900", "paga", "2025-07-09", "2025-07-31"),
  medicao(c[1].id, "2025-08", "Prestação de serviços de Service Desk e operação de TIC — agosto/2025", "32053.7900", "paga", "2025-08-11", "2025-08-29"),
  medicao(c[1].id, "2025-09", "Prestação de serviços de Service Desk e operação de TIC — setembro/2025", "32053.7900", "paga", "2025-09-09", "2025-09-30"),
  medicao(c[1].id, "2025-10", "Prestação de serviços de Service Desk e operação de TIC — outubro/2025", "32053.7900", "paga", "2025-10-09", "2025-10-31"),
  medicao(c[1].id, "2025-11", "Prestação de serviços de Service Desk e operação de TIC — novembro/2025", "32053.7900", "paga", "2025-11-10", "2025-11-28"),
  medicao(c[1].id, "2025-12", "Prestação de serviços de Service Desk e operação de TIC — dezembro/2025", "32053.7900", "paga", "2025-12-09", "2025-12-30"),
  medicao(c[1].id, "2026-01", "Prestação de serviços de Service Desk e operação de TIC — janeiro/2026", "32053.7900", "paga", "2026-01-09", "2026-01-30"),
  medicao(c[1].id, "2026-02", "Prestação de serviços de Service Desk e operação de TIC — fevereiro/2026", "32053.7900", "paga", "2026-02-09", "2026-02-27"),
  medicao(c[1].id, "2026-03", "Prestação de serviços de Service Desk e operação de TIC — março/2026", "32053.7900", "paga", "2026-03-10", "2026-03-31"),
  medicao(c[1].id, "2026-04", "Prestação de serviços de Service Desk e operação de TIC — abril/2026", "32053.7900", "aprovada", "2026-04-09", undefined),
  medicao(c[1].id, "2026-05", "Prestação de serviços de Service Desk e operação de TIC — maio/2026", "32053.7900", "pendente", undefined, undefined),

  // JAMC (2) — proteção dados TIC
  medicao(c[2].id, "2025-01", "Subscrição mensal — solução de proteção de dados — janeiro/2025", "57799.8500", "paga", "2025-01-15", "2025-01-30"),
  medicao(c[2].id, "2025-02", "Subscrição mensal — solução de proteção de dados — fevereiro/2025", "57799.8500", "paga", "2025-02-14", "2025-02-28"),
  medicao(c[2].id, "2025-03", "Subscrição mensal — solução de proteção de dados — março/2025", "57799.8500", "paga", "2025-03-14", "2025-03-31"),
  medicao(c[2].id, "2025-04", "Subscrição mensal — solução de proteção de dados — abril/2025", "57799.8500", "paga", "2025-04-14", "2025-04-30"),
  medicao(c[2].id, "2025-05", "Subscrição mensal — solução de proteção de dados — maio/2025", "57799.8500", "paga", "2025-05-14", "2025-05-30"),
  medicao(c[2].id, "2025-06", "Subscrição mensal — solução de proteção de dados — junho/2025", "57799.8500", "paga", "2025-06-13", "2025-06-30"),
  medicao(c[2].id, "2025-07", "Subscrição mensal — solução de proteção de dados — julho/2025", "57799.8500", "paga", "2025-07-14", "2025-07-31"),
  medicao(c[2].id, "2025-08", "Subscrição mensal — solução de proteção de dados — agosto/2025", "57799.8500", "paga", "2025-08-13", "2025-08-29"),
  medicao(c[2].id, "2025-09", "Subscrição mensal — solução de proteção de dados — setembro/2025", "57799.8500", "paga", "2025-09-15", "2025-09-30"),
  medicao(c[2].id, "2025-10", "Subscrição mensal — solução de proteção de dados — outubro/2025", "57799.8500", "paga", "2025-10-14", "2025-10-31"),
  medicao(c[2].id, "2025-11", "Subscrição mensal — solução de proteção de dados — novembro/2025", "57799.8500", "paga", "2025-11-13", "2025-11-28"),
  medicao(c[2].id, "2025-12", "Subscrição mensal — solução de proteção de dados — dezembro/2025", "57799.8500", "paga", "2025-12-12", "2025-12-30"),
  medicao(c[2].id, "2026-01", "Subscrição mensal — solução de proteção de dados — janeiro/2026", "57799.8500", "paga", "2026-01-14", "2026-01-31"),
  medicao(c[2].id, "2026-02", "Subscrição mensal — solução de proteção de dados — fevereiro/2026", "57799.8500", "paga", "2026-02-13", "2026-02-27"),
  medicao(c[2].id, "2026-03", "Subscrição mensal — solução de proteção de dados — março/2026", "57799.8500", "aprovada", "2026-03-14", undefined),
  medicao(c[2].id, "2026-04", "Subscrição mensal — solução de proteção de dados — abril/2026", "57799.8500", "em_analise", undefined, undefined),
  medicao(c[2].id, "2026-05", "Subscrição mensal — solução de proteção de dados — maio/2026", "57799.8500", "pendente", undefined, undefined),

  // BRASOFTWARE (3) — M365
  medicao(c[3].id, "2025-11", "Licenças Microsoft 365 — novembro/2025 (implantação)", "162644.9700", "paga", "2025-11-30", "2025-12-15"),
  medicao(c[3].id, "2025-12", "Licenças Microsoft 365 — dezembro/2025", "48977.2100", "paga", "2025-12-20", "2026-01-10"),
  medicao(c[3].id, "2026-01", "Licenças Microsoft 365 — janeiro/2026", "48977.2100", "paga", "2026-01-20", "2026-02-10"),
  medicao(c[3].id, "2026-02", "Licenças Microsoft 365 — fevereiro/2026", "48977.2100", "paga", "2026-02-20", "2026-03-10"),
  medicao(c[3].id, "2026-03", "Licenças Microsoft 365 — março/2026", "48977.2100", "paga", "2026-03-20", "2026-04-09"),
  medicao(c[3].id, "2026-04", "Licenças Microsoft 365 — abril/2026", "48977.2100", "aprovada", "2026-04-22", undefined),
  medicao(c[3].id, "2026-05", "Licenças Microsoft 365 — maio/2026", "48977.2100", "pendente", undefined, undefined),

  // BETTA (5) — suporte telefonia IP
  medicao(c[5].id, "2025-01", "Suporte e garantia Telefonia IP Avaya — janeiro/2025", "10080.0000", "paga", "2025-01-20", "2025-01-31"),
  medicao(c[5].id, "2025-02", "Suporte e garantia Telefonia IP Avaya — fevereiro/2025", "10080.0000", "paga", "2025-02-19", "2025-02-28"),
  medicao(c[5].id, "2025-03", "Suporte e garantia Telefonia IP Avaya — março/2025", "10080.0000", "paga", "2025-03-19", "2025-03-31"),
  medicao(c[5].id, "2026-03", "Suporte e garantia Telefonia IP Avaya — março/2026", "10080.0000", "paga", "2026-03-19", "2026-03-31"),
  medicao(c[5].id, "2026-04", "Suporte e garantia Telefonia IP Avaya — abril/2026", "10080.0000", "pendente", undefined, undefined),
  medicao(c[5].id, "2026-05", "Suporte e garantia Telefonia IP Avaya — maio/2026", "10080.0000", "pendente", undefined, undefined),

  // K2 IT (6) — Wi-Fi
  medicao(c[6].id, "2024-04", "Instalação e configuração Wi-Fi — fase 1 (Bloco A)", "85075.0000", "paga", "2024-04-30", "2024-05-15"),
  medicao(c[6].id, "2024-06", "Instalação e configuração Wi-Fi — fase 2 (Bloco B e auditório)", "85075.0000", "paga", "2024-06-28", "2024-07-12"),
  medicao(c[6].id, "2024-09", "Manutenção trimestral e suporte técnico — 3º tri/2024", "56758.3300", "paga", "2024-09-30", "2024-10-15"),
  medicao(c[6].id, "2025-01", "Manutenção anual e suporte técnico — 1º semestre 2025", "56758.3300", "paga", "2025-01-30", "2025-02-14"),
  medicao(c[6].id, "2026-03", "Manutenção anual e suporte técnico — 1º trimestre 2026", "56633.3400", "aprovada", "2026-04-10", undefined),

  // CLARO (7) — telefonia móvel
  medicao(c[7].id, "2026-04", "Serviços de telefonia móvel — abril/2026", "3455.0500", "em_analise", undefined, undefined),
  medicao(c[7].id, "2026-05", "Serviços de telefonia móvel — maio/2026", "3455.0500", "pendente", undefined, undefined),

  // NEWTON (8) — locação imóvel
  medicao(c[8].id, "2026-04", "Aluguel da sala comercial em Natal-RN — abril/2026", "6009.3600", "paga", "2026-04-10", "2026-04-25"),
  medicao(c[8].id, "2026-05", "Aluguel da sala comercial em Natal-RN — maio/2026", "6009.3600", "pendente", undefined, undefined),

  // PRIME (9) — frota
  medicao(c[9].id, "2026-04", "Gestão de frota e abastecimento — abril/2026", "7807.7200", "aprovada", "2026-04-18", undefined),
  medicao(c[9].id, "2026-05", "Gestão de frota e abastecimento — maio/2026", "7807.7200", "pendente", undefined, undefined),
]);
console.log("Medições inseridas.");

// ───────────────────────────────────────────────
// RECALCULAR valor_pago A PARTIR DAS MEDIÇÕES PAGAS
// ───────────────────────────────────────────────
await db.execute(sql`
  UPDATE contratos c
  SET valor_pago = COALESCE((
    SELECT SUM(m.valor_medido::numeric)
    FROM medicoes m
    WHERE m.contrato_id = c.id AND m.situacao = 'paga'
  ), 0)
`);
console.log("valor_pago recalculado.");

// ───────────────────────────────────────────────
// ALERTAS
// ───────────────────────────────────────────────
await db.insert(alertasTable).values([
  {
    contratoId: c[0].id,
    tipo: "vencimento_proximo",
    mensagem: "Contrato 00033/2021 (ESPLANADA) vence em 06/01/2027 — iniciar processo de renovação ou nova licitação.",
    dataReferencia: "2027-01-06",
    lido: false,
  },
  {
    contratoId: c[3].id,
    tipo: "vencimento_proximo",
    mensagem: "Contrato 00019/2025 (BRASOFTWARE) — licenças M365 vence em 09/10/2028. Verificar renovação com antecedência de 12 meses.",
    dataReferencia: "2028-10-09",
    lido: false,
  },
  {
    contratoId: c[4].id,
    tipo: "contrato_vencido",
    mensagem: "Contrato 00004/2020 (MONEY TURISMO) encerrado em 16/09/2025. Novo processo licitatório de viagens corporativas pendente.",
    dataReferencia: "2025-09-16",
    lido: false,
  },
  {
    contratoId: c[10].id,
    tipo: "contrato_vencido",
    mensagem: "Contrato 00007/2020 (SERPRO DaaS) encerrado em 22/05/2025. Avaliar continuidade do serviço com novo contrato.",
    dataReferencia: "2025-05-22",
    lido: false,
  },
  {
    contratoId: c[11].id,
    tipo: "contrato_vencido",
    mensagem: "Contrato 00025/2018 (AGIL Vigilância) encerrado em 30/12/2024. Processo de nova contratação de vigilância em andamento.",
    dataReferencia: "2024-12-30",
    lido: true,
  },
  {
    contratoId: c[2].id,
    tipo: "medicao_pendente",
    mensagem: "Medição de maio/2026 do contrato JAMC (00028/2024) aguarda análise do fiscal.",
    dataReferencia: hoje,
    lido: false,
  },
  {
    contratoId: c[0].id,
    tipo: "medicao_pendente",
    mensagem: "Medição de maio/2026 do contrato ESPLANADA (00033/2021) em análise pelo fiscal.",
    dataReferencia: hoje,
    lido: false,
  },
  {
    contratoId: c[7].id,
    tipo: "medicao_pendente",
    mensagem: "Medição de telefonia CLARO (00034/2023) — fatura de maio/2026 pendente de recebimento.",
    dataReferencia: hoje,
    lido: false,
  },
  {
    contratoId: c[6].id,
    tipo: "vencimento_proximo",
    mensagem: "Contrato 00002/2024 (K2 IT — Wi-Fi) vence em 26/03/2027. Verificar necessidade de prorrogação.",
    dataReferencia: "2027-03-26",
    lido: false,
  },
  {
    contratoId: c[8].id,
    tipo: "vencimento_proximo",
    mensagem: "Contrato 00011/2022 (NEWTON — Locação Natal) vence em 13/07/2027. Negociar renovação com locador.",
    dataReferencia: "2027-07-13",
    lido: false,
  },
]);
console.log("Alertas inseridos.");

console.log("\n✅ Seed AEB concluído com sucesso!");
console.log(`   Fornecedores: ${fornecedores.length}`);
console.log(`   Contratos:    ${contratos.length}`);
console.log(`   Aditivos:     6`);
console.log(`   Medições:     ~70`);
console.log(`   Alertas:      10`);

process.exit(0);
