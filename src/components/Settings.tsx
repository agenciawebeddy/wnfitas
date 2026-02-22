import React, { useState, useEffect } from 'react';
import { Save, DollarSign, Settings as SettingsIcon, Link as LinkIcon, BarChart3, Trash2, Plus, Percent, Clock, Printer, Flame } from 'lucide-react';
import { PricingConfig, QuantityRule, FinishingItem, ProductType, LanyardWidth } from '../types';

interface SettingsProps {
  pricing: PricingConfig;
  onSave: (newPricing: PricingConfig) => void;
}

const PriceInput = ({ value, onChange, className }: { value: number, onChange: (val: number) => void, className?: string }) => {
    const [localValue, setLocalValue] = useState(value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (!isEditing) {
            setLocalValue(value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        }
    }, [value, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (/^[\d]*\,?[\d]*$/.test(val)) {
            setLocalValue(val);
            const num = parseFloat(val.replace(',', '.'));
            if (!isNaN(num)) onChange(num);
        }
    };

    const handleBlur = () => {
        setIsEditing(false);
        const num = parseFloat(localValue.replace(',', '.')) || 0;
        setLocalValue(num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        onChange(num);
    };

    return (
        <input
            type="text"
            inputMode="decimal"
            className={className}
            value={localValue}
            onChange={handleChange}
            onFocus={() => setIsEditing(true)}
            onBlur={handleBlur}
        />
    );
};

export const Settings: React.FC<SettingsProps> = ({ pricing, onSave }) => {
  const [values, setValues] = useState<PricingConfig>(pricing);
  const [saved, setSaved] = useState(false);

  const formatDisplay = (val: number) => String(val).replace('.', ',');

  const handlePriceChange = (type: ProductType, width: LanyardWidth, newVal: number) => {
    setValues(prev => ({
      ...prev,
      prices: {
        ...prev.prices,
        [type]: {
          ...prev.prices[type],
          [width]: newVal
        }
      }
    }));
    setSaved(false);
  };

  const handleRuleChange = (index: number, field: keyof QuantityRule, value: string) => {
    const normalized = value.replace(',', '.');
    const newRules = [...values.quantityRules];
    newRules[index] = {
      ...newRules[index],
      [field]: parseFloat(normalized) || 0
    };
    setValues(prev => ({ ...prev, quantityRules: newRules }));
    setSaved(false);
  };

  const addRule = () => {
    setValues(prev => ({
      ...prev,
      quantityRules: [...prev.quantityRules, { min: 0, max: 0, factor: 1 }]
    }));
  };

  const removeRule = (index: number) => {
    const newRules = values.quantityRules.filter((_, i) => i !== index);
    setValues(prev => ({ ...prev, quantityRules: newRules }));
  };

  const handleFinishingNameChange = (index: number, val: string) => {
      const newFinishings = [...values.finishings];
      newFinishings[index] = { ...newFinishings[index], name: val };
      setValues(prev => ({ ...prev, finishings: newFinishings }));
      setSaved(false);
  };

  const handleFinishingPriceChange = (index: number, val: number) => {
      const newFinishings = [...values.finishings];
      newFinishings[index] = { ...newFinishings[index], price: val };
      setValues(prev => ({ ...prev, finishings: newFinishings }));
      setSaved(false);
  };

  const addFinishing = () => {
    setValues(prev => ({
        ...prev,
        finishings: [...prev.finishings, { name: 'Novo Item', price: 0 }]
    }));
  };

  const removeFinishing = (index: number) => {
      const newFinishings = values.finishings.filter((_, i) => i !== index);
      setValues(prev => ({ ...prev, finishings: newFinishings }));
  };
  
  const handleTaxChange = (val: number) => {
      setValues(prev => ({ ...prev, taxRate: val }));
      setSaved(false);
  };

  const handleProductionChange = (machine: 'plotter' | 'calandra', field: string, value: string) => {
     const numVal = parseFloat(value.replace(',', '.')) || 0;
     setValues(prev => ({
       ...prev,
       productionSettings: {
         ...prev.productionSettings,
         [machine]: {
           ...prev.productionSettings[machine],
           [field]: numVal
         }
       }
     }));
     setSaved(false);
  };

  const handleSave = () => {
    onSave(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const renderPriceSection = (type: ProductType, title: string, subtitle: string) => (
    <div className="space-y-4 mb-8">
      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{title} ({subtitle})</h4>
      {(['15mm', '20mm', '25mm'] as LanyardWidth[]).map(width => (
        <div key={width} className="flex items-center justify-between gap-4">
          <label className="text-slate-300 font-medium w-1/3">Fita {width}</label>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
            <PriceInput
              value={values.prices[type]?.[width] || 0}
              onChange={(val) => handlePriceChange(type, width, val)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-100">Configurações</h2>
        <p className="text-slate-400">Parâmetros globais do sistema e precificação.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-medium text-slate-100">Tabela de Preços Base</h3>
          </div>

          <div className="space-y-2">
            {renderPriceSection('tirante', 'Tirantes', '90cm')}
            <div className="my-6 border-t border-slate-800"></div>
            {renderPriceSection('tirante_copo', 'Tirante Copo', '140cm')}
            <div className="my-6 border-t border-slate-800"></div>
            {renderPriceSection('chaveiro', 'Chaveiros', '29cm')}
            <div className="my-6 border-t border-slate-800"></div>
            {renderPriceSection('pulseira', 'Pulseiras', '35cm')}

            <div className="my-6 border-t border-slate-800"></div>

            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" /> Acabamentos
                </h4>
                <button onClick={addFinishing} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Adicionar
                </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-3 py-2">Nome</th>
                            <th className="px-3 py-2 w-32">Preço (R$)</th>
                            <th className="px-2 py-2 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {values.finishings.map((item, idx) => (
                            <tr key={idx}>
                                <td className="p-2">
                                    <input 
                                        type="text" 
                                        value={item.name}
                                        onChange={(e) => handleFinishingNameChange(idx, e.target.value)}
                                        className="w-full bg-transparent border border-slate-700 rounded px-2 py-1 text-slate-200"
                                        placeholder="Nome do item"
                                    />
                                </td>
                                <td className="p-2">
                                    <PriceInput 
                                        value={item.price}
                                        onChange={(val) => handleFinishingPriceChange(idx, val)}
                                        className="w-full bg-transparent border border-slate-700 rounded px-2 py-1 text-slate-200 text-right"
                                    />
                                </td>
                                <td className="p-2 text-center">
                                    <button onClick={() => removeFinishing(idx)} className="text-slate-600 hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="my-6 border-t border-slate-800"></div>

            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
               <Percent className="w-4 h-4" /> Impostos
            </h4>
            <div className="mb-6">
                <label className="block text-xs font-medium text-slate-400 mb-1">Alíquota de Imposto sobre Venda (%)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    inputMode="decimal"
                    value={formatDisplay(values.taxRate)}
                    onChange={(e) => handleTaxChange(parseFloat(e.target.value.replace(',', '.')) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
                </div>
            </div>

            <div className="my-6 border-t border-slate-800"></div>

            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Regras de Quantidade (Fator)
              </h4>
              <button onClick={addRule} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Adicionar
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Mín</th>
                    <th className="px-4 py-3">Máx</th>
                    <th className="px-4 py-3">Fator Mult.</th>
                    <th className="px-2 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {values.quantityRules.map((rule, idx) => (
                    <tr key={idx}>
                      <td className="p-2">
                        <input 
                          type="text"
                          inputMode="numeric"
                          value={rule.min}
                          onChange={(e) => handleRuleChange(idx, 'min', e.target.value)}
                          className="w-full bg-transparent border border-slate-700 rounded px-2 py-1 text-slate-200 text-center"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text"
                          inputMode="numeric"
                          value={rule.max}
                          onChange={(e) => handleRuleChange(idx, 'max', e.target.value)}
                          className="w-full bg-transparent border border-slate-700 rounded px-2 py-1 text-slate-200 text-center"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text"
                          inputMode="decimal"
                          value={formatDisplay(rule.factor)}
                          onChange={(e) => handleRuleChange(idx, 'factor', e.target.value)}
                          className="w-full bg-transparent border border-blue-900/50 rounded px-2 py-1 text-emerald-400 font-bold text-center"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button onClick={() => removeRule(idx)} className="text-slate-600 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className={`text-sm font-medium ${saved ? 'text-emerald-500' : 'text-transparent'} transition-colors`}>
              Alterações salvas com sucesso!
            </span>
            <button 
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
            >
              <Save className="w-4 h-4" /> Salvar Alterações
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
            <SettingsIcon className="w-5 h-5 text-slate-500" />
            <h3 className="text-lg font-medium text-slate-100">Parâmetros de Produção</h3>
          </div>
          
          <div className="space-y-8">
            <div>
               <div className="flex items-center gap-2 mb-3 text-blue-400">
                  <Printer className="w-4 h-4" />
                  <h4 className="font-semibold text-sm uppercase tracking-wider">Velocidade Impressão (Referência)</h4>
               </div>
               <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Distância (m)</label>
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={formatDisplay(values.productionSettings?.plotter.referenceDistanceMeters || 0)}
                      onChange={(e) => handleProductionChange('plotter', 'referenceDistanceMeters', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Minutos</label>
                    <input 
                      type="number" 
                      value={values.productionSettings?.plotter.timeMinutes || 0}
                      onChange={(e) => handleProductionChange('plotter', 'timeMinutes', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Segundos</label>
                    <input 
                      type="number" 
                      value={values.productionSettings?.plotter.timeSeconds || 0}
                      onChange={(e) => handleProductionChange('plotter', 'timeSeconds', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                    />
                  </div>
               </div>
            </div>

            <div className="border-t border-slate-800"></div>

            <div>
               <div className="flex items-center gap-2 mb-3 text-orange-400">
                  <Flame className="w-4 h-4" />
                  <h4 className="font-semibold text-sm uppercase tracking-wider">Velocidade Calandra (Referência)</h4>
               </div>
               <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Distância (m)</label>
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={formatDisplay(values.productionSettings?.calandra.referenceDistanceMeters || 0)}
                      onChange={(e) => handleProductionChange('calandra', 'referenceDistanceMeters', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Minutos</label>
                    <input 
                      type="number" 
                      value={values.productionSettings?.calandra.timeMinutes || 0}
                      onChange={(e) => handleProductionChange('calandra', 'timeMinutes', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Segundos</label>
                    <input 
                      type="number" 
                      value={values.productionSettings?.calandra.timeSeconds || 0}
                      onChange={(e) => handleProductionChange('calandra', 'timeSeconds', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                    />
                  </div>
               </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg mt-6">
                <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blue-400 mt-0.5" />
                    <p className="text-xs text-slate-400">
                        Estes parâmetros são usados para calcular o <strong>Tempo Estimado</strong> na tela de Pedidos.
                    </p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};