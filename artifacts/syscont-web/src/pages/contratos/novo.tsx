import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { 
  useCreateContrato,
  useListFornecedores,
  getListFornecedoresQueryKey,
  getListContratosQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function NovoContrato() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createContrato = useCreateContrato();
  
  const { data: fornecedores } = useListFornecedores({}, {
    query: { queryKey: getListFornecedoresQueryKey({}) }
  });

  const [formData, setFormData] = useState({
    numeroContrato: "",
    processo: "",
    objeto: "",
    fornecedorId: "",
    valorInicial: "",
    dataAssinatura: "",
    dataVigenciaInicio: "",
    dataVigenciaFim: "",
    modalidade: "",
    categoriaProcesso: "",
    unidadeGestora: "AEB - Agência Espacial Brasileira",
    fiscal: "",
    gestor: "",
    observacoes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.numeroContrato || !formData.objeto || !formData.fornecedorId || 
        !formData.valorInicial || !formData.dataAssinatura || 
        !formData.dataVigenciaInicio || !formData.dataVigenciaFim || !formData.modalidade) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos marcados com (*)."
      });
      return;
    }

    createContrato.mutate(
      { 
        data: {
          numeroContrato: formData.numeroContrato,
          processo: formData.processo || null,
          objeto: formData.objeto,
          fornecedorId: Number(formData.fornecedorId),
          valorInicial: Number(formData.valorInicial),
          dataAssinatura: new Date(formData.dataAssinatura).toISOString(),
          dataVigenciaInicio: new Date(formData.dataVigenciaInicio).toISOString(),
          dataVigenciaFim: new Date(formData.dataVigenciaFim).toISOString(),
          modalidade: formData.modalidade as any,
          categoriaProcesso: formData.categoriaProcesso || null,
          unidadeGestora: formData.unidadeGestora || null,
          fiscal: formData.fiscal || null,
          gestor: formData.gestor || null,
          observacoes: formData.observacoes || null,
        } 
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListContratosQueryKey() });
          toast({ title: "Contrato cadastrado com sucesso." });
          setLocation(`/contratos/${data.id}`);
        },
        onError: () => {
          toast({ variant: "destructive", title: "Erro ao salvar contrato", description: "Verifique os dados e tente novamente." });
        }
      }
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/contratos")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Novo Contrato</h1>
            <p className="text-muted-foreground mt-1">Cadastre um novo contrato administrativo da AEB.</p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              {/* Identificação */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Identificação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numeroContrato">Número do Contrato *</Label>
                    <Input id="numeroContrato" name="numeroContrato" placeholder="Ex: 001/2024" value={formData.numeroContrato} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="processo">Processo Administrativo</Label>
                    <Input id="processo" name="processo" placeholder="Ex: 22600.001234/2024-00" value={formData.processo} onChange={handleChange} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="objeto">Objeto do Contrato *</Label>
                    <Textarea id="objeto" name="objeto" placeholder="Descrição detalhada do objeto do contrato..." value={formData.objeto} onChange={handleChange} className="min-h-[90px]" required />
                  </div>
                </div>
              </div>

              {/* Fornecedor e Valores */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Fornecedor e Valores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fornecedorId">Fornecedor *</Label>
                    <Select value={formData.fornecedorId} onValueChange={(val) => handleSelectChange("fornecedorId", val)}>
                      <SelectTrigger><SelectValue placeholder="Selecione um fornecedor" /></SelectTrigger>
                      <SelectContent>
                        {fornecedores?.map((f) => (
                          <SelectItem key={f.id} value={f.id.toString()}>{f.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valorInicial">Valor Inicial (R$) *</Label>
                    <Input id="valorInicial" name="valorInicial" type="number" step="0.01" placeholder="0,00" value={formData.valorInicial} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modalidade">Modalidade de Licitação *</Label>
                    <Select value={formData.modalidade} onValueChange={(val) => handleSelectChange("modalidade", val)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pregao_eletronico">Pregão Eletrônico</SelectItem>
                        <SelectItem value="pregao_presencial">Pregão Presencial</SelectItem>
                        <SelectItem value="concorrencia">Concorrência</SelectItem>
                        <SelectItem value="tomada_de_precos">Tomada de Preços</SelectItem>
                        <SelectItem value="convite">Convite</SelectItem>
                        <SelectItem value="dispensa">Dispensa</SelectItem>
                        <SelectItem value="inexigibilidade">Inexigibilidade</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoriaProcesso">Categoria do Processo</Label>
                    <Input id="categoriaProcesso" name="categoriaProcesso" placeholder="Ex: Aquisição de bens" value={formData.categoriaProcesso} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Datas */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Prazos e Vigência</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataAssinatura">Data de Assinatura *</Label>
                    <Input id="dataAssinatura" name="dataAssinatura" type="date" value={formData.dataAssinatura} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataVigenciaInicio">Início da Vigência *</Label>
                    <Input id="dataVigenciaInicio" name="dataVigenciaInicio" type="date" value={formData.dataVigenciaInicio} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataVigenciaFim">Fim da Vigência *</Label>
                    <Input id="dataVigenciaFim" name="dataVigenciaFim" type="date" value={formData.dataVigenciaFim} onChange={handleChange} required />
                  </div>
                </div>
              </div>

              {/* Responsáveis */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Responsáveis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fiscal">Fiscal do Contrato</Label>
                    <Input id="fiscal" name="fiscal" placeholder="Nome do fiscal responsável" value={formData.fiscal} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gestor">Gestor do Contrato</Label>
                    <Input id="gestor" name="gestor" placeholder="Nome do gestor responsável" value={formData.gestor} onChange={handleChange} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="unidadeGestora">Unidade Gestora</Label>
                    <Input id="unidadeGestora" name="unidadeGestora" value={formData.unidadeGestora} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="border-t pt-6">
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações Adicionais</Label>
                  <Textarea id="observacoes" name="observacoes" placeholder="Qualquer informação extra relevante..." value={formData.observacoes} onChange={handleChange} />
                </div>
              </div>
            </CardContent>
            <div className="bg-muted/50 px-6 py-4 border-t flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setLocation("/contratos")}>Cancelar</Button>
              <Button type="submit" disabled={createContrato.isPending}>
                {createContrato.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />Salvar Contrato</>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
