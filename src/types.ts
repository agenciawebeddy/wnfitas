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
export type ProductType = 'tirante' | 'tirante_copo' | 'chaveiro' | 'pulseira';

export type FinishingType = string;

export interface QuantityRule {
  min: number;
  max: number;
  factor: number;
}

export interface FinishingItem {
  name: string;
  price: number;
}

export interface ProductionSettings {
  plotter: {
    referenceDistanceMeters: number;
    timeMinutes: number;
    timeSeconds: number;
  };
  calandra: {
    referenceDistanceMeters: number;
    timeMinutes: number;
    timeSeconds: number;
  };
}

export interface PricingConfig {
  // Preços por Tipo e Largura
  prices: {
    tirante: Record<LanyardWidth, number>;
    tirante_copo: Record<LanyardWidth, number>;
    chaveiro: Record<LanyardWidth, number>;
    pulseira: Record<LanyardWidth, number>;
  };
  
  finishings: FinishingItem[];
  quantityRules: QuantityRule[];
  taxRate: number;
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
  quantity: number;
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
  paperMetersPerSide: number;
  paperConsumptionMeters: number;
  estimatedCost: number;
  estimatedTimePlotter: string;
  estimatedTimeCalandra: string;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
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