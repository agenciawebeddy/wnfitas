"use client";

import React, { useState, useEffect } from 'react';
import { Calculator as CalcIcon, Ruler, Printer, Flame, Clock, Package, RefreshCw } from 'lucide-react';
import { calculateProduction } from '../services/calculator';
import { LanyardWidth, ProductType, PricingConfig } from '../types';

interface CalculatorProps {
  pricingConfig: PricingConfig;
}

const Calculator: React.FC<CalculatorProps> = ({ pricingConfig }) => {
  const [productType, setProductType] = useState<ProductType>('tirante');
  const [width, setWidth] = useState<LanyardWidth>('20mm');
  const [quantity, setQuantity] = useState<number>(100);
  
  const [results, setResults] = useState(calculateProduction(productType, width, quantity, pricingConfig));

  useEffect(() => {
    setResults(calculateProduction(productType, width, quantity, pricingConfig));
  }, [productType, width, quantity, pricingConfig]);

  const formatNumber = (val: number) => val.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Calculadora Industrial</h2>
        <p className="text-slate-400">Simule o consumo de insumos e tempo de produção rapidamente.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Entrada */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <CalcIcon className="w-5 h-5" />
            <h3 className="font-bold text-slate-100">Parâmetros</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-1.5">Tipo de Produto</label>
              <select 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                value={productType}
                onChange={e => setProductType(e.target.value as ProductType)}
              >
                <option value="tirante">Tirantes (90cm)</option>
                <option value="tirante_copo">Tirante Copo (140cm)</option>
                <option value="chaveiro">Chaveiros (29cm)</option>
                <option value="pulseira">Pulseiras (35cm)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Largura da Fita</label>
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

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase mb-1.5">Quantidade (Unidades)</label>
              <input 
                type="number" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                value={quantity}
                onChange={e => setQuantity(Math.max(0, Number(e.target.value)))}
              />
            </div>
          </div>

          <button 
            onClick={() => { setQuantity(100); setProductType('tirante'); setWidth('20mm'); }}
            className="w-full py-3 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Resetar Valores
          </button>
        </div>

        {/* Painel de Resultados */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                <Ruler className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Fita Necessária</p>
                <p className="text-3xl font-bold text-slate-100">{results.totalLinearMeters}m</p>
                <p className="text-[10px] text-slate-500 mt-1">Metros lineares totais</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Consumo de Papel</p>
                <p className="text-3xl font-bold text-slate-100">{formatNumber(results.paperConsumptionMeters)}m</p>
                <p className="text-[10px] text-slate-500 mt-1">Bobina de {((productType === 'tirante' || productType === 'tirante_copo') && width === '25mm') ? '22cm' : '15cm'}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 text-amber-500 mb-6">
              <Clock className="w-5 h-5" />
              <h3 className="font-bold text-slate-100">Tempo Estimado de Produção</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Printer className="w-12 h-12 text-blue-500" />
                </div>
                <p className="text-xs font-bold text-blue-500 uppercase mb-2">Impressão (Plotter)</p>
                <p className="text-4xl font-bold text-slate-100">{results.estimatedTimePlotter}</p>
                <div className="mt-4 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-2/3 rounded-full"></div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Flame className="w-12 h-12 text-orange-500" />
                </div>
                <p className="text-xs font-bold text-orange-500 uppercase mb-2">Calandra</p>
                <p className="text-4xl font-bold text-slate-100">{results.estimatedTimeCalandra}</p>
                <div className="mt-4 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-600 w-1/2 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-950/50 border border-slate-800 rounded-lg">
              <div className="flex items-center gap-3 text-slate-500 text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Cálculo baseado em 5 artes por fileira de papel.</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-xs mt-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Inclui margem de segurança de 5% no consumo de papel.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;