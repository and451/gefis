import { useState } from "react";
import { useLocation, Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { 
  useListFornecedores,
  getListFornecedoresQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCnpjCpf } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, Plus, User, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function FornecedoresList() {
  const [, setLocation] = useLocation();
  const [busca, setBusca] = useState("");
  const [buscaSubmit, setBuscaSubmit] = useState("");

  const { data: fornecedores, isLoading } = useListFornecedores(
    { busca: buscaSubmit || undefined },
    { query: { queryKey: getListFornecedoresQueryKey({ busca: buscaSubmit || undefined }) } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setBuscaSubmit(busca);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Fornecedores</h1>
            <p className="text-muted-foreground mt-1">Gerencie os fornecedores cadastrados no sistema.</p>
          </div>
          <Button asChild>
            <Link href="/fornecedores/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Fornecedor
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nome ou CNPJ/CPF..."
                  className="pl-9"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary">Buscar</Button>
              {buscaSubmit && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => {
                    setBusca("");
                    setBuscaSubmit("");
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
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : fornecedores && fornecedores.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome / Razão Social</TableHead>
                      <TableHead>CNPJ / CPF</TableHead>
                      <TableHead>Localidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fornecedores.map((fornecedor) => (
                      <TableRow key={fornecedor.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setLocation(`/fornecedores/${fornecedor.id}`)}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {fornecedor.tipoPessoa === 'PJ' ? (
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="font-medium">{fornecedor.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatCnpjCpf(fornecedor.cnpjCpf)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="text-sm">
                              {fornecedor.cidade && fornecedor.uf 
                                ? `${fornecedor.cidade} - ${fornecedor.uf}` 
                                : '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {fornecedor.ativo !== false ? (
                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">Ativo</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild onClick={(e) => e.stopPropagation()}>
                            <Link href={`/fornecedores/${fornecedor.id}`}>
                              Ver Detalhes
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 border rounded-lg border-dashed bg-muted/20">
                <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">Nenhum fornecedor encontrado</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  {buscaSubmit 
                    ? "Sua busca não retornou resultados. Tente outros termos ou limpe o filtro."
                    : "Comece cadastrando os fornecedores que prestam serviço para sua organização."}
                </p>
                {!buscaSubmit && (
                  <Button className="mt-4" asChild>
                    <Link href="/fornecedores/novo">Cadastrar Fornecedor</Link>
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
