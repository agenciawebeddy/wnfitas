"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Users, ShoppingCart, Ruler, Package, Download, FileSpreadsheet, TrendingUp, DollarSign } from 'lucide-react';
import { Order, Client, InventoryItem } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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

  // --- EXPORTAÇÕES INDIVIDUAIS ---

  const exportClients = (format: 'pdf' | 'excel') => {
    if (format === 'pdf') {
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setFontSize(16);
      doc.text('WNFitas - Relatório de Cadastro de Clientes', 14, 20);
      autoTable(doc, {
        startY: 30,
        head: [['Nome / Razão Social', 'CNPJ / CPF', 'Telefone', 'E-mail']],
        body: clients.map(c => [c.name, c.cnpj, c.phone || '-', c.email || '-']),
      });
      doc.save(`relatorio-clientes.pdf`);
    } else {
      const ws = XLSX.utils.json_to_sheet(clients.map(c => ({
        'Nome / Razão Social': c.name, 
        'CNPJ / CPF': c.cnpj, 
        'Telefone': c.phone || '-', 
        'E-mail': c.email || '-'
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Clientes");
      XLSX.writeFile(wb, `relatorio-clientes.xlsx`);
    }
  };

  const exportOrders = (format: 'pdf' | 'excel') => {
    const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    if (format === 'pdf') {
      const doc = new jsPDF('l', 'mm', 'a4');
      doc.setFontSize(16);
      doc.text('WNFitas - Relatório de Pedidos Detalhado', 14, 20);
      autoTable(doc, {
        startY: 30,
        head: [['OP', 'Data', 'Prazo', 'Cliente', 'Produto', 'Larg.', 'Qtd', 'Status', 'Fita (m)', 'Papel (m)', 'Valor']],
        body: orders.map(o => [
          `#${o.opNumber}`, 
          new Date(o.date).toLocaleDateString('pt-BR'),
          new Date(o.deadline).toLocaleDateString('pt-BR'),
          o.clientName, 
          getProductLabel(o.items[0].productType),
          o.items[0].width,
          o.items[0].quantity,
          o.status.toUpperCase(),
          o.calculation.totalLinearMeters, 
          o.calculation.paperConsumptionMeters, 
          formatCurrency(o.totalValue)
        ]),
        styles: { fontSize: 8 }
      });
      doc.save(`pedidos-detalhado-wnfitas-${date}.pdf`);
    } else {
      const ws = XLSX.utils.json_to_sheet(orders.map(o => ({
        'OP': o.opNumber, 
        'Data': o.date,
        'Prazo': o.deadline,
        'Cliente': o.clientName, 
        'Produto': getProductLabel(o.items[0].productType),
        'Largura': o.items[0].width,
        'Quantidade': o.items[0].quantity,
        'Status': o.status,
        'Fita (m)': o.calculation.totalLinearMeters, 
        'Papel (m)': o.calculation.paperConsumptionMeters,
        'Custo Est. (R$)': o.calculation.estimatedCost,
        'Tempo Plotter': o.calculation.estimatedTimePlotter,
        'Tempo Calandra': o.calculation.estimatedTimeCalandra,
        'Valor Total (R$)': o.totalValue
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pedidos");
      XLSX.writeFile(wb, `pedidos-detalhado-wnfitas-${date}.xlsx`);
    }
  };

  const exportInventory = (format: 'pdf' | 'excel') => {
    const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    if (format === 'pdf') {
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setFontSize(16);
      doc.text('WNFitas - Relatório de Estoque Completo', 14, 20);
      autoTable(doc, {
        startY: 30,
        head: [['Item', 'Categoria', 'Qtd Atual', 'Unid.', 'Mínimo', 'Status']],
        body: inventory.map(i => [
          i.name, 
          i.category.toUpperCase(), 
          i.quantity, 
          i.unit, 
          i.minStock,
          i.quantity <= i.minStock ? 'CRÍTICO' : 'OK'
        ]),
        headStyles: { fillColor: [30, 41, 59] }
      });
      doc.save(`estoque-completo-wnfitas-${date}.pdf`);
    } else {
      const ws = XLSX.utils.json_to_sheet(inventory.map(i => ({
        'Item': i.name, 
        'Categoria': i.category, 
        'Quantidade Atual': i.quantity, 
        'Unidade': i.unit, 
        'Estoque Mínimo': i.minStock,
        'Status': i.quantity <= i.minStock ? 'Crítico' : 'Normal',
        'Localização': i.location || 'Não informada'
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Estoque");
      XLSX.writeFile(wb, `estoque-completo-wnfitas-${date}.xlsx`);
    }
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (activeTab === 'clientes') exportClients(format);
    else if (activeTab === 'pedidos') exportOrders(format);
    else if (activeTab === 'insumos') exportInventory(format);
    else {
      exportClients(format);
      exportOrders(format);
      exportInventory(format);
    }
  };

  const statusData = [
    { name: 'Orçamentos', value: orders.filter(o => o.status === 'orcamento').length },
    { name: 'Em Produção', value: orders.filter(o => ['impressao', 'calandra', 'finalizacao'].includes(o.status)).length },
    { name: 'Finalizados', value: orders.filter(o => o.status === 'concluido' || o.status === 'entregue').length },
  ];

  const COLORS = ['#334155', '#3b82f6', '#10b981', '#ef4444'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Relatórios e Análises</h2>
          <p className="text-slate-400">Acompanhe o desempenho e consumo da sua fábrica.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleExport('excel')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors shadow-lg shadow-emerald-900/20"
          >
            <FileSpreadsheet className="w-4 h-4" /> Exportar Excel
          </button>
          <button 
            onClick={() => handleExport('pdf')}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
        {(['geral', 'clientes', 'pedidos', 'insumos'] as const).map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {tab === 'insumos' ? 'Estoque' : tab === 'geral' ? 'Visão Geral' : tab}
          </button>
        ))}
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
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {statusData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
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
                <th className="px-6 py-4">Cliente / CNPJ</th>
                <th className="px-6 py-4">Telefone</th>
                <th className="px-6 py-4">E-mail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {clients.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-200">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.cnpj}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{c.phone || '---'}</td>
                  <td className="px-6 py-4 text-slate-300">{c.email || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'pedidos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">OP / Data</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Produto / Qtd</th>
                  <th className="px-6 py-4">Insumos</th>
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
                      <p className="text-slate-200 font-medium truncate max-w-[150px]">{o.clientName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-300 text-sm">{getProductLabel(o.items[0].productType)}</p>
                      <p className="text-[10px] text-slate-500">{o.items[0].quantity} un • {o.items[0].width}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-[10px] text-slate-400">
                        <p>Fita: {o.calculation.totalLinearMeters}m</p>
                        <p>Papel: {o.calculation.paperConsumptionMeters}m</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-400">{formatCurrency(o.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'insumos' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['fita', 'papel', 'acessorio'] as const).map(cat => (
            <div key={cat} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2 capitalize">
                {cat === 'fita' ? <Ruler className="w-5 h-5 text-blue-500" /> : cat === 'papel' ? <FileText className="w-5 h-5 text-amber-500" /> : <Package className="w-5 h-5 text-indigo-500" />}
                {cat === 'acessorio' ? 'Acabamentos' : cat}
              </h3>
              <div className="space-y-4">
                {inventory.filter(i => i.category === cat).map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-sm text-slate-300">{item.name}</span>
                    <span className={`font-bold ${item.quantity < item.minStock ? 'text-red-400' : 'text-emerald-400'}`}>
                      {item.quantity.toLocaleString('pt-BR')} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};