import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import ContratosList from "@/pages/contratos/index";
import NovoContrato from "@/pages/contratos/novo";
import ContratoDetalhe from "@/pages/contratos/[id]";
import FornecedoresList from "@/pages/fornecedores/index";
import NovoFornecedor from "@/pages/fornecedores/novo";
import FornecedorDetalhe from "@/pages/fornecedores/[id]";
import ConsultaPncp from "@/pages/pncp/index";
import Alertas from "@/pages/alertas/index";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      
      <Route path="/contratos" component={ContratosList} />
      <Route path="/contratos/novo" component={NovoContrato} />
      <Route path="/contratos/:id" component={ContratoDetalhe} />
      
      <Route path="/fornecedores" component={FornecedoresList} />
      <Route path="/fornecedores/novo" component={NovoFornecedor} />
      <Route path="/fornecedores/:id" component={FornecedorDetalhe} />
      
      <Route path="/pncp" component={ConsultaPncp} />
      <Route path="/alertas" component={Alertas} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="syscont-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
