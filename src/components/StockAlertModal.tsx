"use client";

import React from 'react';
import { AlertTriangle, X, Package } from 'lucide-react';
import { InventoryItem } from '../types';

interface StockAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
}

const StockAlertModal: React.FC<StockAlertModalProps> = ({ isOpen, onClose, items }) => {
  if (!isOpen || items.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-red-900/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <h3 className="text-2xl font-bold text-slate-100 mb-2">Alerta de Estoque Baixo</h3>
          <p className="text-slate-400 mb-6">Os seguintes insumos atingiram o nível crítico e precisam de reposição imediata:</p>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-slate-500" />
                  <div>
                    <p className="font-bold text-slate-200 text-sm">{item.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Mínimo: {item.minStock} {item.unit}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-400">{item.quantity.toLocaleString('pt-BR')} {item.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-slate-950/50 p-6 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-900/20"
          >
            Entendi, vou providenciar
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockAlertModal;