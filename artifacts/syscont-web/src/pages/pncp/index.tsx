import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { 
  useBuscarPncp,
  useImportarPncp,
  getBuscarPncpQueryKey,
  useBuscarOrgaoPncp,
  getBuscarOrgaoPncpQueryKey,
  useBuscarComprasnet,
  useImportarComprasnet,
  getBuscarComprasnetQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, Building, Loader2, ArrowRightLeft, Database, RefreshCw } from "lucide-react";
import { formatCurrency, formatDate, formatCnpjCpf } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";

const AEB_CNPJ = "86900545000170";
const AEB_CNPJ_FORMATTED = "86.900.545/0001-70";

function getDefaultDates() {
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);
  return {
    dataInicial: oneYearAgo.toISOString().split("T")[0],
    dataFinal: today.toISOString().split("T")[0],
  };
}

function getStatusBadge(situacao: string | null) {
  if (!situacao) return null;
  if (situacao === "Ativo") return <Badge className="bg-green-100 text-green-800 border-green-200">Ativo</Badge>;
  if (situacao === "Inativo" || situacao === "Encerrado") return <Badge variant="secondary">Encerrado</Badge>;
  return <Badge variant="outline">{situacao}</Badge>;
}

// ─── PNCP Tab ────────────────────────────────────────────────────────────────
function PncpTab() {
  const { toast } = useToast();
  const defaults = getDefaultDates();

  const [formData, setFormData] = useState({
    cnpj: AEB_CNPJ_FORMATTED,
    dataInicial: defaults.dataInicial,
    dataFinal: defaults.dataFinal,
  });

  const [searchParams, setSearchParams] = useState<{
    cnpj?: string;
    dataInicial: string;
    dataFinal: string;
  } | null>(null);

  const [importingId, setImportingId] = useState<string | null>(null);

  const pncpParams = {
    cnpj: searchParams?.cnpj,
    dataInicial: searchParams?.dataInicial ?? "",
    dataFinal: searchParams?.dataFinal ?? "",
  };
  const { data: resultados, isLoading, isError } = useBuscarPncp(
    pncpParams,
    { query: { enabled: !!searchParams, queryKey: searchParams ? getBuscarPncpQueryKey(pncpParams) : ["pncp-empty"] } }
  );

  const { data: orgao, isLoading: isLoadingOrgao } = useBuscarOrgaoPncp(
    searchParams?.cnpj || "",
    { query: { enabled: !!searchParams?.cnpj, queryKey: searchParams?.cnpj ? getBuscarOrgaoPncpQueryKey(searchParams.cnpj) : ["orgao-empty"] } }
  );

  const importarPncp = useImportarPncp();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dataInicial || !formData.dataFinal) {
      toast({ variant: "destructive", title: "Datas obrigatórias", description: "Informe o período inicial e final." });
      return;
    }
    setSearchParams({
      cnpj: formData.cnpj.replace(/\D/g, "") || undefined,
      dataInicial: formData.dataInicial.replace(/-/g, ""),
      dataFinal: formData.dataFinal.replace(/-/g, ""),
    });
  };

  const handleImport = (contrato: any) => {
    setImportingId(contrato.numeroControlePNCP);
    importarPncp.mutate(
      { data: { numeroControlePNCP: contrato.numeroControlePNCP } },
      {
        onSuccess: () => {
          toast({ title: "Contrato importado", description: `Contrato ${contrato.numeroControlePNCP} importado com sucesso.` });
          setImportingId(null);
        },
        onError: () => {
          toast({ variant: "destructive", title: "Erro na importação", description: "Verifique se o contrato já existe no sistema." });
          setImportingId(null);
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros de Busca</CardTitle>
          <CardDescription>
            Pré-configurado com o CNPJ da Agência Espacial Brasileira ({AEB_CNPJ_FORMATTED}).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ do Órgão</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Pré-configurado com o CNPJ da AEB.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataInicial">Data Inicial *</Label>
                <Input id="dataInicial" type="date" value={formData.dataInicial} onChange={(e) => setFormData({ ...formData, dataInicial: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataFinal">Data Final *</Label>
                <Input id="dataFinal" type="date" value={formData.dataFinal} onChange={(e) => setFormData({ ...formData, dataFinal: e.target.value })} required />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setFormData({ ...formData, cnpj: AEB_CNPJ_FORMATTED })} className="text-xs text-muted-foreground">
                Usar CNPJ da AEB
              </Button>
              <Button type="submit" disabled={isLoading || isLoadingOrgao}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Consultar PNCP
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {searchParams && (
        <div className="space-y-6">
          {orgao && searchParams.cnpj && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full"><Building className="h-6 w-6 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold">{orgao.razaoSocial}</h3>
                    <p className="text-sm text-muted-foreground">CNPJ: {formatCnpjCpf(orgao.cnpj)}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">Órgão Encontrado</Badge>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Resultados da Busca</CardTitle>
              {resultados && <CardDescription>Encontrados {resultados.totalRegistros} contratos no período.</CardDescription>}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-4 p-4 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-muted rounded w-1/3 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
                      </div>
                      <div className="w-24 h-10 bg-muted rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="text-center py-12 bg-destructive/5 rounded-lg border border-destructive/20">
                  <Search className="h-10 w-10 text-destructive mx-auto mb-3 opacity-50" />
                  <h3 className="text-sm font-medium text-destructive">Erro na busca</h3>
                  <p className="text-sm text-destructive/80 mt-1 max-w-sm mx-auto">
                    Não foi possível conectar ao PNCP. Verifique os parâmetros ou tente novamente mais tarde.
                  </p>
                </div>
              ) : resultados && resultados.data.length > 0 ? (
                <div className="space-y-4">
                  {resultados.data.map((contrato, idx) => (
                    <div key={`${contrato.numeroControlePNCP}-${idx}`} className="flex flex-col lg:flex-row gap-4 p-5 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">{contrato.numeroControlePNCP}</Badge>
                          {contrato.categoriaProcesso?.nome && (
                            <Badge variant="secondary" className="text-xs">{contrato.categoriaProcesso.nome}</Badge>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium leading-tight line-clamp-2" title={contrato.objeto}>{contrato.objeto}</h4>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                            <Building className="h-3.5 w-3.5" />
                            <span>{contrato.orgaoEntidade.razaoSocial}</span>
                            {contrato.unidadeOrgao?.nomeUnidade && (
                              <>
                                <ArrowRightLeft className="h-3 w-3 mx-1 opacity-50" />
                                <span className="truncate">{contrato.unidadeOrgao.nomeUnidade}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Fornecedor</p>
                            <p className="text-sm font-medium truncate">{contrato.fornecedorNome}</p>
                            <p className="text-xs text-muted-foreground">{formatCnpjCpf(contrato.niFornecedor)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Valor Global</p>
                            <p className="text-sm font-semibold text-primary">{formatCurrency(contrato.valorGlobal)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Assinatura</p>
                            <p className="text-sm">{formatDate(contrato.dataAssinatura)}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Vigência</p>
                            <p className="text-sm">{formatDate(contrato.dataVigenciaInicio)} a {formatDate(contrato.dataVigenciaFim)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex lg:flex-col justify-end lg:justify-start gap-2 pt-4 lg:pt-0 lg:border-l lg:pl-4 border-t lg:border-t-0 shrink-0">
                        <Button variant="default" className="w-full" onClick={() => handleImport(contrato)} disabled={importingId === contrato.numeroControlePNCP}>
                          {importingId === contrato.numeroControlePNCP ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <><Download className="mr-2 h-4 w-4" />Importar</>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg border-dashed bg-muted/20">
                  <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="text-lg font-medium">Nenhum contrato encontrado</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    Tente ampliar o período ou verificar o CNPJ informado.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── ComprasNet Tab ───────────────────────────────────────────────────────────
function ComprasnetTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [searchTrigger, setSearchTrigger] = useState<{ busca?: string } | undefined>({ busca: undefined });
  const [importingId, setImportingId] = useState<number | null>(null);

  const { data: resultados, isLoading, isError, refetch } = useBuscarComprasnet(
    searchTrigger,
    { query: { queryKey: getBuscarComprasnetQueryKey(searchTrigger), staleTime: 5 * 60 * 1000 } }
  );

  const importarComprasnet = useImportarComprasnet();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTrigger({ busca: busca.trim() || undefined });
  };

  const handleImport = (contrato: any) => {
    setImportingId(contrato.id);
    importarComprasnet.mutate(
      { data: { contratoId: contrato.id } },
      {
        onSuccess: (novo) => {
          toast({ title: "Contrato importado", description: `${contrato.numero} importado com sucesso.` });
          setImportingId(null);
          queryClient.invalidateQueries({ queryKey: ["listContratos"] });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Erro na importação", description: "Verifique se o contrato já existe no sistema." });
          setImportingId(null);
        }
      }
    );
  };

  const contratos = resultados?.data ?? [];
  const total = resultados?.total ?? 0;

  return (
    <div className="space-y-6">
      <Card className="bg-blue-50/50 border-blue-100">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Database className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Agência Espacial Brasileira — AEB</h3>
              <p className="text-sm text-blue-700">CNPJ: {AEB_CNPJ_FORMATTED} · UG: 203001 (DPOA/AEB)</p>
            </div>
          </div>
          <Badge className="sm:ml-auto bg-blue-100 text-blue-800 border-blue-200">contratos.comprasnet.gov.br</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Contratos no ComprasNet</CardTitle>
          <CardDescription>
            Consulta em tempo real todos os contratos da AEB registrados no SIASG/ComprasNet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
            <Input
              placeholder="Buscar por objeto, fornecedor, número ou processo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Buscar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
              title="Atualizar resultados"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </form>
          {total > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              {total} contrato{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
              {busca ? ` para "${busca}"` : " (ordenados por valor)"}
            </p>
          )}
        </CardContent>
      </Card>

      {isError ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Database className="h-10 w-10 text-destructive mx-auto mb-3 opacity-50" />
            <h3 className="text-sm font-medium text-destructive">Erro ao conectar ao ComprasNet</h3>
            <p className="text-sm text-muted-foreground mt-1">Verifique sua conexão ou tente novamente mais tarde.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-muted rounded w-1/4 animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-1/3 animate-pulse"></div>
              </div>
              <div className="w-24 h-10 bg-muted rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : contratos.length > 0 ? (
        <div className="space-y-3">
          {contratos.map((contrato) => {
            const valorStr = contrato.valor_global ?? contrato.valor_inicial;
            const valorNum = valorStr
              ? parseFloat(valorStr.replace(/\./g, "").replace(",", "."))
              : 0;
            const fornNome = contrato.fornecedor?.nome ?? "Não informado";
            const fornCnpj = contrato.fornecedor?.cnpj_cpf_idgener;

            return (
              <div key={contrato.id} className="flex flex-col lg:flex-row gap-4 p-5 border rounded-lg bg-card hover:bg-muted/30 transition-colors">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold">{contrato.numero}</span>
                    {contrato.situacao && getStatusBadge(contrato.situacao)}
                    {contrato.modalidade && (
                      <Badge variant="outline" className="text-xs">{contrato.modalidade}</Badge>
                    )}
                    {contrato.categoria && (
                      <Badge variant="secondary" className="text-xs">{contrato.categoria}</Badge>
                    )}
                  </div>
                  <p className="text-sm leading-snug line-clamp-2 text-foreground" title={contrato.objeto}>{contrato.objeto}</p>
                  {contrato.processo && (
                    <p className="text-xs text-muted-foreground font-mono">Processo: {contrato.processo}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Fornecedor</p>
                      <p className="text-sm font-medium truncate">{fornNome}</p>
                      {fornCnpj && <p className="text-xs text-muted-foreground">{formatCnpjCpf(fornCnpj)}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Valor Global</p>
                      <p className="text-sm font-semibold text-primary">{valorNum > 0 ? formatCurrency(valorNum) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Assinatura</p>
                      <p className="text-sm">{contrato.data_assinatura ? formatDate(contrato.data_assinatura) : "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Vigência fim</p>
                      <p className="text-sm">
                        {contrato.vigencia_fim ? formatDate(contrato.vigencia_fim) : "Indeterminado"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex lg:flex-col justify-end lg:justify-start gap-2 pt-3 lg:pt-0 lg:border-l lg:pl-4 border-t lg:border-t-0 shrink-0">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => handleImport(contrato)}
                    disabled={importingId === contrato.id}
                  >
                    {importingId === contrato.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <><Download className="mr-2 h-4 w-4" />Importar</>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : searchTrigger !== undefined ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Database className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium">Nenhum contrato encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {busca ? `Nenhum resultado para "${busca}".` : "Clique em Buscar para carregar os contratos da AEB."}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ConsultaPortais() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Consulta de Portais Públicos</h1>
          <p className="text-muted-foreground mt-1">
            Consulte e importe contratos da AEB publicados no PNCP e no ComprasNet.
          </p>
        </div>

        <Tabs defaultValue="comprasnet">
          <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="comprasnet" className="flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5" />ComprasNet
            </TabsTrigger>
            <TabsTrigger value="pncp" className="flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5" />PNCP
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comprasnet" className="mt-6">
            <ComprasnetTab />
          </TabsContent>

          <TabsContent value="pncp" className="mt-6">
            <PncpTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
