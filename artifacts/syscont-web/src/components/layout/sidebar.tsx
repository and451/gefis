import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Search, 
  Bell,
  Menu,
  Moon,
  Sun,
  X,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useListAlertas } from "@workspace/api-client-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contratos", label: "Contratos", icon: FileText },
  { href: "/fornecedores", label: "Fornecedores", icon: Users },
  { href: "/pncp", label: "Consulta PNCP", icon: Search },
  { href: "/alertas", label: "Alertas", icon: Bell },
];

export function Sidebar({ className }: { className?: string }) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: alertas } = useListAlertas({ lido: false }, {
    query: {
      queryKey: ["/api/alertas", { lido: false }]
    }
  });

  const unreadCount = alertas?.length || 0;

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      <div className="md:hidden p-4 flex items-center justify-between border-b bg-sidebar">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg tracking-tight text-primary">SysCont</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="p-6 hidden md:block border-b border-sidebar-border">
          <Link href="/">
            <div className="cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                  <Rocket className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl tracking-tight text-primary">SysCont</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight pl-10">
                Agência Espacial Brasileira
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors font-medium text-sm",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                    {item.label}
                  </div>
                  {item.href === "/alertas" && unreadCount > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <p className="text-[10px] text-muted-foreground mb-2 px-1">CNPJ: 86.900.545/0001-70</p>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            {theme === "light" ? "Modo Escuro" : "Modo Claro"}
          </Button>
        </div>
      </aside>
    </>
  );
}
