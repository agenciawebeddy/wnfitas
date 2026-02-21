export type OrderStatus = 
  | 'orcamento' 
  | 'aprovado' 
  | 'impressao' 
  | 'calandra' 
  | 'finalizacao' 
  | 'concluido' 
  | 'entregue'
  | 'cancelado';

export type LanyardWidth = '15mm' | '20mm' | '25mm';
export type ProductType = 'tirante' | 'chaveiro' | 'pulseira';

// FinishingType agora é apenas string pois é dinâmico
export type FinishingType = string;

export interface QuantityRule {
  min: number;
  max: number;
  factor: number; // Multiplicador de preço
}

export interface FinishingItem {
  name: string;
  price: number;
}

export interface ProductionSettings {
  plotter: {
    referenceDistanceMeters: number; // ex: 0.90
    timeMinutes: number; // ex: 4
    timeSeconds: number; // ex: 11
  };
  calandra: {
    referenceDistanceMeters: number; // ex: 0.90
    timeSeconds: number; // ex: 3
  };
}

export interface PricingConfig {
  // Fitas
  '15mm': number;
  '20mm': number;
  '25mm': number;
  
  // Acabamentos Dinâmicos
  finishings: FinishingItem[];

  // Regras de Quantidade
  quantityRules: QuantityRule[];
  // Impostos
  taxRate: number; // Porcentagem (ex: 15 para 15%)
  
  // Configurações de Maquinário
  productionSettings: ProductionSettings;
}

export interface Client {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  totalOrders: number;
}

export interface OrderFinishing {
  type: FinishingType;
  quantity: number; // Quantidade TOTAL deste acabamento no pedido
}

export interface OrderItem {
  productType: ProductType;
  width: LanyardWidth;
  quantity: number;
  unitPrice: number;
  colorBase: string;
  finishings: OrderFinishing[]; 
  artUrl?: string;
}

export interface ProductionCalculation {
  totalLinearMeters: number;
  paperRows: number;
  paperMetersPerSide: number; // Metragem exata para um lado (sem margem)
  paperConsumptionMeters: number; // Total com margem e ambos os lados
  estimatedCost: number;
  estimatedTimePlotter: string; // "HH:MM"
  estimatedTimeCalandra: string; // "HH:MM"
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  date: string; // ISO date
  deadline: string;
  status: OrderStatus;
  items: OrderItem[];
  calculation: ProductionCalculation;
  totalValue: number;
  opNumber?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'papel' | 'tinta' | 'fita' | 'acessorio' | 'embalagem';
  quantity: number;
  unit: string;
  minStock: number;
  location?: string;
}

export interface ProductionStats {
  metersPrintedToday: number;
  metersCalenderedToday: number;
  activeOrders: number;
  monthlyRevenue: number;
}