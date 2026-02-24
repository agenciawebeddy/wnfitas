import React, { useState } from 'react';
import { Plus, Search, Users, Mail, Phone, Building, Save, X, Pencil, Trash2, LayoutGrid, List } from 'lucide-react';
import { Client } from '../types';

interface ClientsProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export const Clients: React.FC<ClientsProps> = ({ clients, onAddClient, onUpdateClient, onDeleteClient }) => {
  const [viewMode, setViewMode] = useState<'list' | 'new'>('list');
  const [displayMode, setDisplayMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleEdit = (client: Client) => {
    setEditingId(client.id);
    setName(client.name);
    setCnpj(client.cnpj);
    setPhone(client.phone);
    setEmail(client.email);
    setViewMode('new');
  };

  const handleSave = () => {
    if (!name || !cnpj) {
      alert("Nome e CNPJ são obrigatórios.");
      return;
    }

    const clientData: any = {
      name,
      cnpj,
      phone,
      email,
    };

    if (editingId) {
      clientData.id = editingId;
      onUpdateClient(clientData as Client);
    } else {
      onAddClient(clientData as Client);
    }

    resetForm();
    setViewMode('list');
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCnpj('');
    setPhone('');
    setEmail('');
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.cnpj.includes(searchTerm)
  );

  if (viewMode === 'new') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-100">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <button 
            onClick={() => {
              resetForm();
              setViewMode('list');
            }}
            className="text-slate-400 hover:text-white flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Cancelar
          </button>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Razão Social / Nome</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Ex: Empresa Exemplo Ltda"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">CNPJ / CPF</label>
              <div className="relative">
                <Building className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                <input 
                  type="text" 
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="00.000.000/0001-00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-500 w-4 h-4" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <button 
                onClick={handleSave}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                <Save className="w-5 h-5" /> {editingId ? 'Salvar Alterações' : 'Cadastrar Cliente'}
              </button>
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
           <h2 className="text-3xl font-bold tracking-tight text-slate-100">Clientes</h2>
           <p className="text-slate-400">Gerencie sua base de clientes e contatos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex">
            <button 
              onClick={() => setDisplayMode('grid')}
              className={`p-2 rounded-md transition-all ${displayMode === 'grid' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              title="Visualização em Grid"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setDisplayMode('table')}
              className={`p-2 rounded-md transition-all ${displayMode === 'table' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              title="Visualização em Lista"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={() => {
              resetForm();
              setViewMode('new');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
          >
            <Plus className="w-5 h-5" /> Novo Cliente
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CNPJ..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {displayMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors group relative">
              <div className="absolute top-4 right-4 flex gap-2">
                 <button 
                    onClick={() => handleEdit(client)}
                    className="p-1.5 hover:bg-blue-900/30 rounded text-slate-500 hover:text-blue-400 transition" 
                    title="Editar"
                 >
                    <Pencil className="w-4 h-4" />
                 </button>
                 <button 
                    onClick={() => onDeleteClient(client.id)}
                    className="p-1.5 hover:bg-red-900/30 rounded text-slate-500 hover:text-red-400 transition" 
                    title="Excluir"
                 >
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>

              <div className="flex items-start justify-between mb-4 pr-16">
                <div className="p-3 bg-slate-800 rounded-lg text-blue-500">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-100 mb-1 pr-4">{client.name}</h3>
              <p className="text-sm text-slate-500 font-mono mb-4">{client.cnpj}</p>
              
              <div className="space-y-2 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Phone className="w-4 h-4 text-slate-600" />
                  {client.phone || '---'}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail className="w-4 h-4 text-slate-600" />
                  {client.email || '---'}
                </div>
              </div>
              
              <div className="mt-4 pt-3 flex items-center justify-between">
                <span className="text-xs font-medium bg-slate-800 text-slate-400 px-2 py-1 rounded">
                  {client.totalOrders} Pedidos
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Cliente / CNPJ</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Pedidos</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-200">{client.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{client.cnpj}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300">{client.phone || '---'}</div>
                      <div className="text-xs text-slate-500">{client.email || '---'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium bg-slate-800 text-slate-400 px-2 py-1 rounded">
                        {client.totalOrders}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(client)}
                          className="p-2 hover:bg-blue-900/30 rounded text-slate-500 hover:text-blue-400 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteClient(client.id)}
                          className="p-2 hover:bg-red-900/30 rounded text-slate-500 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};