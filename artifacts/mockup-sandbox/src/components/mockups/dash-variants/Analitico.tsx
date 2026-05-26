import React from "react";
import { 
  BarChart3, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react";

export function Analitico() {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const currentMonth = 4; // Mai (0-indexed)

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-300 font-sans p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Month Nav */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-teal-500" />
              Execução Analítica
            </h1>
            <p className="text-sm text-slate-500 mt-1">Visão executiva de monitoramento de contratos (SLA)</p>
          </div>

          <div className="flex bg-[#1a1d27] p-1 rounded-md border border-[#2a2e3d]">
            {months.map((m, i) => (
              <button
                key={m}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  i === currentMonth 
                    ? "bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-sm" 
                    : "text-slate-400 hover:text-white hover:bg-[#2a2e3d]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="Valor Ativo (R$)" 
            value="18,5M" 
            sub="R$ 18.515.075,40"
            trend="+2.4%"
            trendUp={true}
            sparkline={[30, 40, 45, 50, 49, 60, 70]}
          />
          <KpiCard 
            title="Execução Financeira" 
            value="23,1%" 
            sub="R$ 4.285.722,88 pagos"
            trend="+1.2%"
            trendUp={true}
            sparkline={[10, 15, 18, 20, 22, 23, 23]}
          />
          <KpiCard 
            title="Alertas Críticos" 
            value="9" 
            sub="4 vencimentos, 2 pendências"
            trend="-3"
            trendUp={false}
            sparkline={[15, 12, 14, 10, 11, 12, 9]}
            danger
          />
          <KpiCard 
            title="Medições Pendentes" 
            value="8" 
            sub="Aguardando aprovação"
            trend="+2"
            trendUp={false}
            sparkline={[2, 4, 3, 5, 4, 6, 8]}
            warning
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Gauge Status */}
          <div className="bg-[#1a1d27] rounded-xl border border-[#2a2e3d] p-5 flex flex-col">
            <h3 className="text-sm font-medium text-slate-400 mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Ratio de Medições
            </h3>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#2a2e3d" strokeWidth="12" fill="none" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="#0d9488" strokeWidth="12" fill="none" 
                    strokeDasharray="251.2" strokeDashoffset="72.8" // 71% of 251.2
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">71%</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider mt-1">Pagas</span>
                </div>
              </div>
              <div className="flex w-full justify-between mt-6 px-4 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-500" />
                  <span className="text-slate-300">Resolvido (71%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#2a2e3d]" />
                  <span className="text-slate-500">Pendente (29%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart Execução */}
          <div className="bg-[#1a1d27] rounded-xl border border-[#2a2e3d] p-5 lg:col-span-2 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Execução Mensal (Últimos 6 Meses)
              </h3>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <div className="w-8 h-0.5 bg-dashed bg-slate-600" />
                Média Projetada
              </div>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-2 h-48 pt-4 relative">
              {/* Average line */}
              <div className="absolute w-full h-[1px] border-t border-dashed border-slate-600 bottom-[70%] left-0 z-0">
                <span className="absolute -top-4 right-0 text-[10px] text-slate-500">Média: R$ 344k</span>
              </div>

              {/* Bars */}
              {[
                { label: 'Dez', val: 100, txt: '413k' },
                { label: 'Jan', val: 100, txt: '413k' },
                { label: 'Fev', val: 100, txt: '413k' },
                { label: 'Mar', val: 100, txt: '413k' },
                { label: 'Abr', val: 100, txt: '413k' },
                { label: 'Mai', val: 5, txt: '0' },
              ].map((bar, i) => (
                <div key={i} className="flex flex-col items-center flex-1 z-10 group">
                  <span className="text-[10px] text-slate-500 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    R$ {bar.txt}
                  </span>
                  <div className="w-full max-w-[40px] bg-[#2a2e3d] rounded-t-sm h-full flex items-end">
                    <div 
                      className="w-full bg-teal-500 rounded-t-sm transition-all duration-500 ease-out"
                      style={{ height: `${bar.val}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 mt-3">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table Bottom Row */}
        <div className="bg-[#1a1d27] rounded-xl border border-[#2a2e3d] overflow-hidden">
          <div className="p-5 border-b border-[#2a2e3d] flex justify-between items-center">
            <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Top Vencimentos
            </h3>
            <button className="text-xs text-teal-400 hover:text-teal-300">Ver todos</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-[#1a1d27]/50 border-b border-[#2a2e3d]">
                <tr>
                  <th className="px-6 py-4 font-medium">Contrato</th>
                  <th className="px-6 py-4 font-medium">Fornecedor</th>
                  <th className="px-6 py-4 font-medium">Status / Vencimento</th>
                  <th className="px-6 py-4 font-medium text-right">Dias Restantes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e3d]">
                <tr className="hover:bg-[#202432] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-300">Apoio Administrativo</div>
                    <div className="text-xs text-slate-500 mt-1">Pregão 01/2022</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 border border-[#2a2e3d]">
                        ES
                      </div>
                      <span className="text-slate-300">ESPLANADA TEC.</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Vigente (06/01/2027)
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-emerald-400 font-mono">227 dias</div>
                    <div className="w-full bg-[#2a2e3d] h-1.5 rounded-full mt-2 overflow-hidden flex">
                      <div className="bg-emerald-500 h-full" style={{ width: '80%' }} />
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-[#202432] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-300">Licenças Microsoft 365</div>
                    <div className="text-xs text-slate-500 mt-1">Adesão ARP 12/2023</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 border border-[#2a2e3d]">
                        BR
                      </div>
                      <span className="text-slate-300">BRASOFTWARE</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Atenção (31/10/2026)
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-amber-400 font-mono">161 dias</div>
                    <div className="w-full bg-[#2a2e3d] h-1.5 rounded-full mt-2 overflow-hidden flex">
                      <div className="bg-amber-500 h-full" style={{ width: '45%' }} />
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-[#202432] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-300">Telefonia IP</div>
                    <div className="text-xs text-slate-500 mt-1">Pregão 05/2023</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400 border border-[#2a2e3d]">
                        BT
                      </div>
                      <span className="text-slate-300">BETTA SOLUTIONS</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      Crítico (31/08/2026)
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-rose-400 font-mono">99 dias</div>
                    <div className="w-full bg-[#2a2e3d] h-1.5 rounded-full mt-2 overflow-hidden flex">
                      <div className="bg-rose-500 h-full" style={{ width: '20%' }} />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ title, value, sub, trend, trendUp, sparkline, danger, warning }: any) {
  // Simple sparkline generator
  const max = Math.max(...sparkline);
  const min = Math.min(...sparkline);
  const range = max - min || 1;
  const points = sparkline.map((val: number, i: number) => {
    const x = (i / (sparkline.length - 1)) * 60;
    const y = 20 - ((val - min) / range) * 20;
    return `${x},${y}`;
  }).join(' ');

  let colorClass = "text-slate-300";
  let trendClass = trendUp ? "text-emerald-400 bg-emerald-400/10" : "text-rose-400 bg-rose-400/10";
  let sparkColor = "#0d9488"; // teal
  
  if (danger) {
    colorClass = "text-rose-400";
    sparkColor = "#f43f5e"; // rose
  } else if (warning) {
    colorClass = "text-amber-400";
    sparkColor = "#fbbf24"; // amber
  }

  return (
    <div className="bg-[#1a1d27] rounded-xl p-5 border border-[#2a2e3d] flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</h3>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trendClass} flex items-center gap-0.5`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </span>
      </div>
      
      <div className="flex justify-between items-end mt-auto">
        <div>
          <div className={`text-2xl font-semibold mb-1 ${colorClass}`}>{value}</div>
          <div className="text-xs text-slate-500">{sub}</div>
        </div>
        
        <div className="w-16 h-6 opacity-70">
          <svg viewBox="0 0 60 22" className="w-full h-full overflow-visible">
            <polyline 
              points={points} 
              fill="none" 
              stroke={sparkColor} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
