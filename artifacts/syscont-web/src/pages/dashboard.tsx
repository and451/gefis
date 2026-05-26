import { AppLayout } from "@/components/layout/app-layout";
import { 
  useGetDashboardResumo, 
  useGetDashboardVencimentos, 
  useGetDashboardPorStatus, 
  useGetDashboardPorModalidade,
  useGetDashboardExecucaoMensal,
  getGetDashboardResumoQueryKey,
  getGetDashboardVencimentosQueryKey,
  getGetDashboardPorStatusQueryKey,
  getGetDashboardPorModalidadeQueryKey,
  getGetDashboardExecucaoMensalQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { 
  FileText, 
  AlertTriangle, 
  CalendarDays, 
  TrendingUp,
  Bell,
  ClipboardList,
  User
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  vigente: "var(--color-chart-3)",
  encerrado: "var(--color-muted-foreground)",
  rescindido: "var(--color-destructive)",
  suspenso: "var(--color-chart-4)",
};

export default function Dashboard() {
  const { data: resumo, isLoading: isLoadingResumo } = useGetDashboardResumo({
    query: { queryKey: getGetDashboardResumoQueryKey() }
  });
  
  const { data: vencimentos, isLoading: isLoadingVencimentos } = useGetDashboardVencimentos({
    query: { queryKey: getGetDashboardVencimentosQueryKey() }
  });

  const { data: porStatus, isLoading: isLoadingStatus } = useGetDashboardPorStatus({
    query: { queryKey: getGetDashboardPorStatusQueryKey() }
  });

  const { data: porModalidade, isLoading: isLoadingModalidade } = useGetDashboardPorModalidade({
    query: { queryKey: getGetDashboardPorModalidadeQueryKey() }
  });

  const { data: execucaoMensal } = useGetDashboardExecucaoMensal({
    query: { queryKey: getGetDashboardExecucaoMensalQueryKey() }
  });

  const isLoading = isLoadingResumo || isLoadingVencimentos || isLoadingStatus || isLoadingModalidade;

  if (isLoading) {
    return (
      <AppLayout>
        <DashboardSkeleton />
      </AppLayout>
    );
  }

  const statusData = porStatus?.map(s => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.quantidade,
    color: STATUS_COLORS[s.status] || "var(--color-chart-1)"
  })) || [];

  const modalidadeData = porModalidade?.map(m => ({
    name: m.modalidade.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    quantidade: m.quantidade,
    valorTotal: m.valorTotal
  })) || [];

  const execMensalData = (execucaoMensal || []).map(e => ({
    mes: e.mes,
    valorPago: e.valorPago,
    qtd: e.quantidadeMedicoes,
  }));

  const percentual = resumo?.percentualExecucaoMedio ?? 0;
  const hasAlerts = (resumo?.alertasNaoLidos ?? 0) > 0 || (resumo?.medicoesPendentes ?? 0) > 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Resumo Executivo</h1>
          <p className="text-muted-foreground mt-1">Agência Espacial Brasileira — visão geral dos contratos administrativos.</p>
        </div>

        {/* Cards principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumo?.totalContratos || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {resumo?.contratoVigentes || 0} vigentes
                {(resumo?.contratosVencendo90dias ?? 0) > 0 && (
                  <span className="text-orange-500 ml-2">· {resumo?.contratosVencendo90dias} vencem em 90 dias</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total Ativo</CardTitle>
              <TrendingUp className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(resumo?.valorTotalAtivo)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pago: {formatCurrency(resumo?.valorPagoTotal)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Execução Financeira</CardTitle>
              <ClipboardList className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{percentual.toFixed(1)}%</div>
              <Progress value={percentual} className="mt-2 h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">
                {resumo?.medicoesPendentes ?? 0} medições pendentes
              </p>
            </CardContent>
          </Card>

          <Card className={cn(hasAlerts ? "border-destructive/50 bg-destructive/5" : "")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendências</CardTitle>
              <Bell className={cn("h-4 w-4", hasAlerts ? "text-destructive" : "text-muted-foreground")} />
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", hasAlerts ? "text-destructive" : "")}>
                {resumo?.alertasNaoLidos || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                alertas · {resumo?.contratosVencendo30dias || 0} vencendo em 30 dias
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
              <CardDescription>Quantidade de contratos por situação atual</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px]">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value} contratos`, 'Quantidade']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">Nenhum dado disponível</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Modalidade</CardTitle>
              <CardDescription>Quantidade de contratos por modalidade de licitação</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px]">
              {modalidadeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modalidadeData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={11} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === 'quantidade' ? `${value} contratos` : formatCurrency(value), 
                        name === 'quantidade' ? 'Quantidade' : 'Valor Total'
                      ]}
                      cursor={{ fill: 'var(--color-muted)' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }}
                    />
                    <Bar dataKey="quantidade" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">Nenhum dado disponível</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Execução mensal */}
        {execMensalData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Execução Financeira Mensal</CardTitle>
              <CardDescription>Valor de medições pagas por mês (últimos 12 meses)</CardDescription>
            </CardHeader>
            <CardContent className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={execMensalData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mes" fontSize={11} />
                  <YAxis tickFormatter={(v) => `R$ ${(v/1000).toFixed(0)}k`} fontSize={11} />
                  <Tooltip
                    formatter={(v: number) => [formatCurrency(v), 'Valor Pago']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }}
                  />
                  <Bar dataKey="valorPago" fill="var(--color-chart-3)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Vencimentos próximos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Vencimentos Próximos</CardTitle>
              <CardDescription>Contratos que exigem atenção (vencendo em até 90 dias)</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/alertas">Ver todos alertas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {vencimentos && vencimentos.length > 0 ? (
              <div className="space-y-3">
                {vencimentos.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-4 border rounded-lg bg-card transition-colors hover:bg-muted/50">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className={cn(
                        "mt-0.5 p-2 rounded-full shrink-0",
                        v.nivelAlerta === "critico" ? "bg-destructive/10 text-destructive" : 
                        v.nivelAlerta === "urgente" ? "bg-orange-500/10 text-orange-500" : 
                        "bg-primary/10 text-primary"
                      )}>
                        {v.nivelAlerta === "critico" ? <AlertTriangle className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/contratos/${v.id}`}>
                            <span className="font-semibold hover:underline cursor-pointer text-sm">{v.numeroContrato}</span>
                          </Link>
                          <Badge variant={v.nivelAlerta === "critico" ? "destructive" : "secondary"}
                            className={v.nivelAlerta === "urgente" ? "bg-orange-500/10 text-orange-600" : ""}>
                            {v.diasRestantes} dias
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{v.fornecedorNome}</p>
                        {v.fiscal && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <User className="h-3 w-3" /> Fiscal: {v.fiscal}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block ml-4">
                      <div className="font-medium text-sm">{formatCurrency(v.valorAtual)}</div>
                      <div className="text-xs text-muted-foreground">
                        {(v as any).percentualExecucao?.toFixed(1) ?? 0}% executado
                      </div>
                      <p className="text-xs text-muted-foreground">até {formatDate(v.dataVigenciaFim)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg border-dashed bg-muted/20">
                <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-sm font-medium">Tudo tranquilo</h3>
                <p className="text-sm text-muted-foreground mt-1">Nenhum contrato vencendo nos próximos 90 dias.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
