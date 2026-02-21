import { LanyardWidth, ProductionCalculation, PricingConfig, ProductType } from '../types';

const PRODUCT_LENGTHS: Record<ProductType, number> = {
  tirante: 0.90,
  tirante_copo: 1.40,
  chaveiro: 0.29,
  pulseira: 0.35
};

export const calculateProduction = (
  productType: ProductType,
  width: LanyardWidth,
  quantity: number,
  config?: PricingConfig
): ProductionCalculation => {
  const lengthMeters = PRODUCT_LENGTHS[productType];
  
  let paperWidthMm = 150;
  const itemsPerRow = 5; 

  // Chaveiros e Pulseiras sempre usam bobina de 15cm (150mm)
  // Tirantes de 25mm usam bobina de 22cm
  if ((productType === 'tirante' || productType === 'tirante_copo') && width === '25mm') {
    paperWidthMm = 220;
  } else {
    paperWidthMm = 150; 
  }
  
  // 1. Total de metros lineares de FITA
  const totalTapeMeters = quantity * lengthMeters;
  
  // 2. Cálculo de Papel por Lado
  const paperMetersPerSide = totalTapeMeters / itemsPerRow;
  
  // 3. Total de metros de IMPRESSÃO (Frente + Verso)
  const totalPrintMeters = totalTapeMeters * 2;

  // 4. Cálculo de consumo de Papel TOTAL
  const rawPaperConsumption = totalPrintMeters / itemsPerRow;
  const paperConsumptionMeters = rawPaperConsumption * 1.05; 

  // Estimativa de Custo
  const paperCost = paperConsumptionMeters * (paperWidthMm === 220 ? 1.50 : 1.10); 
  const tapeCost = totalTapeMeters * 0.40; 
  
  const estimatedCost = paperCost + tapeCost;

  // 5. Cálculo de Tempo Estimado
  let timePlotterStr = "--:--";
  let timeCalandraStr = "--:--";

  if (config && config.productionSettings) {
      const pConfig = config.productionSettings.plotter;
      const pTotalSecondsRef = (pConfig.timeMinutes * 60) + pConfig.timeSeconds;
      const pSpeedMetersPerSec = pConfig.referenceDistanceMeters / pTotalSecondsRef;
      
      const totalSecondsPlotter = paperConsumptionMeters / pSpeedMetersPerSec;
      
      const pHours = Math.floor(totalSecondsPlotter / 3600);
      const pMinutes = Math.floor((totalSecondsPlotter % 3600) / 60);
      timePlotterStr = `${pHours}h ${pMinutes}m`;

      const cConfig = config.productionSettings.calandra;
      const cSpeedMetersPerSec = cConfig.referenceDistanceMeters / cConfig.timeSeconds;

      const totalSecondsCalandra = paperConsumptionMeters / cSpeedMetersPerSec;

      const cHours = Math.floor(totalSecondsCalandra / 3600);
      const cMinutes = Math.floor((totalSecondsCalandra % 3600) / 60);
      timeCalandraStr = `${cHours}h ${cMinutes}m`;
  }

  return {
    totalLinearMeters: Math.ceil(totalTapeMeters),
    paperRows: itemsPerRow,
    paperMetersPerSide: parseFloat(paperMetersPerSide.toFixed(2)),
    paperConsumptionMeters: parseFloat(paperConsumptionMeters.toFixed(2)),
    estimatedCost: parseFloat(estimatedCost.toFixed(2)),
    estimatedTimePlotter: timePlotterStr,
    estimatedTimeCalandra: timeCalandraStr
  };
};