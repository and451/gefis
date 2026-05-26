import { useState } from "react";
import { useLocation, Link, useParams } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { 
  useGetContrato,
  getGetContratoQueryKey,
  useUpdateContrato,
  useDeleteContrato,
  useListAditivosByContrato,
  useCreateAditivo,
  getListAditivosByContratoQueryKey,
  getListContratosQueryKey,
  useListMedicoesByContrato,
  getListMedicoesByContratoQueryKey,
  useCreateMedicao,
  useAprovarMedicao,
  usePagarMedicao,
  useDeleteMedicao,
  getGetDashboardResumoQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, Building2, Calendar, FileText, Settings, AlertTriangle, 
  Plus, Loader2, Save, Trash, User, CheckCircle2, DollarSign, ClipboardList
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const SITUACAO_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendente: { label: "Pendente", variant: "outline" },
  em_analise: { label: "Em análise", variant: "secondary" },
  aprovada: { label: "Aprovada", variant: "default" },
  paga: { label: "Paga", variant: "default" },
  glosada: { label: "Glosada", variant: "destructive" },
  cancelada: { label: "Cancelada", variant: "destructive" },
};

export default function ContratoDetalhe() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: contrato, isLoading } = useGetContrato(id, {
    query: { queryKey: getGetContratoQueryKey(id), enabled: !!id }
  });

  const { data: aditivos } = useListAditivosByContrato(id, {
    query: { queryKey: getListAditivosByContratoQueryKey(id), enabled: !!id }
  });

  const { data: medicoes } = useListMedicoesByContrato(id, {
    query: { queryKey: getListMedicoesByContratoQueryKey(id), enabled: !!id }
  });

  const updateContrato = useUpdateContrato();
  const deleteContrato = useDeleteContrato();
  const createAditivo = useCreateAditivo();
  const createMedicao = useCreateMedicao();
  const aprovarMedicao = useAprovarMedicao();
  const pagarMedicao = usePagarMedicao();
  const deleteMedicao = useDeleteMedicao();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Aditivo state
  const [aditivoDialogOpen, setAditivoDialogOpen] = useState(false);
  const [aditivoData, setAditivoData] = useState({
    tipo: "aditivo", numero: "", dataAssinatura: "",
    dataNovaVigencia: "", valorAcrescimo: "", objeto: "", observacoes: ""
  });

  // Medição state
  const [medicaoDialogOpen, setMedicaoDialogOpen] = useState(false);
  const [medicaoData, setMedicaoData] = useState({
    numero: "", mesReferencia: "", periodoInicio: "",
    periodoFim: "", valorMedido: "", valorGlosa: "", numeroNotaFiscal: "", observacoes: ""
  });

  // Pagamento state
  const [pagamentoDialogOpen, setPagamentoDialogOpen] = useState(false);
  const [selectedMedicaoId, setSelectedMedicaoId] = useState<number | null>(null);
  const [pagamentoData, setPagamentoData] = useState({
    valorPago: "", numeroNotaFiscal: "", dataNotaFiscal: "", observacoes: ""
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getGetContratoQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: getListMedicoesByContratoQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: getGetDashboardResumoQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListContratosQueryKey() });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!contrato) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold">Contrato não encontrado</h2>
          <Button className="mt-4" onClick={() => setLocation("/contratos")}>Voltar para a lista</Button>
        </div>
      </AppLayout>
    );
  }

  const valorPago = Number((contrato as any).valorPago ?? 0);
  const valorAtual = Number(contrato.valorAtual);
  const percentualExecucao = valorAtual > 0 ? Math.round((valorPago / valorAtual) * 100 * 10) / 10 : 0;

  const handleEdit = () => {
    setEditData({
      objeto: contrato.objeto,
      status: contrato.status,
      valorInicial: contrato.valorInicial,
      dataVigenciaFim: contrato.dataVigenciaFim,
      fiscal: (contrato as any).fiscal || "",
      gestor: (contrato as any).gestor || "",
      observacoes: contrato.observacoes || "",
      categoriaProcesso: contrato.categoriaProcesso || "",
      unidadeGestora: contrato.unidadeGestora || ""
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateContrato.mutate(
      { id, data: { ...editData, valorInicial: Number(editData.valorInicial) } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetContratoQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListContratosQueryKey() });
          setIsEditing(false);
          toast({ title: "Contrato atualizado com sucesso" });
        },
        onError: () => toast({ variant: "destructive", title: "Erro ao atualizar contrato" })
      }
    );
  };

  const handleDelete = () => {
    deleteContrato.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListContratosQueryKey() });
        toast({ title: "Contrato excluído com sucesso" });
        setLocation("/contratos");
      },
      onError: () => toast({ variant: "destructive", title: "Erro ao excluir contrato" })
    });
  };

  const handleSaveAditivo = () => {
    createAditivo.mutate(
      { data: {
        contratoId: id,
        tipo: aditivoData.tipo as any,
        numero: aditivoData.numero,
        dataAssinatura: new Date(aditivoData.dataAssinatura).toISOString(),
        dataNovaVigencia: aditivoData.dataNovaVigencia ? new Date(aditivoData.dataNovaVigencia).toISOString() : null,
        valorAcrescimo: aditivoData.valorAcrescimo ? Number(aditivoData.valorAcrescimo) : null,
        objeto: aditivoData.objeto,
        observacoes: aditivoData.observacoes || null
      } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAditivosByContratoQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetContratoQueryKey(id) });
          setAditivoDialogOpen(false);
          setAditivoData({ tipo: "aditivo", numero: "", dataAssinatura: "", dataNovaVigencia: "", valorAcrescimo: "", objeto: "", observacoes: "" });
          toast({ title: "Aditivo/Apostila registrado com sucesso" });
        },
        onError: () => toast({ variant: "destructive", title: "Erro ao registrar aditivo" })
      }
    );
  };

  const handleSaveMedicao = () => {
    if (!medicaoData.numero || !medicaoData.mesReferencia || !medicaoData.periodoInicio || !medicaoData.periodoFim || !medicaoData.valorMedido) {
      toast({ variant: "destructive", title: "Preencha todos os campos obrigatórios" });
      return;
    }
    createMedicao.mutate(
      { data: {
        contratoId: id,
        numero: medicaoData.numero,
        mesReferencia: medicaoData.mesReferencia,
        periodoInicio: medicaoData.periodoInicio,
        periodoFim: medicaoData.periodoFim,
        valorMedido: Number(medicaoData.valorMedido),
        valorGlosa: medicaoData.valorGlosa ? Number(medicaoData.valorGlosa) : null,
        numeroNotaFiscal: medicaoData.numeroNotaFiscal || null,
        observacoes: medicaoData.observacoes || null,
      } },
      {
        onSuccess: () => {
          invalidateAll();
          setMedicaoDialogOpen(false);
          setMedicaoData({ numero: "", mesReferencia: "", periodoInicio: "", periodoFim: "", valorMedido: "", valorGlosa: "", numeroNotaFiscal: "", observacoes: "" });
          toast({ title: "Medição registrada com sucesso" });
        },
        onError: () => toast({ variant: "destructive", title: "Erro ao registrar medição" })
      }
    );
  };

  const handleAprovar = (medicaoId: number) => {
    aprovarMedicao.mutate({ id: medicaoId }, {
      onSuccess: () => {
        invalidateAll();
        toast({ title: "Medição aprovada" });
      },
      onError: () => toast({ variant: "destructive", title: "Erro ao aprovar medição" })
    });
  };

  const handleOpenPagamento = (medicaoId: number, valorMedido: number) => {
    setSelectedMedicaoId(medicaoId);
    setPagamentoData({ valorPago: String(valorMedido), numeroNotaFiscal: "", dataNotaFiscal: "", observacoes: "" });
    setPagamentoDialogOpen(true);
  };

  const handleSavePagamento = () => {
    if (!selectedMedicaoId) return;
    pagarMedicao.mutate(
      { id: selectedMedicaoId, data: {
        valorPago: Number(pagamentoData.valorPago),
        numeroNotaFiscal: pagamentoData.numeroNotaFiscal || null,
        dataNotaFiscal: pagamentoData.dataNotaFiscal || null,
        observacoes: pagamentoData.observacoes || null,
      } },
      {
        onSuccess: () => {
          invalidateAll();
          setPagamentoDialogOpen(false);
          toast({ title: "Pagamento registrado com sucesso" });
        },
        onError: () => toast({ variant: "destructive", title: "Erro ao registrar pagamento" })
      }
    );
  };

  const handleDeleteMedicao = (medicaoId: number) => {
    deleteMedicao.mutate({ id: medicaoId }, {
      onSuccess: () => {
        invalidateAll();
        toast({ title: "Medição excluída" });
      },
      onError: () => toast({ variant: "destructive", title: "Erro ao excluir medição" })
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "vigente": return <Badge variant="secondary" className="bg-chart-3/10 text-chart-3 border-chart-3/20">Vigente</Badge>;
      case "encerrado": return <Badge variant="secondary" className="bg-muted text-muted-foreground">Encerrado</Badge>;
      case "rescindido": return <Badge variant="destructive">Rescindido</Badge>;
      case "suspenso": return <Badge variant="secondary" className="bg-chart-4/10 text-chart-4 border-chart-4/20">Suspenso</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const medicoesCount = medicoes?.length || 0;
  const aditivosCount = aditivos?.length || 0;
  const alertasCount = contrato.alertas?.length || 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/contratos")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Contrato {contrato.numeroContrato}</h1>
                {getStatusBadge(contrato.status)}
              </div>
              <p className="text-muted-foreground mt-1 line-clamp-1 max-w-2xl">{contrato.objeto}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button onClick={handleEdit} variant="outline">
                <Settings className="h-4 w-4 mr-2" />Editar
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(false)} variant="ghost">Cancelar</Button>
            )}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="icon"><Trash className="h-4 w-4" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Excluir Contrato</DialogTitle>
                  <DialogDescription>Tem certeza? Esta ação removerá o contrato e todos os seus registros associados.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleteContrato.isPending}>
                    {deleteContrato.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Exclusão"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="detalhes">
          <TabsList>
            <TabsTrigger value="detalhes">Detalhes Gerais</TabsTrigger>
            <TabsTrigger value="medicoes">
              Medições ({medicoesCount})
            </TabsTrigger>
            <TabsTrigger value="aditivos">Aditivos ({aditivosCount})</TabsTrigger>
            <TabsTrigger value="alertas">Alertas ({alertasCount})</TabsTrigger>
          </TabsList>

          {/* ── DETALHES ── */}
          <TabsContent value="detalhes" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Informações do Contrato</CardTitle></CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Objeto</Label>
                          <Textarea value={editData.objeto} onChange={(e) => setEditData({...editData, objeto: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={editData.status} onValueChange={(v) => setEditData({...editData, status: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="vigente">Vigente</SelectItem>
                                <SelectItem value="encerrado">Encerrado</SelectItem>
                                <SelectItem value="rescindido">Rescindido</SelectItem>
                                <SelectItem value="suspenso">Suspenso</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Valor Inicial (R$)</Label>
                            <Input type="number" value={editData.valorInicial} onChange={(e) => setEditData({...editData, valorInicial: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label>Fim da Vigência</Label>
                            <Input type="date" value={editData.dataVigenciaFim?.split('T')[0]} onChange={(e) => setEditData({...editData, dataVigenciaFim: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label>Unidade Gestora</Label>
                            <Input value={editData.unidadeGestora} onChange={(e) => setEditData({...editData, unidadeGestora: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label>Fiscal do Contrato</Label>
                            <Input value={editData.fiscal} onChange={(e) => setEditData({...editData, fiscal: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label>Gestor do Contrato</Label>
                            <Input value={editData.gestor} onChange={(e) => setEditData({...editData, gestor: e.target.value})} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Observações</Label>
                          <Textarea value={editData.observacoes} onChange={(e) => setEditData({...editData, observacoes: e.target.value})} />
                        </div>
                        <Button onClick={handleSaveEdit} disabled={updateContrato.isPending}>
                          {updateContrato.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Salvar Alterações
                        </Button>
                      </div>
                    ) : (
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-muted-foreground">Objeto</dt>
                          <dd className="mt-1 text-sm">{contrato.objeto}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Processo Administrativo</dt>
                          <dd className="mt-1 text-sm">{contrato.processo || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Modalidade</dt>
                          <dd className="mt-1 text-sm capitalize">{contrato.modalidade?.replace(/_/g, ' ')}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Unidade Gestora</dt>
                          <dd className="mt-1 text-sm">{contrato.unidadeGestora || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Categoria</dt>
                          <dd className="mt-1 text-sm">{contrato.categoriaProcesso || '-'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Fiscal do Contrato</dt>
                          <dd className="mt-1 text-sm flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            {(contrato as any).fiscal || '-'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Gestor do Contrato</dt>
                          <dd className="mt-1 text-sm flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            {(contrato as any).gestor || '-'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-muted-foreground">Controle PNCP</dt>
                          <dd className="mt-1 text-sm font-mono text-xs">{contrato.numeroControlePncp || 'Não vinculado'}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-muted-foreground">Observações</dt>
                          <dd className="mt-1 text-sm">{contrato.observacoes || '-'}</dd>
                        </div>
                      </dl>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Fornecedor</CardTitle></CardHeader>
                  <CardContent>
                    {contrato.fornecedor ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{contrato.fornecedor.nome}</p>
                            <p className="text-sm text-muted-foreground">{contrato.fornecedor.cnpjCpf}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/fornecedores/${contrato.fornecedor.id}`}>Ver Fornecedor</Link>
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Fornecedor não encontrado.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-lg">Valores e Execução</CardTitle></CardHeader>
                  <CardContent>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Valor Inicial</dt>
                        <dd className="text-base font-semibold">{formatCurrency(contrato.valorInicial)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Valor Atualizado</dt>
                        <dd className="text-lg font-bold text-primary">{formatCurrency(valorAtual)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground mb-2">
                          Execução Financeira — {percentualExecucao.toFixed(1)}%
                        </dt>
                        <Progress value={percentualExecucao} className="h-2" />
                        <dd className="text-sm mt-1 text-muted-foreground">
                          {formatCurrency(valorPago)} pagos de {formatCurrency(valorAtual)}
                        </dd>
                      </div>
                      <div className="border-t pt-3">
                        <dt className="text-sm font-medium text-muted-foreground">Vigência</dt>
                        <dd className="mt-1 text-sm flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(contrato.dataVigenciaInicio)} até {formatDate(contrato.dataVigenciaFim)}
                        </dd>
                        <dt className="text-sm font-medium text-muted-foreground mt-3">Assinatura</dt>
                        <dd className="mt-1 text-sm">{formatDate(contrato.dataAssinatura)}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── MEDIÇÕES ── */}
          <TabsContent value="medicoes" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Medições e Pagamentos</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Total pago: <span className="font-medium text-foreground">{formatCurrency(valorPago)}</span>
                  {" · "}Execução: <span className="font-medium text-foreground">{percentualExecucao.toFixed(1)}%</span>
                </p>
              </div>
              <Dialog open={medicaoDialogOpen} onOpenChange={setMedicaoDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" />Nova Medição</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Registrar Medição</DialogTitle>
                    <DialogDescription>Registre uma nova medição para o contrato.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Número *</Label>
                        <Input placeholder="001/2025" value={medicaoData.numero} onChange={(e) => setMedicaoData({...medicaoData, numero: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Mês de Referência *</Label>
                        <Input placeholder="MM/YYYY" value={medicaoData.mesReferencia} onChange={(e) => setMedicaoData({...medicaoData, mesReferencia: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Período Início *</Label>
                        <Input type="date" value={medicaoData.periodoInicio} onChange={(e) => setMedicaoData({...medicaoData, periodoInicio: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Período Fim *</Label>
                        <Input type="date" value={medicaoData.periodoFim} onChange={(e) => setMedicaoData({...medicaoData, periodoFim: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Valor Medido (R$) *</Label>
                        <Input type="number" step="0.01" placeholder="0,00" value={medicaoData.valorMedido} onChange={(e) => setMedicaoData({...medicaoData, valorMedido: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Valor Glosa (R$)</Label>
                        <Input type="number" step="0.01" placeholder="0,00" value={medicaoData.valorGlosa} onChange={(e) => setMedicaoData({...medicaoData, valorGlosa: e.target.value})} />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Nota Fiscal</Label>
                        <Input placeholder="NF-e XXXXXX" value={medicaoData.numeroNotaFiscal} onChange={(e) => setMedicaoData({...medicaoData, numeroNotaFiscal: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Observações</Label>
                      <Textarea placeholder="Informações adicionais..." value={medicaoData.observacoes} onChange={(e) => setMedicaoData({...medicaoData, observacoes: e.target.value})} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setMedicaoDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveMedicao} disabled={createMedicao.isPending}>
                      {createMedicao.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {medicoes && medicoes.length > 0 ? (
              <div className="space-y-3">
                {medicoes.map((m) => {
                  const sit = SITUACAO_LABELS[m.situacao] || { label: m.situacao, variant: "outline" as const };
                  const valorMedido = Number(m.valorMedido);
                  const valorGlosa = Number(m.valorGlosa);
                  const valorPagoM = Number(m.valorPago);
                  return (
                    <Card key={m.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">Medição {m.numero}</span>
                              <Badge variant={sit.variant} className={cn(
                                m.situacao === "paga" ? "bg-chart-3/10 text-chart-3" : ""
                              )}>{sit.label}</Badge>
                              <span className="text-sm text-muted-foreground">{m.mesReferencia}</span>
                            </div>
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">Valor Medido</p>
                                <p className="font-medium">{formatCurrency(valorMedido)}</p>
                              </div>
                              {valorGlosa > 0 && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Glosa</p>
                                  <p className="font-medium text-destructive">- {formatCurrency(valorGlosa)}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-xs text-muted-foreground">Valor Pago</p>
                                <p className={cn("font-medium", m.situacao === "paga" ? "text-chart-3" : "text-muted-foreground")}>
                                  {m.situacao === "paga" ? formatCurrency(valorPagoM) : "-"}
                                </p>
                              </div>
                              {m.numeroNotaFiscal && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Nota Fiscal</p>
                                  <p className="font-medium text-xs">{m.numeroNotaFiscal}</p>
                                </div>
                              )}
                            </div>
                            {m.observacoes && (
                              <p className="mt-2 text-xs text-muted-foreground">{m.observacoes}</p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">
                              Período: {formatDate(m.periodoInicio)} a {formatDate(m.periodoFim)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {m.situacao === "pendente" && (
                              <Button size="sm" variant="outline" onClick={() => handleAprovar(m.id)} disabled={aprovarMedicao.isPending}>
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Aprovar
                              </Button>
                            )}
                            {m.situacao === "aprovada" && (
                              <Button size="sm" variant="default" onClick={() => handleOpenPagamento(m.id, valorMedido - valorGlosa)}>
                                <DollarSign className="h-3.5 w-3.5 mr-1" />Pagar
                              </Button>
                            )}
                            {(m.situacao === "pendente" || m.situacao === "em_analise") && (
                              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteMedicao(m.id)}>
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg border-dashed bg-muted/20">
                <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-medium">Nenhuma medição registrada</h3>
                <p className="text-sm text-muted-foreground mt-1">Registre medições para acompanhar a execução financeira do contrato.</p>
                <Button size="sm" className="mt-4" onClick={() => setMedicaoDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />Registrar Primeira Medição
                </Button>
              </div>
            )}

            {/* Dialog Pagamento */}
            <Dialog open={pagamentoDialogOpen} onOpenChange={setPagamentoDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Pagamento</DialogTitle>
                  <DialogDescription>Confirme os dados do pagamento para esta medição.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Valor Pago (R$) *</Label>
                    <Input type="number" step="0.01" value={pagamentoData.valorPago} onChange={(e) => setPagamentoData({...pagamentoData, valorPago: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nota Fiscal</Label>
                      <Input placeholder="NF-e XXXXXX" value={pagamentoData.numeroNotaFiscal} onChange={(e) => setPagamentoData({...pagamentoData, numeroNotaFiscal: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Data da NF</Label>
                      <Input type="date" value={pagamentoData.dataNotaFiscal} onChange={(e) => setPagamentoData({...pagamentoData, dataNotaFiscal: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea value={pagamentoData.observacoes} onChange={(e) => setPagamentoData({...pagamentoData, observacoes: e.target.value})} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPagamentoDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSavePagamento} disabled={pagarMedicao.isPending}>
                    {pagarMedicao.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Pagamento"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* ── ADITIVOS ── */}
          <TabsContent value="aditivos" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Histórico de Alterações</h2>
              <Dialog open={aditivoDialogOpen} onOpenChange={setAditivoDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="mr-2 h-4 w-4" />Novo Registro</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Aditivo ou Apostila</DialogTitle>
                    <DialogDescription>Adicione uma modificação ao contrato atual.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select value={aditivoData.tipo} onValueChange={(v) => setAditivoData({...aditivoData, tipo: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aditivo">Aditivo</SelectItem>
                            <SelectItem value="apostila">Apostila</SelectItem>
                            <SelectItem value="rescisao">Rescisão</SelectItem>
                            <SelectItem value="suspensao">Suspensão</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Número/Identificador</Label>
                        <Input value={aditivoData.numero} onChange={(e) => setAditivoData({...aditivoData, numero: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Objeto da Alteração</Label>
                      <Input value={aditivoData.objeto} onChange={(e) => setAditivoData({...aditivoData, objeto: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data de Assinatura</Label>
                        <Input type="date" value={aditivoData.dataAssinatura} onChange={(e) => setAditivoData({...aditivoData, dataAssinatura: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Nova Vigência Fim</Label>
                        <Input type="date" value={aditivoData.dataNovaVigencia} onChange={(e) => setAditivoData({...aditivoData, dataNovaVigencia: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Valor de Acréscimo/Supressão (R$)</Label>
                      <Input type="number" step="0.01" value={aditivoData.valorAcrescimo} onChange={(e) => setAditivoData({...aditivoData, valorAcrescimo: e.target.value})} placeholder="Negativo para supressão" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAditivoDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSaveAditivo} disabled={createAditivo.isPending}>
                      {createAditivo.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {aditivos && aditivos.length > 0 ? (
              <div className="relative border-l-2 border-muted ml-4 space-y-8 pb-4">
                {aditivos.map((aditivo) => (
                  <div key={aditivo.id} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={aditivo.tipo === 'aditivo' ? 'default' : 'secondary'} className="capitalize">{aditivo.tipo}</Badge>
                            <span className="font-semibold">{aditivo.numero}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{formatDate(aditivo.dataAssinatura)}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-3">{aditivo.objeto}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {aditivo.valorAcrescimo ? (
                            <div>Valor: <span className="font-medium text-foreground">{formatCurrency(aditivo.valorAcrescimo)}</span></div>
                          ) : null}
                          {aditivo.dataNovaVigencia ? (
                            <div>Nova Vigência: <span className="font-medium text-foreground">{formatDate(aditivo.dataNovaVigencia)}</span></div>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg border-dashed bg-muted/20">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-medium">Nenhum aditivo registrado</h3>
                <p className="text-sm text-muted-foreground mt-1">Aditivos e apostilas aparecerão aqui.</p>
              </div>
            )}
          </TabsContent>

          {/* ── ALERTAS ── */}
          <TabsContent value="alertas" className="space-y-4 mt-6">
            <h2 className="text-xl font-semibold">Alertas do Contrato</h2>
            {contrato.alertas && contrato.alertas.length > 0 ? (
              <div className="space-y-3">
                {contrato.alertas.map((alerta: any) => (
                  <div key={alerta.id} className={cn(
                    "flex items-start gap-4 p-4 border rounded-lg",
                    alerta.lido ? "bg-muted/20 opacity-70" : "bg-card"
                  )}>
                    <AlertTriangle className={cn("h-5 w-5 shrink-0 mt-0.5", alerta.lido ? "text-muted-foreground" : "text-destructive")} />
                    <div>
                      <p className="text-sm font-medium">{alerta.mensagem}</p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">{alerta.tipo?.replace(/_/g, ' ')}</p>
                    </div>
                    {alerta.lido && <Badge variant="outline" className="ml-auto shrink-0 text-xs">Lido</Badge>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg border-dashed bg-muted/20">
                <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-medium">Sem alertas</h3>
                <p className="text-sm text-muted-foreground mt-1">Nenhum alerta gerado para este contrato.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
