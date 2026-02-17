import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, ShoppingCart, Printer, Package, Settings as SettingsIcon, Menu, X, Bell, Plus, History, LogOut, Trash2 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Orders } from './components/Orders';
import { Production } from './components/Production';
import { Settings } from './components/Settings';
import { Clients } from './components/Clients';
import { PricingConfig, Order, Client, InventoryItem } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { MOCK_INVENTORY, MOCK_ORDERS, MOCK_CLIENTS } from './constants';

// Inventory Component (Inline as before)
const Inventory: React.FC<{ 
  items: InventoryItem[], 
  onUpdateStock: (id: string, qtyToAdd: number) => void,
  onAddItem: (item: InventoryItem) => void,
  onDeleteItem: (id: string) => void
}> = ({ items, onUpdateStock, onAddItem, onDeleteItem }) => {
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState(false);
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
    setNewName('');
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
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Categoria</label>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value as any)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200">
                  <option value="fita">Fita</option>
                  <option value="papel">Papel</option>
                  <option value="tinta">Tinta</option>
                  <option value="acessorio">Acessório</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Unidade</label>
                <input type="text" value={newUnit} onChange={e => setNewUnit(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200" />
              </div>
            </div>
            <button onClick={handleSaveItem} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">Cadastrar Item</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Estoque</h2>
          <p className="text-slate-400">Gerenciamento de insumos.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Item
        </button>
      </div>
      <div className="grid gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center justify-between group">
            <div>
              <p className="font-bold text-slate-100 text-lg">{item.name}</p>
              <p className="text-sm text-slate-500 capitalize">{item.category}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-400">{item.quantity} <span className="text-sm font-normal text-slate-500">{item.unit}</span></p>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm" value={stockInputs[item.id] || ''} onChange={e => handleInputChange(item.id, e.target.value)} />
                <button onClick={() => handleSubmit(item.id)} className="bg-blue-600 p-1.5 rounded"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={() => onDeleteItem(item.id)} className="text-slate-600 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </button>
);

const MainApp: React.FC = () => {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    '15mm': 1.20, '20mm': 2.30, '25mm': 2.80,
    finishings: [
      { name: 'argola', price: 0.03 }, { name: 'jacare', price: 0.31 },
      { name: 'fecho', price: 0.29 }, { name: 'trava', price: 0.11 },
      { name: 'mosquetao', price: 1.06 },
    ],
    quantityRules: [
      { min: 20, max: 49, factor: 3.64 }, { min: 50, max: 99, factor: 2.03 },
      { min: 100, max: 199, factor: 1.23 }, { min: 200, max: 500, factor: 1.17 }
    ],
    taxRate: 15,
    productionSettings: {
      plotter: { referenceDistanceMeters: 0.90, timeMinutes: 4, timeSeconds: 11 },
      calandra: { referenceDistanceMeters: 0.90, timeSeconds: 3 }
    }
  });

  const handleUpdateStock = (id: string, qtyToAdd: number) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, quantity: item.quantity + qtyToAdd } : item));
  };
  
  const handleAddItem = (newItem: InventoryItem) => setInventory(prev => [newItem, ...prev]);
  const handleDeleteItem = (id: string) => setInventory(prev => prev.filter(item => item.id !== id));

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <Dashboard orders={orders} />;
      case 'orders': return <Orders onNavigate={setCurrentView} pricingConfig={pricingConfig} orders={orders} onAddOrder={o => setOrders([o, ...orders])} onUpdateOrder={o => setOrders(orders.map(x => x.id === o.id ? o : x))} onDeleteOrder={id => setOrders(orders.filter(o => o.id !== id))} />;
      case 'production': return <Production orders={orders} />;
      case 'inventory': return <Inventory items={inventory} onUpdateStock={handleUpdateStock} onAddItem={handleAddItem} onDeleteItem={handleDeleteItem} />;
      case 'clients': return <Clients clients={clients} onAddClient={c => setClients([c, ...clients])} onUpdateClient={c => setClients(clients.map(x => x.id === c.id ? c : x))} onDeleteClient={id => setClients(clients.filter(c => c.id !== id))} />;
      case 'settings': return <Settings pricing={pricingConfig} onSave={setPricingConfig} />;
      default: return <Dashboard orders={orders} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans flex overflow-hidden">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xl">W</div>
              <span className="font-bold text-lg tracking-tight">WN<span className="text-blue-500">Fitas</span></span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavItem icon={LayoutDashboard} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
            <NavItem icon={ShoppingCart} label="Pedidos" active={currentView === 'orders'} onClick={() => setCurrentView('orders')} />
            <NavItem icon={Printer} label="Produção" active={currentView === 'production'} onClick={() => setCurrentView('production')} />
            <NavItem icon={Package} label="Estoque" active={currentView === 'inventory'} onClick={() => setCurrentView('inventory')} />
            <NavItem icon={Users} label="Clientes" active={currentView === 'clients'} onClick={() => setCurrentView('clients')} />
            <NavItem icon={SettingsIcon} label="Configurações" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
          </nav>
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                  {user?.email?.[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{user?.email?.split('@')[0]}</p>
                </div>
              </div>
              <button onClick={() => signOut()} className="text-slate-400 hover:text-red-400 p-1" title="Sair">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 lg:px-8">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-slate-400"><Menu className="w-6 h-6" /></button>
          <div className="flex items-center gap-4 ml-auto">
            <button className="relative p-2 text-slate-400 hover:text-white"><Bell className="w-5 h-5" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span></button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderView()}</div>
        </div>
      </main>
    </div>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Carregando...</div>;
  return user ? <MainApp /> : <Login />;
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;