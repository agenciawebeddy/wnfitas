import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, Printer, ScrollText, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { Order } from '../types';

const data = [
  { name: 'Seg', producao: 4000, faturamento: 2400 },
  { name: 'Ter', producao: 3000, faturamento: 1398 },
  { name: 'Qua', producao: 2000, faturamento: 9800 },
  { name: 'Qui', producao: 2780, faturamento: 3908 },
  { name: 'Sex', producao: 1890, faturamento: 4800 },
  { name: 'Sab', producao: 2390, faturamento: 3800 },
];

interface DashboardProps {
  orders: Order[];
}

const KPICard = ({ title, value, icon: Icon, color, subtext }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm hover:border-slate-700 transition-colors">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{subtext}</span>
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ orders }) => {
  // Exclude concluded, delivered AND canceled from active orders
  const activeOrders = orders.filter(o => 
    o.status !== 'concluido' && 
    o.status !== 'entregue' && 
    o.status !== 'cancelado'
  ).length;
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Visão Geral</h2>
        <p className="text-slate-400">Resumo operacional da fábrica hoje.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Faturamento Mensal" 
          value="R$ 45.231,00" 
          icon={DollarSign} 
          color="bg-emerald-500"
          subtext="+12% vs mês anterior"
        />
        <KPICard 
          title="Metros a Imprimir" 
          value="1.250 m" 
          icon={Printer} 
          color="bg-blue-500"
          subtext="3 ordens pendentes"
        />
        <KPICard 
          title="Em Produção" 
          value={`${activeOrders} Pedidos`} 
          icon={ScrollText} 
          color="bg-amber-500"
          subtext="Gargalo: Calandra"
        />
        <KPICard 
          title="Estoque Crítico" 
          value="2 Itens" 
          icon={AlertTriangle} 
          color="bg-red-500"
          subtext="Tinta Magenta Baixa"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-100">Produção Semanal (Metros)</h3>
            <TrendingUp className="text-blue-500 w-5 h-5" />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                  cursor={{fill: '#334155', opacity: 0.4}}
                />
                <Bar dataKey="producao" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-6">Pedidos Recentes</h3>
          <div className="space-y-4">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                <div>
                  <p className="font-medium text-slate-200">{order.clientName}</p>
                  <p className="text-xs text-slate-500">OP #{order.opNumber || '---'} • {order.items[0].quantity} un</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium uppercase
                  ${order.status === 'aprovado' ? 'bg-emerald-500/10 text-emerald-500' : 
                    ['impressao', 'calandra', 'finalizacao'].includes(order.status) ? 'bg-blue-500/10 text-blue-500' :
                    order.status === 'cancelado' ? 'bg-red-500/10 text-red-500' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                  {order.status === 'impressao' ? 'Plotter' : 
                   order.status === 'calandra' ? 'Calandra' : 
                   order.status === 'finalizacao' ? 'Acabam.' : 
                   order.status}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-blue-400 hover:text-blue-300 font-medium">
            Ver todos os pedidos
          </button>
        </div>
      </div>
    </div>
  );
};