import React, { useState } from 'react';
import { LayoutDashboard, Users, ShoppingCart, Printer, Package, Settings as SettingsIcon, Menu, X, Bell, Plus, History, ArrowDown, Trash2 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Orders } from './components/Orders';
import { Production } from './components/Production';
import { Settings } from './components/Settings';
import { Clients } from './components/Clients';
import { PricingConfig, Order, Client, InventoryItem } from './types';

// Simple Inventory View inline for brevity as requested by "handful of files" constraint 
// while keeping the big modules separate
import { MOCK_INVENTORY, MOCK_ORDERS, MOCK_CLIENTS } from './constants';

const Inventory: React.FC<{ 
  items: InventoryItem[], 
  onUpdateStock: (id: string, qtyToAdd: number) => void,
  onAddItem: (item: InventoryItem) => void,
  onDeleteItem: (id: string) => void
}> = ({ items, onUpdateStock, onAddItem, onDeleteItem }) => {
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State for New Item
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<InventoryItem['category']>('acessorio');
  const [newUnit, setNewUnit] = useState('un');
  const [newMinStock, setNewMinStock] = useState(10);

  const handleInputChange = (id: string, value: string) => {
    setStockInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (id: string) => {
    const qty = parseFloat(stockInputs[id]);
    if (!isNaN(qty) && qty !== 0) {
      onUpdateStock(id, qty);
      setStockInputs(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleSaveItem = () => {
    if (!newName) return;
    
    const newItem: InventoryItem = {
      id: `INV-${Date.now()}`,
      name: newName,
      category: newCategory,
      quantity: 0,
      unit: newUnit,
      minStock: newMinStock
    };

    onAddItem(newItem);
    setIsAdding(false);
    
    // Reset form
    setNewName('');
    setNewCategory('acessorio');
    setNewUnit('un');
    setNewMinStock(10);
  };

  if (isAdding) {
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-100">Novo Item de Estoque</h2>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white flex items-center gap-2">
                    <X className="w-4 h-4" /> Cancelar
                </button>
            </div>
            
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 max-w-2xl">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Item</label>
                        <input 
                            type="text" 
                            value={newName} 
                            onChange={e => setNewName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Ex: Fita 30mm Especial"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Categoria</label>
                            <select 
                                value={newCategory} 
                                onChange={e => setNewCategory(e.target.value as any)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="fita">Fita</option>
                                <option value="papel">Papel</option>
                                <option value="tinta">Tinta</option>
                                <option value="acessorio">Acessório</option>
                                <option value="embalagem">Embalagem</option>
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-400 mb-1">Unidade</label>
                             <input 
                                type="text" 
                                value={newUnit} 
                                onChange={e => setNewUnit(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="un, m, kg, L"
                             />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Estoque Mínimo (Alerta)</label>
                        <input 
                            type="number" 
                            value={newMinStock} 
                            onChange={e => setNewMinStock(Number(e.target.value))}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="pt-4">
                        <button onClick={handleSaveItem} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium shadow-lg shadow-blue-900/20 transition-all">
                            Cadastrar Item
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-3xl font-bold text-slate-100">Estoque de Insumos</h2>
            <p className="text-slate-400">Gerenciamento de matéria-prima e atualização de saldos.</p>
         </div>
         <div className="flex gap-3">
             <button 
                onClick={() => setIsAdding(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
             >
                <Plus className="w-4 h-4" /> Novo Item
             </button>
             <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                <History className="w-4 h-4" /> Histórico
             </button>
         </div>
      </div>

      <div className="grid gap-4">
         {items.map(item => (
           <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-slate-700 transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                   <span className={`w-2 h-2 rounded-full ${item.quantity <= item.minStock ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                   <p className="font-bold text-slate-100 text-lg">{item.name}</p>
                </div>
                <p className="text-sm text-slate-500 capitalize flex items-center gap-2">
                  <Package className="w-3.5 h-3.5" /> {item.category}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-8 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                  <div className="text-right min-w-[100px]">
                      <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Saldo Atual</span>
                      <p className={`text-2xl font-bold ${item.quantity <= item.minStock ? 'text-red-500' : 'text-emerald-400'}`}>
                        {Number(item.quantity).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} 
                        <span className="text-sm font-normal text-slate-500 ml-1">{item.unit}</span>
                      </p>
                  </div>

                  <div className="h-10 w-px bg-slate-800"></div>

                  <div className="flex items-end gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Adicionar / Remover</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            placeholder="Qtd."
                            className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            value={stockInputs[item.id] || ''}
                            onChange={(e) => handleInputChange(item.id, e.target.value)}
                          />
                          <button 
                            onClick={() => handleSubmit(item.id)}
                            disabled={!stockInputs[item.id]}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-1.5 rounded-lg transition-colors"
                            title="Atualizar Estoque"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                  </div>
                </div>

                <button 
                  onClick={() => onDeleteItem(item.id)}
                  className="p-3 text-slate-600 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Excluir Item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

// Navigation Item Component
const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1
      ${active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
      }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </button>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Global Orders State
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  // Global Clients State
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  // Global Inventory State
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);

  // Global State for Pricing Configuration
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    '15mm': 1.20,
    '20mm': 2.30,
    '25mm': 2.80,
    finishings: [
      { name: 'argola', price: 0.03 },
      { name: 'jacare', price: 0.31 },
      { name: 'fecho', price: 0.29 },
      { name: 'trava', price: 0.11 },
      { name: 'mosquetao', price: 1.06 },
    ],
    quantityRules: [
      { min: 20, max: 49, factor: 3.64 },
      { min: 50, max: 99, factor: 2.03 },
      { min: 100, max: 199, factor: 1.23 },
      { min: 200, max: 500, factor: 1.17 }
    ],
    taxRate: 15, // Default 15% tax
    productionSettings: {
      plotter: {
        referenceDistanceMeters: 0.90, // 90cm
        timeMinutes: 4,
        timeSeconds: 11
      },
      calandra: {
        referenceDistanceMeters: 0.90, // 90cm
        timeSeconds: 3
      }
    }
  });

  const handleUpdateStock = (id: string, qtyToAdd: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: item.quantity + qtyToAdd };
      }
      return item;
    }));
  };
  
  const handleAddItem = (newItem: InventoryItem) => {
    setInventory(prev => [newItem, ...prev]);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item do estoque?')) {
      setInventory(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleDeductStock = (order: Order) => {
    // Normalizar string para comparação (ignorar acentos e case)
    const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    // Logic to deduct items based on order calculation
    setInventory(prevInventory => {
      const newInventory = prevInventory.map(item => ({...item})); // Deep copy
      
      // 1. Deduct Paper
      // Determina qual bobina usar baseada na largura da fita
      // Se for 25mm, usa a bobina de 20cm (ou maior), caso contrário usa a de 15cm
      const isWideLanyard = order.items[0].width === '25mm';
      const paperSearchString = isWideLanyard ? '20cm' : '15cm';
      
      const paperItem = newInventory.find(i => 
        i.category === 'papel' && i.name.includes(paperSearchString)
      );

      if (paperItem) {
        paperItem.quantity = Math.max(0, paperItem.quantity - order.calculation.paperConsumptionMeters);
      }

      // 2. Deduct Ink (REMOVED as requested)

      // 3. Deduct Tape
      const tapeWidth = order.items[0].width; // e.g., '20mm'
      // Find tape that matches width
      const tapeItem = newInventory.find(i => i.category === 'fita' && i.name.includes(tapeWidth));
      if (tapeItem) {
        tapeItem.quantity = Math.max(0, tapeItem.quantity - order.calculation.totalLinearMeters);
      }

      // 4. Deduct Finishings
      order.items[0].finishings.forEach(finishing => {
         // Try to find inventory item with similar name, normalizing accents
         const finishingItem = newInventory.find(i => 
            i.category === 'acessorio' && 
            normalize(i.name).includes(normalize(finishing.type))
         );
         
         if (finishingItem) {
            const totalNeeded = finishing.quantity * order.items[0].quantity;
            finishingItem.quantity = Math.max(0, finishingItem.quantity - totalNeeded);
         }
      });

      return newInventory;
    });
  };

  const handleAddOrder = (newOrder: Order) => {
    setOrders([newOrder, ...orders]);
    // If created directly as approved/production, deduct stock immediately
    // Checks if status is NOT 'orcamento' AND NOT 'cancelado'
    if (newOrder.status !== 'orcamento' && newOrder.status !== 'cancelado') {
       handleDeductStock(newOrder);
    }
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    // Check previous status to see if we need to deduct stock (transition from Orcamento -> Production)
    const prevOrder = orders.find(o => o.id === updatedOrder.id);
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    
    // Define status groups
    const productionStatuses = ['aprovado', 'impressao', 'calandra', 'finalizacao', 'concluido', 'entregue'];
    const nonProductionStatuses = ['orcamento', 'cancelado'];

    // If it was in "Orcamento" or "Cancelado" AND moved to ANY production status
    if (prevOrder && 
        nonProductionStatuses.includes(prevOrder.status) && 
        productionStatuses.includes(updatedOrder.status)) {
        handleDeductStock(updatedOrder);
    }
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  const handleAddClient = (newClient: Client) => {
    setClients([newClient, ...clients]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard orders={orders} />;
      case 'orders': 
        return (
          <Orders 
            onNavigate={setCurrentView} 
            pricingConfig={pricingConfig} 
            orders={orders} 
            onAddOrder={handleAddOrder}
            onUpdateOrder={handleUpdateOrder}
            onDeleteOrder={handleDeleteOrder}
          />
        );
      case 'production': return <Production orders={orders} />;
      case 'inventory': return <Inventory items={inventory} onUpdateStock={handleUpdateStock} onAddItem={handleAddItem} onDeleteItem={handleDeleteItem} />;
      case 'clients': return (
        <Clients 
          clients={clients} 
          onAddClient={handleAddClient} 
          onUpdateClient={handleUpdateClient}
          onDeleteClient={handleDeleteClient}
        />
      );
      case 'settings': return <Settings pricing={pricingConfig} onSave={setPricingConfig} />;
      default: return <Dashboard orders={orders} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans flex overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 
        transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xl">W</div>
              <span className="font-bold text-lg tracking-tight">WN<span className="text-blue-500">Fitas</span></span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4 mt-2">Principal</div>
            <NavItem icon={LayoutDashboard} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
            <NavItem icon={ShoppingCart} label="Pedidos" active={currentView === 'orders'} onClick={() => setCurrentView('orders')} />
            <NavItem icon={Printer} label="Produção" active={currentView === 'production'} onClick={() => setCurrentView('production')} />
            
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4 mt-6">Gestão</div>
            <NavItem icon={Package} label="Estoque" active={currentView === 'inventory'} onClick={() => setCurrentView('inventory')} />
            <NavItem icon={Users} label="Clientes" active={currentView === 'clients'} onClick={() => setCurrentView('clients')} />
            <NavItem icon={SettingsIcon} label="Configurações" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">OP</div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">Operador João</p>
                <p className="text-xs text-slate-400">Produção</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 lg:px-8">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 text-slate-400 hover:text-white transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </div>
      </main>

    </div>
  );
};

export default App;