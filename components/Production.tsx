import React, { useState } from 'react';
import { Order } from '../types';
import { Printer, Flame, CheckCircle, Clock } from 'lucide-react';

interface ProductionProps {
  orders: Order[];
}

export const Production: React.FC<ProductionProps> = ({ orders }) => {
  const [activeTab, setActiveTab] = useState<'plotter' | 'calandra'>('plotter');

  const productionOrders = orders.filter(o => 
    activeTab === 'plotter' ? o.status === 'impressao' : o.status === 'calandra'
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Controle de Produção</h2>
          <p className="text-slate-400">Fila de operações do chão de fábrica.</p>
        </div>
        
        <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex">
          <button 
            onClick={() => setActiveTab('plotter')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'plotter' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Printer className="w-4 h-4" /> Impressão (Plotter)
          </button>
          <button 
             onClick={() => setActiveTab('calandra')}
             className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'calandra' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Flame className="w-4 h-4" /> Calandra
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productionOrders.map(order => (
          <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-all shadow-md group">
            <div className={`h-1.5 w-full ${activeTab === 'plotter' ? 'bg-blue-500' : 'bg-orange-500'}`} />
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-slate-800 text-slate-300 font-mono text-xs px-2 py-1 rounded">OP #{order.opNumber}</span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Entrega: {order.deadline.slice(5)}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-100 mb-1">{order.clientName}</h3>
              <p className="text-sm text-slate-400 mb-6">{order.items[0].quantity} un • {order.items[0].width}</p>
              
              <div className="space-y-3 bg-slate-950/50 p-4 rounded-lg border border-slate-800/50">
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Metros Lineares</span>
                   <span className="text-slate-200 font-medium">{order.calculation.totalLinearMeters}m</span>
                 </div>
                 {activeTab === 'plotter' && (
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-500">Consumo Papel</span>
                     <span className="text-blue-300 font-medium">{order.calculation.paperConsumptionMeters}m</span>
                   </div>
                 )}
                 {activeTab === 'calandra' && (
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-500">Velocidade Ideal</span>
                     <span className="text-orange-300 font-medium">1.5 m/min</span>
                   </div>
                 )}
              </div>

              <div className="mt-6 flex gap-3">
                <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg text-sm font-medium transition">
                  Ocorrência
                </button>
                <button className={`flex-1 py-2.5 rounded-lg text-sm font-medium text-white transition flex items-center justify-center gap-2
                  ${activeTab === 'plotter' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}
                `}>
                  <CheckCircle className="w-4 h-4" /> Finalizar
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {productionOrders.length === 0 && (
           <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-xl">
              <CheckCircle className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-500">Fila Vazia</h3>
              <p className="text-slate-600">Nenhuma ordem aguardando nesta etapa.</p>
           </div>
        )}
      </div>
    </div>
  );
};