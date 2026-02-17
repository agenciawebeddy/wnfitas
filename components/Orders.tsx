import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Calculator, ArrowRight, Save, Layers, Link as LinkIcon, Check, Info, Pencil, Trash2, Filter, Clock } from 'lucide-react';
import { MOCK_CLIENTS } from '../constants';
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
  // Construct dynamic initial state based on config
  const createInitialFinishingsState = () => {
    const state: FinishingsMap = {};
    pricingConfig.finishings.forEach(f => {
        // Set Default: 'mosquetao' starts true if it exists, else false
        state[f.name] = { selected: f.name === 'mosquetao', quantity: 1 };
    });
    return state;
  };

  const [finishings, setFinishings] = useState<FinishingsMap>(createInitialFinishingsState());
  
  // Update finishings state if pricing config changes (e.g. new items added)
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

  // Real-time calculation state
  const [calc, setCalc] = useState(calculateProduction('20mm', 100, pricingConfig));

  useEffect(() => {
    setCalc(calculateProduction(width, quantity, pricingConfig));
  }, [width, quantity, pricingConfig]);

  // Update unit price when width or finishings change based on config
  useEffect(() => {
    const basePrice = pricingConfig[width];
    
    // Sum cost of all selected finishings * their quantity
    let finishingsPrice = 0;
    
    // Iterate over the dynamic list from config
    pricingConfig.finishings.forEach(item => {
      const state = finishings[item.name];
      if (state && state.selected) {
        finishingsPrice += (item.price * state.quantity);
      }
    });

    // Find Quantity Factor
    const rule = pricingConfig.quantityRules.find(r => quantity >= r.min && quantity <= r.max);
    const factor = rule ? rule.factor : 1; // Default to 1 if no rule matches
    
    setAppliedFactor(factor);

    // Calculation: ((TapeBase * Factor) + Finishings) * (1 + Tax Rate)
    // O fator aplica-se apenas à fita (processo fabril), não aos acabamentos (peças prontas).
    const tapeCostAdjusted = basePrice * factor;
    const rawPrice = tapeCostAdjusted + finishingsPrice;
    
    const taxMultiplier = 1 + (pricingConfig.taxRate / 100);
    const finalPrice = rawPrice * taxMultiplier;

    setPriceBreakdown({
      tape: tapeCostAdjusted,
      finishings: finishingsPrice
    });

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
    
    // Assuming single item per order for now as per data structure
    const item = order.items[0];
    setWidth(item.width);
    setQuantity(item.quantity);

    // Reconstruct finishings map
    const newFinishingsState = createInitialFinishingsState();
    
    // Reset all to false first
    Object.keys(newFinishingsState).forEach(k => {
      newFinishingsState[k] = { selected: false, quantity: 1 };
    });

    item.finishings.forEach(f => {
      // Check if finishing still exists in config
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

    const clientObj = MOCK_CLIENTS.find(c => c.id === selectedClient);
    
    // Convert Finishings Map to OrderFinishing[]
    const activeFinishings: OrderFinishing[] = [];
    pricingConfig.finishings.forEach(item => {
      if (finishings[item.name]?.selected) {
        activeFinishings.push({
          type: item.name,
          quantity: finishings[item.name].quantity
        });
      }
    });

    // Use forced status (e.g. clicking "Aprovar") or the dropdown selection
    const finalStatus = forceStatus || currentStatus;

    const orderData: Order = {
      id: editingId || `OP-${Date.now()}`,
      opNumber: editingId ? orders.find(o => o.id === editingId)?.opNumber : String(Math.floor(Math.random() * 9000) + 1000),
      clientId: selectedClient,
      clientName: clientObj?.name || 'Cliente Desconhecido',
      date: editingId ? orders.find(o => o.id === editingId)?.date || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      deadline: deadline || new Date().toISOString().split('T')[0],
      status: finalStatus,
      totalValue: unitPrice * quantity,
      calculation: calc,
      items: [
        {
          width: width,
          quantity: quantity,
          unitPrice: unitPrice,
          colorBase: 'Branco', // Default
          finishings: activeFinishings
        }
      ]
    };

    if (editingId) {
      onUpdateOrder(orderData);
    } else {
      onAddOrder(orderData);
    }

    setViewMode('list');
    resetForm();
  };

  const handleCancel = () => {
    setViewMode('list');
    resetForm();
  };

  const handleDeleteClick = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation(); // Previne eventos de clique no card pai
    if (window.confirm(`Tem certeza que deseja excluir o Pedido #${order.opNumber || '---'} de ${order.clientName}?`)) {
        onDeleteOrder(order.id);
    }
  };

  // Helper to display finishings in list view
  const formatFinishingsList = (items: any[]) => {
    if (!items || !items[0].finishings) return '---';
    return items[0].finishings.map((f: any) => `${f.type} (${f.quantity})`).join(', ');
  };

  // Filter orders for list view
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (order.opNumber && order.opNumber.includes(searchTerm));
    
    let matchesStatus = true;
    if (statusFilter === 'producao') {
      matchesStatus = ['impressao', 'calandra', 'finalizacao'].includes(order.status);
    } else if (statusFilter === 'finalizados') {
      matchesStatus = ['concluido', 'entregue'].includes(order.status);
    } else if (statusFilter === 'cancelados') {
      matchesStatus = order.status === 'cancelado';
    } else if (statusFilter !== 'todos') {
      // Direct match if we added more specific filters later
      matchesStatus = true; 
    }

    return matchesSearch && matchesStatus;
  });

  if (viewMode === 'new') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-100">
            {editingId ? 'Editar Pedido' : 'Novo Pedido / Orçamento'}
          </h2>
          <button 
            onClick={handleCancel}
            className="text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: FORM */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-6">
            <h3 className="text-lg font-medium text-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Dados do Pedido
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Cliente</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  <option value="">Selecione um cliente...</option>
                  {MOCK_CLIENTS.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Status do Pedido</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={currentStatus}
                    onChange={(e) => setCurrentStatus(e.target.value as OrderStatus)}
                  >
                    <option value="orcamento">Orçamento</option>
                    <option value="aprovado">Aprovado (Fila)</option>
                    <option value="impressao">Produção (Plotter)</option>
                    <option value="calandra">Produção (Calandra)</option>
                    <option value="finalizacao">Produção (Finalização)</option>
                    <option value="concluido">Finalizado</option>
                    <option value="entregue">Entregue</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Prazo Entrega</label>
                  <input 
                    type="date" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Largura Fita</label>
                <div className="grid grid-cols-3 gap-2">
                  {['15mm', '20mm', '25mm'].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWidth(w as LanyardWidth)}
                      className={`p-2 text-sm rounded-md border ${width === w ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Quantidade Total (Lanyards)</label>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center justify-between">
                    Valor Unitário Final (R$)
                    <div className="flex gap-2">
                      {pricingConfig.taxRate > 0 && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          + {String(pricingConfig.taxRate).replace('.', ',')}% Imp.
                        </span>
                      )}
                    </div>
                  </label>
                  <input 
                    type="text"
                    value={formatCurrency(unitPrice)}
                    readOnly
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-emerald-400 font-bold outline-none cursor-default"
                  />
                  <div className="text-xs text-slate-500 mt-1 text-right flex flex-col gap-0.5">
                    <span>((Fita x {String(appliedFactor).replace('.', ',')}) + Acab.) + Imposto</span>
                    {priceBreakdown.tape > 0 && (
                       <span className="opacity-70">
                         Fita: {formatCurrency(priceBreakdown.tape)} | Acab: {formatCurrency(priceBreakdown.finishings)}
                       </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-slate-500" />
                  Acabamentos e Montagem
                </label>
                <div className="bg-slate-950 border border-slate-700 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 bg-slate-800/50 p-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <div className="col-span-1 text-center">Sel.</div>
                    <div className="col-span-5">Tipo</div>
                    <div className="col-span-3 text-right">Preço Un.</div>
                    <div className="col-span-3 text-center">Qtd/Cordão</div>
                  </div>
                  <div className="divide-y divide-slate-800/50">
                    {pricingConfig.finishings.map((item) => {
                      const type = item.name;
                      const currentState = finishings[type] || { selected: false, quantity: 1 };
                      
                      return (
                      <div key={type} className={`grid grid-cols-12 gap-2 p-2 items-center transition-colors ${currentState.selected ? 'bg-blue-900/10' : ''}`}>
                        <div className="col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => toggleFinishing(type)}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all
                              ${currentState.selected 
                                ? 'bg-blue-500 border-blue-500 text-white' 
                                : 'bg-slate-900 border-slate-600 hover:border-slate-500'}`}
                          >
                            {currentState.selected && <Check className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="col-span-5">
                          <span className={`text-sm capitalize ${currentState.selected ? 'text-blue-200 font-medium' : 'text-slate-400'}`}>
                            {type}
                          </span>
                        </div>
                        <div className="col-span-3 text-right">
                          <span className="text-sm text-slate-500">R$ {formatCurrency(item.price)}</span>
                        </div>
                        <div className="col-span-3 px-1">
                          <input 
                            type="number"
                            min="1"
                            disabled={!currentState.selected}
                            value={currentState.quantity}
                            onChange={(e) => updateFinishingQuantity(type, parseInt(e.target.value))}
                            className={`w-full text-center text-sm py-1 rounded bg-slate-900 border 
                              ${currentState.selected ? 'border-slate-600 text-slate-200' : 'border-transparent text-slate-600'}`}
                          />
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Upload da Arte</label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500/50 hover:bg-slate-800/50 transition cursor-pointer">
                   <p className="text-slate-500 text-sm">Arraste o arquivo ou clique aqui</p>
                   <p className="text-slate-600 text-xs mt-1">PDF, CDR, AI</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-800 flex gap-3">
              <button 
                onClick={() => handleSave()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> 
                {editingId ? 'Salvar Alterações' : 'Salvar Orçamento'}
              </button>
              {!editingId && (
                <button 
                  onClick={() => handleSave('impressao')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  title="Aprova o pedido e deduz do estoque automaticamente"
                >
                  <ArrowRight className="w-4 h-4" /> Aprovar & Gerar OP
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: CALCULATOR */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-blue-900/30 ring-1 ring-blue-900/20">
              <h3 className="text-lg font-medium text-blue-100 flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-blue-400" />
                Simulação Automática de Produção
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                  <span className="text-xs text-slate-500 block uppercase">Fita Total (Metros)</span>
                  <span className="text-2xl font-bold text-white">{calc.totalLinearMeters}m</span>
                </div>
                 <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 relative overflow-hidden">
                  <span className="text-xs text-slate-500 block uppercase">Papel (Metros Lineares)</span>
                  
                  <div className="mt-2 space-y-1.5">
                     <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-1">
                        <span className="text-slate-400">Frente</span>
                        <span className="font-bold text-emerald-400">{String(calc.paperMetersPerSide).replace('.', ',')}m</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Verso</span>
                        <span className="font-bold text-emerald-400">{String(calc.paperMetersPerSide).replace('.', ',')}m</span>
                     </div>
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-slate-800">
                     <span className="text-xs text-slate-400 block">{calc.paperRows} artes por fileira</span>
                     <span className="text-xs text-blue-400 font-medium block mt-0.5">Bobina {width === '25mm' ? '220mm' : '150mm'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between text-sm py-2 border-b border-slate-700/50">
                    <span className="text-slate-400">Consumo de Tinta Estimado</span>
                    <span className="text-slate-200 font-medium">{String(calc.inkConsumptionLitres).replace('.', ',')} L</span>
                 </div>
                 <div className="flex justify-between text-sm py-2 border-b border-slate-700/50">
                    <span className="text-slate-400">Custo Total Insumos (Est.)</span>
                    <span className="text-slate-200 font-medium">R$ {formatCurrency(calc.estimatedCost)}</span>
                 </div>
                 <div className="flex justify-between text-sm py-2 border-b border-slate-700/50">
                    <span className="text-slate-400">Valor Total Venda</span>
                    <span className="text-blue-400 font-bold">R$ {formatCurrency(unitPrice * quantity)}</span>
                 </div>
                 <div className="flex justify-between text-sm py-2 border-b border-slate-700/50">
                    <span className="text-slate-400">Margem Estimada</span>
                    <span className="text-emerald-400 font-bold">
                       {unitPrice > 0 ? String((((unitPrice * quantity) - calc.estimatedCost) / (unitPrice * quantity) * 100).toFixed(1)).replace('.', ',') : 0}%
                    </span>
                 </div>
              </div>

              {/* ESTIMATIVA DE TEMPO (NOVO) */}
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                     <Clock className="w-3.5 h-3.5" /> Tempo de Produção Estimado
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <span className="text-xs text-blue-400 block mb-0.5">Plotter</span>
                        <span className="text-lg font-medium text-slate-200">{calc.estimatedTimePlotter}</span>
                     </div>
                     <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <span className="text-xs text-orange-400 block mb-0.5">Calandra</span>
                        <span className="text-lg font-medium text-slate-200">{calc.estimatedTimeCalandra}</span>
                     </div>
                  </div>
              </div>

              <div className="mt-6 p-4 bg-amber-900/20 border border-amber-900/30 rounded-lg">
                <p className="text-xs text-amber-200">
                  <span className="font-bold">Atenção:</span> O cálculo inclui 5% de margem de segurança para o papel e quebra de produção.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-slate-100">Pedidos</h2>
           <p className="text-slate-400">Gerencie orçamentos e ordens de produção.</p>
        </div>
        <button 
          onClick={() => {
             resetForm();
             setViewMode('new');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
        >
          <Plus className="w-5 h-5" /> Novo Pedido
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por cliente, OP ou status..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-8 py-3 text-slate-200 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="todos">Todos Status</option>
            <option value="producao">Em Produção</option>
            <option value="finalizados">Finalizados / Entregues</option>
            <option value="cancelados">Cancelados</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredOrders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          
          return (
            <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group">
              <div className="flex items-start gap-4">
                <div className="bg-slate-800 p-3 rounded-lg text-slate-400 font-mono font-bold text-lg">
                  #{order.opNumber || '---'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">{order.clientName}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                    <span>{order.date}</span>
                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                    <span>{order.items[0].quantity}x {order.items[0].width}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-500 capitalize italic truncate max-w-[200px]">
                      {formatFinishingsList(order.items)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                 <div className="text-right hidden sm:block mr-2">
                    <span className="block text-xs text-slate-500 uppercase">Valor Total</span>
                    <span className="font-medium text-slate-200">R$ {formatCurrency(order.totalValue)}</span>
                 </div>
                 
                 <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${statusConfig.color}`}>
                    {statusConfig.label}
                 </span>
                 
                 <div className="flex gap-2">
                   <button 
                    onClick={() => handleEdit(order)}
                    className="p-2 hover:bg-blue-900/30 rounded-lg text-slate-400 hover:text-blue-400 transition" 
                    title="Editar"
                   >
                      <Pencil className="w-4 h-4" />
                   </button>
                   <button 
                    onClick={(e) => handleDeleteClick(e, order)}
                    className="p-2 hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-400 transition" 
                    title="Excluir"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};