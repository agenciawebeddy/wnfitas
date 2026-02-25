"use client";

import React, { useState, useEffect } from 'react';
import { UserPlus, Mail, Lock, User, Pencil, Trash2, Save, Shield, Search, Users as UsersIcon } from 'lucide-react';
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  email?: string;
}

export const Users: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'operador'
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'new'>('list');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('first_name');
    
    if (error) {
      console.error('Erro ao buscar usuários:', error);
    } else {
      setUsers(data || []);
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password || !newUser.firstName) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setIsRegistering(true);

    const tempClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

    const { error } = await tempClient.auth.signUp({
      email: newUser.email,
      password: newUser.password,
      options: {
        data: {
          first_name: newUser.firstName,
          last_name: newUser.lastName,
          role: newUser.role
        }
      }
    });

    setIsRegistering(false);

    if (error) {
      toast.error('Erro ao cadastrar: ' + error.message);
    } else {
      toast.success('Operador cadastrado com sucesso!');
      setNewUser({ email: '', password: '', firstName: '', lastName: '', role: 'operador' });
      setViewMode('list');
      fetchUsers();
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: editingUser.first_name,
        last_name: editingUser.last_name,
        role: editingUser.role
      })
      .eq('id', editingUser.id);

    if (error) {
      toast.error('Erro ao atualizar usuário');
    } else {
      toast.success('Usuário atualizado');
      setEditingUser(null);
      fetchUsers();
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao remover usuário');
    } else {
      toast.success('Usuário removido');
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(u => 
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (viewMode === 'new') {
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-100">Novo Operador</h2>
          <button onClick={() => setViewMode('list')} className="text-slate-400 hover:text-white">Cancelar</button>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 max-w-2xl">
          <form onSubmit={handleRegisterUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input 
                    type="text" 
                    value={newUser.firstName}
                    onChange={e => setNewUser({...newUser, firstName: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Nome"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Sobrenome</label>
                <input 
                  type="text" 
                  value={newUser.lastName}
                  onChange={e => setNewUser({...newUser, lastName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Sobrenome"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input 
                    type="email" 
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Cargo</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <select 
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  >
                    <option value="operador">Operador</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Senha Inicial</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input 
                  type="password" 
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isRegistering}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isRegistering ? 'Cadastrando...' : <><UserPlus className="w-4 h-4" /> Cadastrar Operador</>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Usuários</h2>
          <p className="text-slate-400">Gerencie os operadores e permissões do sistema.</p>
        </div>
        <button 
          onClick={() => setViewMode('new')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-blue-900/20 transition-all"
        >
          <UserPlus className="w-4 h-4" /> Novo Usuário
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Buscar por nome..." 
          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">Nome Completo</th>
              <th className="px-6 py-4">Cargo / Permissão</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredUsers.map(u => (
              <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  {editingUser?.id === u.id ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={editingUser.first_name}
                        onChange={e => setEditingUser({...editingUser, first_name: e.target.value})}
                        className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200"
                      />
                      <input 
                        type="text" 
                        value={editingUser.last_name}
                        onChange={e => setEditingUser({...editingUser, last_name: e.target.value})}
                        className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs">
                        {u.first_name[0]}
                      </div>
                      <span className="text-slate-200 font-medium">{u.first_name} {u.last_name}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingUser?.id === u.id ? (
                    <select 
                      value={editingUser.role}
                      onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                      className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200"
                    >
                      <option value="operador">Operador</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${u.role === 'admin' ? 'bg-blue-950 text-blue-400 border-blue-900' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                      {u.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {editingUser?.id === u.id ? (
                      <>
                        <button onClick={handleUpdateUser} className="p-2 hover:bg-emerald-900/30 rounded text-emerald-500 transition"><Save className="w-4 h-4" /></button>
                        <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-slate-800 rounded text-slate-500 transition">X</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingUser(u)} className="p-2 hover:bg-blue-900/30 rounded text-slate-500 hover:text-blue-400 transition"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-900/30 rounded text-slate-500 hover:text-red-400 transition"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center text-slate-500">Nenhum usuário encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};