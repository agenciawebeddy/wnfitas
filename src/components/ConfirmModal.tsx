"use client";

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>
          <p className="text-slate-400 leading-relaxed">{message}</p>
        </div>
        
        <div className="bg-slate-950/50 p-4 flex gap-3 justify-end border-t border-slate-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 rounded-lg text-sm font-bold text-white transition-all shadow-lg
              ${variant === 'danger' 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'}
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;