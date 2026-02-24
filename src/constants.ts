import { Client, InventoryItem, Order } from './types';

export const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Eventos Global Ltda', cnpj: '12.345.678/0001-90', phone: '(11) 99999-0000', email: 'compras@eventos.com', totalOrders: 15 },
  { id: '2', name: 'Agência Criativa', cnpj: '98.765.432/0001-10', phone: '(21) 98888-1111', email: 'producao@criativa.com', totalOrders: 4 },
  { id: '3', name: 'Tech Conference 2024', cnpj: '45.123.789/0001-55', phone: '(41) 97777-2222', email: 'financeiro@techconf.br', totalOrders: 1 },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Papel Sublimático Bobina 15cm', category: 'papel', quantity: 0, unit: 'm', minStock: 100 },
  { id: '9', name: 'Papel Sublimático Bobina 22cm', category: 'papel', quantity: 0, unit: 'm', minStock: 100 },
  { id: '4', name: 'Fita Poliéster 20mm Branca', category: 'fita', quantity: 0, unit: 'm', minStock: 1000 },
  { id: '6', name: 'Fita Poliéster 25mm Branca', category: 'fita', quantity: 0, unit: 'm', minStock: 500 },
  { id: '5', name: 'Mosquetão Padrão Niquel', category: 'acessorio', quantity: 0, unit: 'un', minStock: 1000 },
  { id: '7', name: 'Trava de Segurança', category: 'acessorio', quantity: 0, unit: 'un', minStock: 500 },
  { id: '8', name: 'Jacaré Niquelado', category: 'acessorio', quantity: 0, unit: 'un', minStock: 800 },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'OP-1023',
    clientId: '1',
    clientName: 'Eventos Global Ltda',
    date: '2024-05-10',
    deadline: '2024-05-20',
    status: 'impressao',
    totalValue: 1500.00,
    opNumber: '1023',
    items: [
      { 
        productType: 'tirante',
        width: '20mm', 
        quantity: 500, 
        unitPrice: 3.00, 
        colorBase: 'Branco', 
        finishings: [{ type: 'mosquetao', quantity: 1 }],
        backType: 'mesma_arte'
      }
    ],
    calculation: {
      totalLinearMeters: 450,
      paperRows: 60,
      paperMetersPerSide: 90,
      paperConsumptionMeters: 189, // (450*2 / 5) * 1.05
      estimatedCost: 350.00,
      estimatedTimePlotter: '0h 45m',
      estimatedTimeCalandra: '0h 15m'
    }
  },
  {
    id: 'OP-1024',
    clientId: '2',
    clientName: 'Agência Criativa',
    date: '2024-05-12',
    deadline: '2024-05-18',
    status: 'calandra',
    totalValue: 3200.00,
    opNumber: '1024',
    items: [
      { 
        productType: 'tirante',
        width: '25mm', 
        quantity: 1000, 
        unitPrice: 3.20, 
        colorBase: 'Branco', 
        finishings: [{ type: 'trava', quantity: 1 }, { type: 'mosquetao', quantity: 1 }],
        backType: 'mesma_arte'
      }
    ],
    calculation: {
      totalLinearMeters: 900,
      paperRows: 50,
      paperMetersPerSide: 180,
      paperConsumptionMeters: 378,
      estimatedCost: 800.00,
      estimatedTimePlotter: '1h 30m',
      estimatedTimeCalandra: '0h 30m'
    }
  },
  {
    id: 'OP-1025',
    clientId: '3',
    clientName: 'Tech Conference 2024',
    date: '2024-05-14',
    deadline: '2024-05-25',
    status: 'orcamento',
    totalValue: 5000.00,
    items: [
      { 
        productType: 'tirante',
        width: '20mm', 
        quantity: 2000, 
        unitPrice: 2.50, 
        colorBase: 'Branco', 
        finishings: [{ type: 'jacare', quantity: 1 }],
        backType: 'mesma_arte'
      }
    ],
    calculation: {
      totalLinearMeters: 1800,
      paperRows: 60,
      paperMetersPerSide: 360,
      paperConsumptionMeters: 756,
      estimatedCost: 1500.00,
      estimatedTimePlotter: '2h 45m',
      estimatedTimeCalandra: '0h 50m'
    }
  }
];