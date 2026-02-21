"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Users, ShoppingCart, Ruler, Package, Download, Filter, TrendingUp, DollarSign } from 'lucide-react';
import { Order, Client, InventoryItem } from '../types';

interface ReportsProps {
  orders: Order[];
  clients: Client[];
  inventory: InventoryItem[];
}

export const Reports: React.FC<ReportsProps> = ({ orders, clients, inventory }) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'clientes' | 'pedidos' | 'insumos'>('geral');

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getProductLabel = (type: string) => {
    switch (type) {
      case 'tirante': return 'Tirante';
      case 'tirante_copo': return 'Tirante Copo';
      case 'chaveiro': return 'Chaveiro';
      case 'pulseira': return 'Pulseira';
      default: return type;
    }
  };

  // Dados para Gráfico de Pedidos por Status
  const statusData = [
    { name: 'Orçamentos', value: orders.filter(o => o.status === 'orcamento').length },
    { name: 'Em Produção', value: orders.filter(o => ['impressao', 'calandra', 'finalizacao'].includes(o.status)).length },
    { name: 'Finalizados', value: orders.filter(o => o.status === 'concluido' || o.status === 'entregue').length },
  ];

  const COLORS = ['#334155', '#3b82f6', '#10b981', '#ef4444'];

  // Relatório de Clientes (Top 5 por valor)
  const clientReport = clients.map(c => {
    const clientOrders = orders.filter(o => o.clientId === c.id);
    const totalValue = clientOrders.reduce((acc, o) => acc + o.totalValue, 0);
    return { ...c, totalValue, orderCount: clientOrders.length };
  }).sort((a, b) => b.totalValue - a.totalValue);

  // Relatório de Insumos
  const fitas = inventory.filter(i => i.category === 'fita');
  const papel = inventory.filter(i => i.category === 'papel');
  const acabamentos = inventory.filter(i => i.category === 'acessorio');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Relatórios e Análises</h2>
          <p className="text-slate-400">Acompanhe o desempenho e consumo da sua fábrica.</p>
        </div>
        <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
          <Download className="w-4 h-4" /> Exportar PDF
        </button>
      </div>

      {/* Navegação de Abas */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
        <button 
          onClick={() => setActiveTab('geral')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'geral' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Visão Geral
        </button>
        <button 
          onClick={() => setActiveTab('clientes')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'clientes' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Clientes
        </button>
        <button 
          onClick={() => setActiveTab('pedidos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'pedidos' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Pedidos
        </button>
        <button 
          onClick={() => setActiveTab('insumos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'insumos' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Insumos
        </button>
      </div>

      {activeTab === 'geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Status dos Pedidos
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {statusData.map((s, i) => (
                <div key={s.name} className="text-center">
                  <p className="text-xs text-slate-500 uppercase font-bold">{s.name}</p>
                  <p className="text-xl font-bold text-slate-100">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" /> Faturamento por Categoria
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Tirantes', value: orders.filter(o => o.items[0].productType === 'tirante').reduce((acc, o) => acc + o.totalValue, 0) },
                  { name: 'Copo', value: orders.filter(o => o.items[0].productType === 'tirante_copo').reduce((acc, o) => acc + o.totalValue, 0) },
                  { name: 'Chaveiros', value: orders.filter(o => o.items[0].productType === 'chaveiro').reduce((acc, o) => acc + o.totalValue, 0) },
                  { name: 'Pulseiras', value: orders.filter(o => o.items[0].productType === 'pulseira').reduce((acc, o) => acc + o.totalValue, 0) },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'clientes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Pedidos</th>
                <th className="px-6 py-4 text-right">Total Faturado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {clientReport.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-200">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.cnpj}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{c.orderCount}</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-400">{formatCurrency(c.totalValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'pedidos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">OP / Data</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4 text-center">Qtd</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-mono text-blue-400">#{o.opNumber}</p>
                      <p className="text-xs text-slate-500">{new Date(o.date).toLocaleDateString('pt-BR')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-200 font-medium truncate max-w-[200px]">{o.clientName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-300 text-sm">{getProductLabel(o.items[0].productType)}</p>
                      <p className="text-[10px] text-slate-500">{o.items[0].width}</p>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-300 font-bold">
                      {o.items[0].quantity}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-400">
                      {formatCurrency(o.totalValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'insumos' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Relatório de Fitas */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-blue-500" /> Fitas em Estoque
            </h3>
            <div className="space-y-4">
              {fitas.map(f => (
                <div key={f.id} className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-sm text-slate-300">{f.name}</span>
                  <span className={`font-bold ${f.quantity < f.minStock ? 'text-red-400' : 'text-emerald-400'}`}>
                    {f.quantity.toLocaleString('pt-BR')}m
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Relatório de Papel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" /> Papel Sublimático
            </h3>
            <div className="space-y-4">
              {papel.map(p => (
                <div key={p.id} className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-sm text-slate-300">{p.name}</span>
                  <span className={`font-bold ${p.quantity < p.minStock ? 'text-red-400' : 'text-emerald-400'}`}>
                    {p.quantity.toLocaleString('pt-BR')}m
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Relatório de Acabamentos */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-500" /> Acabamentos
            </h3>
            <div className="space-y-4">
              {acabamentos.map(a => (
                <div key={a.id} className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-sm text-slate-300">{a.name}</span>
                  <span className={`font-bold ${a.quantity < a.minStock ? 'text-red-400' : 'text-emerald-400'}`}>
                    {a.quantity.toLocaleString('pt-BR')} un
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};