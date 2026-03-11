"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, StickyNote, Save, X } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'react-hot-toast';
import { Note } from '../types';
import { useAuth } from '../context/AuthContext';

const COLORS = [
  { name: 'Amarelo', class: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200' },
  { name: 'Azul', class: 'bg-blue-500/20 border-blue-500/50 text-blue-200' },
  { name: 'Verde', class: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200' },
  { name: 'Rosa', class: 'bg-pink-500/20 border-pink-500/50 text-pink-200' },
  { name: 'Roxo', class: 'bg-purple-500/20 border-purple-500/50 text-purple-200' },
];

export const Notes: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].class);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar notas');
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  };

  const handleAddNote = async () => {
    if (!newContent.trim()) return;

    const { data, error } = await supabase
      .from('notes')
      .insert([{ 
        content: newContent, 
        color: selectedColor,
        user_id: user?.id 
      }])
      .select();

    if (error) {
      toast.error('Erro ao salvar nota');
    } else {
      setNotes([data[0], ...notes]);
      setNewContent('');
      setIsAdding(false);
      toast.success('Nota adicionada');
    }
  };

  const handleDeleteNote = async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erro ao excluir nota');
    } else {
      setNotes(notes.filter(n => n.id !== id));
      toast.success('Nota removida');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Anotações</h2>
          <p className="text-slate-400">Lembretes e avisos rápidos.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-blue-900/20 transition-all"
        >
          <Plus className="w-5 h-5" /> Nova Anotação
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl animate-in slide-in-from-top duration-300">
          <textarea
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px] resize-none mb-4"
            placeholder="Digite sua anotação aqui..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            autoFocus
          />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.class}
                  onClick={() => setSelectedColor(color.class)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color.class.split(' ')[0]} ${selectedColor === color.class ? 'border-white scale-110' : 'border-transparent'}`}
                  title={color.name}
                />
              ))}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setIsAdding(false)}
                className="flex-1 sm:flex-none px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAddNote}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <div 
            key={note.id} 
            className={`relative p-6 rounded-xl border-2 transition-all hover:scale-[1.02] group ${note.color}`}
          >
            <button 
              onClick={() => handleDeleteNote(note.id)}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-3">
              <StickyNote className="w-5 h-5 mt-1 shrink-0 opacity-50" />
              <p className="text-slate-100 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-[10px] font-medium opacity-40">
              {new Date(note.created_at).toLocaleString('pt-BR')}
            </div>
          </div>
        ))}

        {!loading && notes.length === 0 && !isAdding && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-xl">
            <StickyNote className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-500">Nenhuma anotação</h3>
            <p className="text-slate-600">Clique em "Nova Anotação" para começar.</p>
          </div>
        )}
      </div>
    </div>
  );
};