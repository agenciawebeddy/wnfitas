import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Calculator, ArrowRight, Save, Layers, Link as LinkIcon, Check, Info, Pencil, Trash2, Filter, Clock, Printer, Flame, AlertTriangle, Upload, ShoppingCart } from 'lucide-react';
import { calculateProduction } from '../services/calculator';
import { LanyardWidth, Order, OrderItem, PricingConfig, FinishingType, OrderFinishing, OrderStatus, Client, InventoryItem, ProductType } from '../types';

interface OrdersProps {
  onNavigate: (view: string) => void;
  pricingConfig: PricingConfig;
  orders: Order[];
  clients: Client[];
  inventory: InventoryItem[];
  onAddOrder: (order: Order) => void;
  onUpdateOrder: (order: Order) => void;
  onDeleteOrder: (id: string) => void;
}

interface FinishingState {
  selected: boolean;
  quantity: number;
}

type FinishingsMap = Record<FinishingType, FinishingState>;

const formatCurrency = (val: number, minimumFractionDigits = 2) => {
  return val.toLocaleString('pt-BR', { minimumFractionDigits, maximumFractionDigits: 2 });
};

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

export const Orders: React.FC<OrdersProps> = ({ onNavigate, pricingConfig, orders, clients, inventory, onAddOrder, onUpdateOrder, onDeleteOrder }) => {
  const [viewMode, setViewMode] = useState<'list' | 'new'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedClient, setSelectedClient] = useState('');
  const [productType, setProductType] = useState<ProductType>('tirante');
  const [width, setWidth] = useState<LanyardWidth>('20mm');
  const [quantity, setQuantity] = useState(100);
  const [deadline, setDeadline] = useState('');
  const [unitPrice, setUnitPrice] = useState(0);
  const [appliedFactor, setAppliedFactor] = useState(1);
  const [priceBreakdown, setPriceBreakdown] = useState({ tape: 0, finishings: 0 });
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>('orcamento');

  const createInitialFinishingsState = (orderQty: number) => {
    const state: FinishingsMap = {};
    pricingConfig.finishings.forEach(f => {
        state[f.name] = { selected: f.name === 'mosquetao', quantity: orderQty };
    });
    return state;
  };

  const [finishings, setFinishings] = useState<FinishingsMap>(createInitialFinishingsState(100));
  
  useEffect(() => {
    setFinishings(prev => {
        const newState = { ...prev };
        pricingConfig.finishings.forEach(f => {
            if (!newState[f.name]) {
                newState[f.name] = { selected: false, quantity: quantity };
            }
        });
        return newState;
    });
  }, [pricingConfig.finishings, quantity]);

  const [calc, setCalc] = useState(calculateProduction('tirante', '20mm', 100, pricingConfig));

  useEffect(() => {
    setCalc(calculateProduction(productType, width, quantity, pricingConfig));
  }, [productType, width, quantity, pricingConfig]);

  useEffect(() => {
    const basePrice = pricingConfig.prices[productType][width];
    
    let totalFinishingsCost = 0;
    pricingConfig.finishings.forEach(item => {
      const state = finishings[item.name];
      if (state && state.selected) {
        totalFinishingsCost += (item.price * state.quantity);
      }
    });

    const rule = pricingConfig.quantityRules.find(r => quantity >= r.min && quantity <= r.max);
    const factor = rule ? rule.factor : 1;
    setAppliedFactor(factor);

    const tapeCostAdjusted = basePrice * factor;
    const avgFinishingCost = quantity > 0 ? totalFinishingsCost / quantity : 0;
    
    const rawPrice = tapeCostAdjusted + avgFinishingCost;
    const taxMultiplier = 1 + (pricingConfig.taxRate / 100);
    const finalPrice = rawPrice * taxMultiplier;

    setPriceBreakdown({ tape: tapeCostAdjusted, finishings: avgFinishingCost });
    setUnitPrice(parseFloat(finalPrice.toFixed(3)));
  }, [width, finishings, pricingConfig, quantity, productType]);

  const [stockValidation, setStockValidation] = useState<{ isValid: boolean; missingItems: string[] }>({ isValid: true, missingItems: [] });

  useEffect(() => {
    const missing: string[] = [];
    const findItem = (namePart: string, category: string) => {
      return inventory.find(i => 
        i.name.toLowerCase().includes(namePart.toLowerCase()) || 
        (i.category === category && i.name.toLowerCase().includes(width.toLowerCase()))
      );
    };

    const formatStock = (qty: number) => qty.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

    const tapeItem = findItem(`Fita Poliéster ${width}`, 'fita');
    if (!tapeItem) {
      missing.push(`Fita ${width} não encontrada no estoque`);
    } else if (tapeItem.quantity < calc.totalLinearMeters) {
      missing.push(`Fita ${width} insuficiente (${formatStock(tapeItem.quantity)}m / Nec: ${formatStock(calc.totalLinearMeters)}m)`);
    }

    const paperWidth = (productType === 'tirante' && width === '25mm') ? '22cm' : '15cm';
    const paperItem = inventory.find(i => i.category === 'papel' && i.name.includes(paperWidth));
    if (!paperItem) {
      missing.push(`Papel Bobina ${paperWidth} não encontrado`);
    } else if (paperItem.quantity < calc.paperConsumptionMeters) {
      missing.push(`Papel ${paperWidth} insuficiente (${formatStock(paperItem.quantity)}m / Nec: ${formatStock(calc.paperConsumptionMeters)}m)`);
    }

    pricingConfig.finishings.forEach(f => {
      if (finishings[f.name]?.selected) {
        const needed = finishings[f.name].quantity;
        const stockItem = inventory.find(i => 
          i.name.toLowerCase().includes(f.name.toLowerCase()) || 
          (i.category === 'acessorio' && i.name.toLowerCase().includes(f.name.toLowerCase()))
        );

        if (!stockItem) {
          missing.push(`Acabamento "${f.name}" não encontrado`);
        } else if (stockItem.quantity < needed) {
          missing.push(`${stockItem.name} insuficiente (${stockItem.quantity} un / Nec: ${needed} un)`);
        }
      }
    });

    setStockValidation({
      isValid: missing.length === 0,
      missingItems: missing
    });
  }, [width, quantity, calc, finishings, inventory, pricingConfig, productType]);

  const toggleFinishing = (type: FinishingType) => {
    setFinishings(prev => {
      const isSelecting = !prev[type].selected;
      return {
        ...prev,
        [type]: { 
          ...prev[type], 
          selected: isSelecting,
          quantity: isSelecting ? quantity : prev[type].quantity 
        }
      };
    });
  };

  const updateFinishingQuantity = (type: FinishingType, qty: number) => {
    setFinishings(prev => ({
      ...prev,
      [type]: { ...prev[type], quantity: Math.max(0, qty) }
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setSelectedClient('');
    setProductType('tirante');
    setWidth('20mm');
    setQuantity(100);
    setDeadline('');
    setCurrentStatus('orcamento');
    setFinishings(createInitialFinishingsState(100));
  };

  const handleEdit = (order: Order) => {
    setEditingId(order.id);
    setSelectedClient(order.clientId);
    setDeadline(order.deadline);
    setCurrentStatus(order.status);
    const item = order.items[0];
    setProductType(item.productType || 'tirante');
    setWidth(item.width);
    setQuantity(item.quantity);
    const newFinishingsState = createInitialFinishingsState(item.quantity);
    Object.keys(newFinishingsState).forEach(k => {
      newFinishingsState[k] = { selected: false, quantity: item.quantity };
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

    if (!stockValidation.isValid) {
      alert("Não é possível gerar o pedido. Itens insuficientes no estoque:\n\n" + stockValidation.missingItems.join('\n'));
      return;
    }

    const finalStatus = forceStatus || currentStatus;
    const activeFinishings: OrderFinishing[] = [];
    pricingConfig.finishings.forEach(item => {
      if (finishings[item.name]?.selected) {
        activeFinishings.push({ type: item.name, quantity: finishings[item.name].quantity });
      }
    });

    const client = clients.find(c => c.id === selectedClient);

    const orderData: any = {
      clientId: selectedClient,
      clientName: client?.name || 'Cliente',
      deadline: deadline || new Date().toISOString().split('T')[0],
      status: finalStatus,
      totalValue: unitPrice * quantity,
      calculation: calc,
      items: [{ productType, width, quantity, unitPrice, colorBase: 'Branco', finishings: activeFinishings }]
    };

    if (editingId) {
      orderData.id = editingId;
      onUpdateOrder(orderData as Order);
    } else {
      onAddOrder(orderData as Order);
    }
    
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
    const totalSale = unitPrice * quantity;
    const margin = totalSale > 0 ? ((totalSale - calc.estimatedCost) / totalSale) * 100 : 0;

    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-100">{editingId ? 'Editar Pedido' : 'Novo Pedido / Orçamento'}</h2>
          <button 
            onClick={() => {
              resetForm();
              setViewMode('list');
            }} 
            className="text-slate-400 hover:text-white text-sm font-medium"
          >
            Cancelar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-6">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <FileText className="w-5 h-5" />
                <h3 className="font-bold text-slate-100">Dados do Pedido</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1.5">Cliente</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    value={selectedClient}
                    onChange={e => setSelectedClient(e.target.value)}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1.5">Tipo de Produto</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={productType}
                      onChange={e => setProductType(e.target.value as ProductType)}
                    >
                      <option value="tirante">Tirantes (Crachá/Medalha)</option>
                      <option value="chaveiro">Chaveiros</option>
                      <option value="pulseira">Pulseiras</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1.5">Prazo Entrega</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={deadline}
                      onChange={e => setDeadline(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1.5">Status do Pedido</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={currentStatus}
                      onChange={e => setCurrentStatus(e.target.value as OrderStatus)}
                    >
                      <option value="orcamento">Orçamento</option>
                      <option value="aprovado">Aprovado</option>
                      <option value="impressao">Impressão</option>
                      <option value="calandra">Calandra</option>
                      <option value="finalizacao">Finalização</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Largura Fita</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['15mm', '20mm', '25mm'] as LanyardWidth[]).map(w => (
                        <button
                          key={w}
                          onClick={() => setWidth(w)}
                          className={`py-2.5 rounded-lg text-sm font-bold transition-all border ${width === w ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1.5">Quantidade Total (Unidades)</label>
                    <input 
                      type="number" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      value={quantity}
                      onChange={e => setQuantity(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase mb-1.5">Valor Unitário Final (R$) <span className="text-slate-600 ml-1">+ {pricingConfig.taxRate}% Imp.</span></label>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                      <span className="text-emerald-400 font-bold text-lg">{formatCurrency(unitPrice)}</span>
                      <div className="text-[10px] text-slate-600 mt-1 leading-tight">
                        ((Fita x {appliedFactor.toFixed(2)}) + Acab.) + Imposto<br/>
                        Fita: {formatCurrency(priceBreakdown.tape)} | Acab: {formatCurrency(priceBreakdown.finishings)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center gap-2 text-blue-400 mb-4">
                  <LinkIcon className="w-5 h-5" />
                  <h3 className="font-bold text-slate-100">Acabamentos e Montagem</h3>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900/50 text-slate-500 uppercase font-bold">
                      <tr>
                        <th className="px-4 py-3 w-10">Sel.</th>
                        <th className="px-2 py-3">Tipo</th>
                        <th className="px-4 py-3 text-right">Preço Un.</th>
                        <th className="px-4 py-3 text-center w-32">Qtd Total Pedido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {pricingConfig.finishings.map(item => {
                        const state = finishings[item.name];
                        return (
                          <tr key={item.name} className={`hover:bg-slate-900/30 transition-colors ${state?.selected ? 'bg-blue-900/5' : ''}`}>
                            <td className="px-4 py-3">
                              <input 
                                type="checkbox" 
                                checked={state?.selected}
                                onChange={() => toggleFinishing(item.name)}
                                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-2 py-3 font-medium text-slate-300">{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</td>
                            <td className="px-4 py-3 text-right text-slate-500">R$ {formatCurrency(item.price)}</td>
                            <td className="px-4 py-3">
                              <input 
                                type="number" 
                                disabled={!state?.selected}
                                value={state?.quantity || 0}
                                onChange={e => updateFinishingQuantity(item.name, Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-center text-slate-200 disabled:opacity-30 font-bold"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-4">
                <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Upload da Arte</label>
                <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center hover:border-slate-700 transition-colors cursor-pointer group">
                  <Upload className="w-8 h-8 text-slate-700 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                  <p className="text-sm text-slate-500">Arraste o arquivo PDF/AI ou clique para selecionar</p>
                </div>
              </div>

              <div className="pt-6">
                {!stockValidation.isValid && (
                  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-red-400 uppercase mb-1">Estoque Insuficiente</p>
                      <ul className="text-[11px] text-red-200/70 list-disc list-inside">
                        {stockValidation.missingItems.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
                <button 
                  onClick={() => handleSave()}
                  disabled={!stockValidation.isValid}
                  className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2
                    ${stockValidation.isValid 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
                  `}
                >
                  <Save className="w-5 h-5" /> {editingId ? 'Salvar Alterações' : 'Gerar Pedido / Orçamento'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-6 sticky top-6">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Calculator className="w-5 h-5" />
                <h3 className="font-bold text-slate-100">Simulação Automática de Produção</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Fita Total (Metros)</p>
                  <p className="text-3xl font-bold text-slate-100">{calc.totalLinearMeters}m</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Papel (Metros Lineares)</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Frente</span>
                      <span className="text-emerald-400 font-bold">{calc.paperMetersPerSide}m</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Verso</span>
                      <span className="text-emerald-400 font-bold">{calc.paperMetersPerSide}m</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-800/50 text-[10px]">
                    <span className="text-slate-600">5 artes por fileira</span><br/>
                    <span className="text-blue-400 font-bold">Bobina {(productType === 'tirante' && width === '25mm') ? '22cm' : '15cm'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Custo Total Insumos (Est.)</span>
                  <span className="text-slate-200 font-bold">R$ {formatCurrency(calc.estimatedCost)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-800/50">
                  <span className="text-slate-500">Valor Total Venda</span>
                  <span className="text-blue-400 font-bold text-lg">R$ {formatCurrency(totalSale)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Margem Estimada</span>
                  <span className={`font-bold ${margin > 50 ? 'text-emerald-400' : 'text-orange-400'}`}>{margin.toFixed(1)}%</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center gap-2 text-slate-500 mb-4">
                  <Clock className="w-4 h-4" />
                  <h4 className="text-[10px] font-bold uppercase tracking-wider">Tempo de Produção Estimado</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-blue-500 uppercase mb-1">Plotter</p>
                    <p className="text-xl font-bold text-slate-100">{calc.estimatedTimePlotter}</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-orange-500 uppercase mb-1">Calandra</p>
                    <p className="text-xl font-bold text-slate-100">{calc.estimatedTimeCalandra}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Pedidos</h2>
          <p className="text-slate-400">Gerencie orçamentos e ordens de produção.</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setViewMode('new');
          }} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-blue-900/20 transition-all"
        >
          <Plus className="w-5 h-5" /> Novo Pedido
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou OP..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          {(['todos', 'producao', 'finalizados', 'cancelados'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-md text-xs font-bold uppercase transition-all ${statusFilter === f ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredOrders.map(order => {
          const status = getStatusConfig(order.status);
          return (
            <div key={order.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-950 rounded-lg flex items-center justify-center text-blue-500 border border-slate-800">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">OP #{order.opNumber}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${status.color}`}>{status.label}</span>
                  </div>
                  <p className="font-bold text-slate-100 text-lg">{order.clientName}</p>
                  <p className="text-xs text-slate-500">
                    {order.items[0].productType === 'tirante' ? 'Tirante' : order.items[0].productType === 'chaveiro' ? 'Chaveiro' : 'Pulseira'} • {order.items[0].quantity} un • {order.items[0].width}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-1">Valor Total</p>
                  <p className="text-xl font-bold text-emerald-400">R$ {formatCurrency(order.totalValue)}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(order)} 
                    className="p-2.5 bg-slate-800 hover:bg-blue-900/30 text-slate-400 hover:text-blue-400 rounded-lg transition-all"
                    title="Editar Pedido"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => onDeleteOrder(order.id)} 
                    className="p-2.5 bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                    title="Excluir Pedido"
                  >
                    <Trash2 className="w-5 h-5" />
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