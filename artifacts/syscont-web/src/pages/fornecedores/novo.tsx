import { useState } from "react";
import { useLocation, Link } from "wouter";
import { AppLayout } from "@/components/layout/app-layout";
import { 
  useCreateFornecedor,
  getListFornecedoresQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function NovoFornecedor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createFornecedor = useCreateFornecedor();

  const [formData, setFormData] = useState({
    nome: "",
    cnpjCpf: "",
    tipoPessoa: "PJ" as "PJ" | "PF",
    email: "",
    telefone: "",
    endereco: "",
    cidade: "",
    uf: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.cnpjCpf) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Nome e CNPJ/CPF são obrigatórios."
      });
      return;
    }

    createFornecedor.mutate(
      { 
        data: {
          nome: formData.nome,
          cnpjCpf: formData.cnpjCpf.replace(/\D/g, ''),
          tipoPessoa: formData.tipoPessoa,
          email: formData.email || null,
          telefone: formData.telefone || null,
          endereco: formData.endereco || null,
          cidade: formData.cidade || null,
          uf: formData.uf || null
        } 
      },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListFornecedoresQueryKey({}) });
          toast({
            title: "Fornecedor cadastrado",
            description: "O fornecedor foi cadastrado com sucesso."
          });
          setLocation(`/fornecedores/${data.id}`);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Erro ao salvar",
            description: "Ocorreu um erro ao cadastrar fornecedor. Verifique os dados."
          });
        }
      }
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/fornecedores")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Novo Fornecedor</h1>
            <p className="text-muted-foreground mt-1">Cadastre um fornecedor para vincular a contratos.</p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label>Tipo de Pessoa</Label>
                <RadioGroup 
                  value={formData.tipoPessoa} 
                  onValueChange={(val: "PJ" | "PF") => setFormData(prev => ({ ...prev, tipoPessoa: val }))}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PJ" id="pj" />
                    <Label htmlFor="pj">Pessoa Jurídica (CNPJ)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PF" id="pf" />
                    <Label htmlFor="pf">Pessoa Física (CPF)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="nome">Nome / Razão Social *</Label>
                  <Input 
                    id="nome" 
                    name="nome" 
                    value={formData.nome}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cnpjCpf">{formData.tipoPessoa === "PJ" ? "CNPJ *" : "CPF *"}</Label>
                  <Input 
                    id="cnpjCpf" 
                    name="cnpjCpf" 
                    value={formData.cnpjCpf}
                    onChange={handleChange}
                    placeholder={formData.tipoPessoa === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input 
                    id="telefone" 
                    name="telefone" 
                    value={formData.telefone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input 
                    id="endereco" 
                    name="endereco" 
                    value={formData.endereco}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input 
                    id="cidade" 
                    name="cidade" 
                    value={formData.cidade}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uf">UF</Label>
                  <Input 
                    id="uf" 
                    name="uf" 
                    maxLength={2}
                    placeholder="Ex: SP"
                    className="uppercase"
                    value={formData.uf}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
            <div className="bg-muted/50 px-6 py-4 border-t flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setLocation("/fornecedores")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createFornecedor.isPending}>
                {createFornecedor.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Fornecedor
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
