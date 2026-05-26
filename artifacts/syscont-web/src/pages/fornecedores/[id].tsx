import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { 
  useGetFornecedor,
  getGetFornecedorQueryKey,
  useUpdateFornecedor,
  useDeleteFornecedor,
  useListContratos,
  getListContratosQueryKey,
  getListFornecedoresQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Building2, FileText, Settings, Trash, Loader2, Save, MapPin, Mail, Phone, User } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCnpjCpf, formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export default function FornecedorDetalhe() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: fornecedor, isLoading } = useGetFornecedor(id, {
    query: { queryKey: getGetFornecedorQueryKey(id), enabled: !!id }
  });

  const { data: contratosResponse, isLoading: isLoadingContratos } = useListContratos(
    { fornecedorId: id },
    { query: { queryKey: getListContratosQueryKey({ fornecedorId: id }), enabled: !!id } }
  );

  const updateFornecedor = useUpdateFornecedor();
  const deleteFornecedor = useDeleteFornecedor();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!fornecedor) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold">Fornecedor não encontrado</h2>
          <p className="text-muted-foreground mt-2">O fornecedor que você está procurando não existe ou foi excluído.</p>
          <Button className="mt-4" onClick={() => setLocation("/fornecedores")}>Voltar para a lista</Button>
        </div>
      </AppLayout>
    );
  }

  const handleEdit = () => {
    setEditData({
      nome: fornecedor.nome,
      email: fornecedor.email || "",
      telefone: fornecedor.telefone || "",
      endereco: fornecedor.endereco || "",
      cidade: fornecedor.cidade || "",
      uf: fornecedor.uf || "",
      ativo: fornecedor.ativo
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateFornecedor.mutate(
      { 
        id, 
        data: editData
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetFornecedorQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListFornecedoresQueryKey({}) });
          setIsEditing(false);
          toast({ title: "Fornecedor atualizado com sucesso" });
        },
        onError: () => {
          toast({ variant: "destructive", title: "Erro ao atualizar fornecedor" });
        }
      }
    );
  };

  const handleDelete = () => {
    deleteFornecedor.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListFornecedoresQueryKey({}) });
          toast({ title: "Fornecedor excluído com sucesso" });
          setLocation("/fornecedores");
        },
        onError: () => {
          toast({ 
            variant: "destructive", 
            title: "Erro ao excluir fornecedor",
            description: "Pode haver contratos vinculados a este fornecedor. Exclua-os primeiro."
          });
          setDeleteDialogOpen(false);
        }
      }
    );
  };

  const contratos = contratosResponse?.data || [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/fornecedores")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{fornecedor.nome}</h1>
                {fornecedor.ativo !== false ? (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">Ativo</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">Inativo</Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">CNPJ/CPF: {formatCnpjCpf(fornecedor.cnpjCpf)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <Button onClick={handleEdit} variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Editar
              </Button>
            ) : (
              <Button onClick={() => setIsEditing(false)} variant="ghost">
                Cancelar
              </Button>
            )}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Excluir Fornecedor</DialogTitle>
                  <DialogDescription>
                    Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita. Se houver contratos vinculados, a exclusão falhará.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleteFornecedor.isPending}>
                    {deleteFornecedor.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Exclusão"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações do Fornecedor</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome / Razão Social</Label>
                      <Input 
                        value={editData.nome} 
                        onChange={(e) => setEditData({...editData, nome: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div className="flex items-center space-x-2 border rounded p-2">
                        <Switch 
                          checked={editData.ativo} 
                          onCheckedChange={(c) => setEditData({...editData, ativo: c})} 
                          id="status"
                        />
                        <Label htmlFor="status">{editData.ativo ? "Fornecedor Ativo" : "Fornecedor Inativo"}</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input 
                        type="email"
                        value={editData.email} 
                        onChange={(e) => setEditData({...editData, email: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input 
                        value={editData.telefone} 
                        onChange={(e) => setEditData({...editData, telefone: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Endereço</Label>
                      <Input 
                        value={editData.endereco} 
                        onChange={(e) => setEditData({...editData, endereco: e.target.value})} 
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-2 col-span-2">
                        <Label>Cidade</Label>
                        <Input 
                          value={editData.cidade} 
                          onChange={(e) => setEditData({...editData, cidade: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>UF</Label>
                        <Input 
                          maxLength={2}
                          className="uppercase"
                          value={editData.uf} 
                          onChange={(e) => setEditData({...editData, uf: e.target.value})} 
                        />
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleSaveEdit} disabled={updateFornecedor.isPending}>
                      {updateFornecedor.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Salvar Alterações
                    </Button>
                  </div>
                ) : (
                  <dl className="space-y-4">
                    <div className="flex items-center gap-3">
                      {fornecedor.tipoPessoa === 'PJ' ? (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Tipo</dt>
                        <dd className="text-sm">{fornecedor.tipoPessoa === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}</dd>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">E-mail</dt>
                        <dd className="text-sm">{fornecedor.email || '-'}</dd>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Telefone</dt>
                        <dd className="text-sm">{fornecedor.telefone || '-'}</dd>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <dt className="text-xs font-medium text-muted-foreground">Localidade</dt>
                        <dd className="text-sm">{fornecedor.endereco ? `${fornecedor.endereco}, ` : ''}{fornecedor.cidade ? `${fornecedor.cidade} - ${fornecedor.uf}` : 'Não informada'}</dd>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <dt className="text-xs font-medium text-muted-foreground">Data de Cadastro</dt>
                      <dd className="text-sm">{formatDate(fornecedor.createdAt)}</dd>
                    </div>
                  </dl>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Contratos Vinculados</CardTitle>
                </div>
                <Badge variant="outline" className="ml-auto">{contratos.length} contratos</Badge>
              </CardHeader>
              <CardContent>
                {isLoadingContratos ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : contratos.length > 0 ? (
                  <div className="space-y-3">
                    {contratos.map((contrato) => (
                      <div 
                        key={contrato.id} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card transition-colors hover:bg-muted/50 cursor-pointer"
                        onClick={() => setLocation(`/contratos/${contrato.id}`)}
                      >
                        <div className="space-y-1 mb-2 sm:mb-0 pr-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{contrato.numeroContrato}</span>
                            <Badge variant={contrato.status === "vigente" ? "default" : "outline"} className="ml-2 text-xs">
                              {contrato.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1" title={contrato.objeto}>
                            {contrato.objeto}
                          </p>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <div className="font-medium">{formatCurrency(contrato.valorAtual || contrato.valorInicial)}</div>
                          <p className="text-xs text-muted-foreground">Até {formatDate(contrato.dataVigenciaFim)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h3 className="text-sm font-medium">Nenhum contrato</h3>
                    <p className="text-sm text-muted-foreground mt-1">Este fornecedor não possui contratos vinculados.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
