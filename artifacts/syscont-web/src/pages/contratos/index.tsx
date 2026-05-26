import { useState } from "react";
import { useLocation, Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { 
  useListContratos,
  getListContratosQueryKey,
  useListFornecedores,
  getListFornecedoresQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Plus, Building2, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContratosList() {
  const [, setLocation] = useLocation();
  const [busca, setBusca] = useState("");
  const [buscaSubmit, setBuscaSubmit] = useState("");
  const [status, setStatus] = useState<string>("todos");
  const [fornecedorId, setFornecedorId] = useState<string>("todos");

  const { data: contratosResponse, isLoading } = useListContratos(
    { 
      busca: buscaSubmit || undefined,
      status: status !== "todos" ? status as any : undefined,
      fornecedorId: fornecedorId !== "todos" ? Number(fornecedorId) : undefined
    },
    { 
      query: { 
        queryKey: getListContratosQueryKey({ 
          busca: buscaSubmit || undefined,
          status: status !== "todos" ? status as any : undefined,
          fornecedorId: fornecedorId !== "todos" ? Number(fornecedorId) : undefined
        }) 
      } 
    }
  );

  const { data: fornecedores } = useListFornecedores({}, {
    query: { queryKey: getListFornecedoresQueryKey({}) }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setBuscaSubmit(busca);
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

  const contratos = contratosResponse?.data || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Contratos</h1>
            <p className="text-muted-foreground mt-1">Gerencie os contratos da sua unidade gestora.</p>
          </div>
          <Button asChild>
            <Link href="/contratos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Contrato
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por número ou objeto..."
                  className="pl-9"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="vigente">Vigente</SelectItem>
                  <SelectItem value="encerrado">Encerrado</SelectItem>
                  <SelectItem value="rescindido">Rescindido</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                </SelectContent>
              </Select>
              <Select value={fornecedorId} onValueChange={setFornecedorId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Fornecedores</SelectItem>
                  {fornecedores?.map((f) => (
                    <SelectItem key={f.id} value={f.id.toString()}>{f.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" variant="secondary">Filtrar</Button>
              {(buscaSubmit || status !== "todos" || fornecedorId !== "todos") && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {
                    setBusca("");
                    setBuscaSubmit("");
                    setStatus("todos");
                    setFornecedorId("todos");
                  }}
                >
                  Limpar
                </Button>
              )}
            </form>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : contratos.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead className="hidden md:table-cell">Objeto</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Valor Atual</TableHead>
                      <TableHead className="hidden lg:table-cell">Vigência Fim</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contratos.map((contrato) => (
                      <TableRow 
                        key={contrato.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors" 
                        onClick={() => setLocation(`/contratos/${contrato.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2 font-medium">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {contrato.numeroContrato}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-[200px] truncate text-muted-foreground" title={contrato.objeto}>
                          {contrato.objeto}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="truncate max-w-[150px]">{contrato.fornecedor?.nome || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(contrato.valorAtual || contrato.valorInicial)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(contrato.dataVigenciaFim)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(contrato.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 border rounded-lg border-dashed bg-muted/20">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">Nenhum contrato encontrado</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Sua busca não retornou resultados. Tente outros termos ou limpe os filtros.
                </p>
                {!(buscaSubmit || status !== "todos" || fornecedorId !== "todos") && (
                  <Button className="mt-4" asChild>
                    <Link href="/contratos/novo">Cadastrar Contrato</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
