import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { 
  useListAlertas,
  useMarcarAlertaLido,
  getListAlertasQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert, Loader2, FileText, Check } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Alertas() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("todos");
  
  const lidoParam = filter === "nao_lidos" ? false : filter === "lidos" ? true : undefined;

  const { data: alertas, isLoading } = useListAlertas(
    { lido: lidoParam },
    { query: { queryKey: getListAlertasQueryKey({ lido: lidoParam }) } }
  );

  const marcarLido = useMarcarAlertaLido();

  const handleMarcarLido = (id: number) => {
    marcarLido.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAlertasQueryKey({ lido: lidoParam }) });
          // Also invalidate the ones we might not be viewing right now, but could affect counts
          queryClient.invalidateQueries({ queryKey: getListAlertasQueryKey({ lido: false }) });
          queryClient.invalidateQueries({ queryKey: ["/api/dashboard/resumo"] });
          toast({ title: "Alerta marcado como lido" });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Erro ao atualizar alerta" });
        }
      }
    );
  };

  const getAlertIcon = (tipo: string, lido: boolean) => {
    const className = `h-5 w-5 ${lido ? 'text-muted-foreground' : ''}`;
    switch (tipo) {
      case 'vencimento_proximo': return <Clock className={className + (lido ? '' : ' text-orange-500')} />;
      case 'vencido': return <ShieldAlert className={className + (lido ? '' : ' text-destructive')} />;
      case 'renovacao_necessaria': return <CheckCircle2 className={className + (lido ? '' : ' text-primary')} />;
      default: return <AlertTriangle className={className + (lido ? '' : ' text-orange-500')} />;
    }
  };

  const getAlertBadge = (tipo: string, lido: boolean) => {
    if (lido) return <Badge variant="outline" className="text-muted-foreground">Resolvido</Badge>;
    switch (tipo) {
      case 'vencimento_proximo': return <Badge variant="secondary" className="bg-orange-500/10 text-orange-600">Atenção</Badge>;
      case 'vencido': return <Badge variant="destructive">Crítico</Badge>;
      case 'renovacao_necessaria': return <Badge variant="secondary" className="bg-primary/10 text-primary">Ação Necessária</Badge>;
      default: return <Badge variant="secondary">Alerta</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Central de Alertas</h1>
            <p className="text-muted-foreground mt-1">Acompanhe vencimentos e pendências dos seus contratos.</p>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar alertas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Alertas</SelectItem>
              <SelectItem value="nao_lidos">Não Lidos</SelectItem>
              <SelectItem value="lidos">Lidos / Resolvidos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notificações do Sistema</CardTitle>
            <CardDescription>
              Fique atento aos prazos para evitar interrupção de serviços essenciais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4 p-4 border rounded-lg">
                    <div className="h-5 w-5 bg-muted rounded-full animate-pulse mt-0.5"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-muted rounded w-1/3 animate-pulse"></div>
                      <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : alertas && alertas.length > 0 ? (
              <div className="space-y-4">
                {alertas.map((alerta) => (
                  <div 
                    key={alerta.id} 
                    className={`flex flex-col sm:flex-row gap-4 p-5 border rounded-lg transition-colors ${alerta.lido ? 'bg-muted/30 opacity-70' : 'bg-card border-primary/20 shadow-sm'}`}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-0.5">
                        {getAlertIcon(alerta.tipo, alerta.lido)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`font-semibold ${alerta.lido ? 'text-muted-foreground' : 'text-foreground'}`}>
                            {alerta.mensagem}
                          </span>
                          {getAlertBadge(alerta.tipo, alerta.lido)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {alerta.contratoNumero && (
                            <Link href={`/contratos/${alerta.contratoId}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                              <FileText className="h-3.5 w-3.5" />
                              Contrato {alerta.contratoNumero}
                            </Link>
                          )}
                          <span>Gerado em {formatDate(alerta.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex sm:flex-col justify-end gap-2 pt-2 sm:pt-0 sm:border-l sm:pl-4 border-t sm:border-t-0 shrink-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/contratos/${alerta.contratoId}`}>
                          Ver Contrato
                        </Link>
                      </Button>
                      {!alerta.lido && (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleMarcarLido(alerta.id)}
                          disabled={marcarLido.isPending}
                        >
                          {marcarLido.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Marcar como Lido
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg border-dashed bg-muted/20">
                <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">Nenhum alerta</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  {filter === "nao_lidos" 
                    ? "Excelente! Você não tem pendências ou alertas não lidos no momento." 
                    : "Você não possui alertas registrados no sistema."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
