import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Calculator, ArrowRight, Save, Layers, Link as LinkIcon, Check, Info, Pencil, Trash2, Filter, Clock } from 'lucide-react';
import { calculateProduction } from '../services/calculator';
import { LanyardWidth, Order, OrderItem, PricingConfig, FinishingType, OrderFinishing, OrderStatus } from '../types';

interface OrdersProps {
  onNavigate: (view: string) => void;
  pricingConfig: PricingConfig;
  orders: Order[];
  onAddOrder: (order: Order) => void;
  onUpdateOrder: (order: Order) => void;
  onDeleteOrder: (id: string) => void;
}

// Helper para estado inicial dos acabamentos
interface FinishingState {
  selected: boolean;
  quantity: number;
}

type FinishingsMap = Record<FinishingType, FinishingState>;

// Helper formatting function for pt-BR currency display
const formatCurrency = (val: number, minimumFractionDigits = 2) => {
  return val.toLocaleString('pt-BR', { minimumFractionDigits, maximumFractionDigits: 2 });
};

// Helper for Status Labels and Colors
const getStatusConfig = (status: OrderStatus) => {
  switch (status) {
    case 'orcamento': return { label: 'Orçamento', color: 'bg-slate-800 text-slate-400 border-slate-700' };
    case 'aprovado': return { label: 'Aprovado', color: 'bg-emerald-950 text-emerald-400 border-emerald-900' };
    case 'impressao': return { label: 'Prod. (Plotter)', color: 'bg-blue-950 text-blue-400 border-blue-900' };
    case 'calandra': return { label: 'Prod. (Calandra)', color: 'bg-orange-950 text-orange-400 border-orange-900' };
    case 'finalizacao': return { label: 'Prod. (Acabam.)', color: 'bg-indigo-950 text-indigo-400 border-indigo-900' };
    case 'concluido': return { label: 'Finalizado', color: 'bg-green-600 text-white border-green-500' };
    case 'entregue': return { label: 'Entregue', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    case 'cancelado': return { label: 'Cancelado', color: 'bg-red-950 text-red-400 border-red-900' };
    default: return { label: status, color: 'bg-slate-800 text-slate-400' };
  }
};

export const Orders: React.FC<OrdersProps> = ({ onNavigate, pricingConfig, orders, onAddOrder, onUpdateOrder, onDeleteOrder }) => {
  const [viewMode, setViewMode] = useState<'list' | 'new'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [selectedClient, setSelectedClient] = useState('');
  const [width, setWidth] = useState<LanyardWidth>('20mm');
  const [quantity, setQuantity] = useState(100);
  const [deadline, setDeadline] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [appliedFactor, setAppliedFactor] = useState(1);
  const [priceBreakdown, setPriceBreakdown] = useState({ tape: 0, finishings: 0 });
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('orcamento');

  // Finishings State (Multi-select)
  const createInitialFinishingsState = () => {
    const state: FinishingsMap = {};
    pricingConfig.finishings.forEach(f => {
        state[f.name] = { selected: f.name === 'mosquetao', quantity: 1 };
    });
    return state;
  };

  const [finishings, setFinishings] = useState<FinishingsMap>(createInitialFinishingsState());
  
  useEffect(() => {
    setFinishings(prev => {
        const newState = { ...prev };
        pricingConfig.finishings.forEach(f => {
            if (!newState[f.name]) {
                newState[f.name] = { selected: false, quantity: 1 };
            }
        });
        return newState;
    });
  }, [pricingConfig.finishings]);

  const [calc, setCalc] = useState(calculateProduction('20mm', 100, pricingConfig));

  useEffect(() => {
    setCalc(calculateProduction(width, quantity, pricingConfig));
  }, [width, quantity, pricingConfig]);

  useEffect(() => {
    const basePrice = pricingConfig[width];
    let finishingsPrice = 0;
    pricingConfig.finishings.forEach(item => {
      const state = finishings[item.name];
      if (state && state.selected) {
        finishingsPrice += (item.price * state.quantity);
      }
    });

    const rule = pricingConfig.quantityRules.find(r => quantity >= r.min && quantity <= r.max);
    const factor = rule ? rule.factor : 1;
    setAppliedFactor(factor);

    const tapeCostAdjusted = basePrice * factor;
    const rawPrice = tapeCostAdjusted + finishingsPrice;
    const taxMultiplier = 1 + (pricingConfig.taxRate / 100);
    const finalPrice = rawPrice * taxMultiplier;

    setPriceBreakdown({ tape: tapeCostAdjusted, finishings: finishingsPrice });
    setUnitPrice(parseFloat(finalPrice.toFixed(3)));
  }, [width, finishings, pricingConfig, quantity]);

  const toggleFinishing = (type: FinishingType) => {
    setFinishings(prev => ({
      ...prev,
      [type]: { ...prev[type], selected: !prev[type].selected }
    }));
  };

  const updateFinishingQuantity = (type: FinishingType, qty: number) => {
    setFinishings(prev => ({
      ...prev,
      [type]: { ...prev[type], quantity: Math.max(1, qty) }
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedClient('');
    setWidth('20mm');
    setQuantity(100);
    setDeadline('');
    setCurrentStatus('orcamento');
    setFinishings(createInitialFinishingsState());
  };

  const handleEdit = (order: Order) => {
    setEditingId(order.id);
    setSelectedClient(order.clientId);
    setDeadline(order.deadline);
    setCurrentStatus(order.status);
    const item = order.items[0];
    setWidth(item.width);
    setQuantity(item.quantity);
    const newFinishingsState = createInitialFinishingsState();
    Object.keys(newFinishingsState).forEach(k => {
      newFinishingsState[k] = { selected: false, quantity: 1 };
    });
    item.finishings.forEach(f => {
      if (newFinishingsState[f.type]) {
          newFinishingsState[f.type] = { selected: true, quantity: f.quantity };
      }
    });
    setFinishings(newFinishingsState);
    setViewMode('new');
  };

  const handleSave = (forceStatus?: OrderStatus) => {
    if (!selectedClient) {
      alert("Por favor, selecione um cliente.");
      return;
    }
    const finalStatus = forceStatus || currentStatus;
    const activeFinishings: OrderFinishing[] = [];
    pricingConfig.finishings.forEach(item => {
      if (finishings[item.name]?.selected) {
        activeFinishings.push({ type: item.name, quantity: finishings[item.name].quantity });
      }
    });

    const orderData: Order = {
      id: editingId || `OP-${Date.now()}`,
      opNumber: editingId ? orders.find(o => o.id === editingId)?.opNumber : String(Math.floor(Math.random() * 9000) + 1000),
      clientId: selectedClient,
      clientName: orders.find(o => o.clientId === selectedClient)?.clientName || 'Cliente',
      date: editingId ? orders.find(o => o.id === editingId)?.date || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      deadline: deadline || new Date().toISOString().split('T')[0],
      status: finalStatus,
      totalValue: unitPrice * quantity,
      calculation: calc,
      items: [{ width, quantity, unitPrice, colorBase: 'Branco', finishings: activeFinishings }]
    };

    if (editingId) onUpdateOrder(orderData);
    else onAddOrder(orderData);
    setViewMode('list');
    resetForm();
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || (order.opNumber && order.opNumber.includes(searchTerm));
    let matchesStatus = true;
    if (statusFilter === 'producao') matchesStatus = ['impressao', 'calandra', 'finalizacao'].includes(order.status);
    else if (statusFilter === 'finalizados') matchesStatus = ['concluido', 'entregue'].includes(order.status);
    else if (statusFilter === 'cancelados') matchesStatus = order.status === 'cancelado';
    return matchesSearch && matchesStatus;
  });

  if (viewMode === 'new') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-100">{editingId ? 'Editar Pedido' : 'Novo Pedido'}</h2>
          <button onClick={() => setViewMode('list')} className="text-slate-400 hover:text-white">Cancelar</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200" value={currentStatus} onChange={e => setCurrentStatus(e.target.value as OrderStatus)}>
                  <option value="orcamento">Orçamento</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="impressao">Impressão</option>
                  <option value="calandra">Calandra</option>
                  <option value="finalizacao">Finalização</option>
                  <option value="concluido">Concluído</option>
                  <option value="entregue">Entregue</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Largura</label>
                  <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200" value={width} onChange={e => setWidth(e.target.value as LanyardWidth)}>
                    <option value="15mm">15mm</option>
                    <option value="20mm">20mm</option>
                    <option value="25mm">25mm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Quantidade</label>
                  <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                </div>
              </div>
            </div>
            <button onClick={() => handleSave()} className="w-full bg-blue-600 py-3 rounded-lg font-medium">Salvar Pedido</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-100">Pedidos</h2>
        <button onClick={() => setViewMode('new')} className="bg-blue-600 px-4 py-2 rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> Novo Pedido</button>
      </div>
      <div className="grid gap-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-100">#{order.opNumber} - {order.clientName}</p>
              <p className="text-sm text-slate-500">{order.items[0].quantity}x {order.items[0].width} - {order.status}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(order)} className="p-2 hover:bg-slate-800 rounded"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => onDeleteOrder(order.id)} className="p-2 hover:bg-red-900/20 text-red-400 rounded"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};