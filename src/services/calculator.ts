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
  config?: PricingConfig,
  itemsPerRow: number = 5 
): ProductionCalculation => {
  const lengthMeters = PRODUCT_LENGTHS[productType];
  
  let paperWidthMm = 150;
  const effectiveItemsPerRow = itemsPerRow > 0 ? itemsPerRow : 5;

  if ((productType === 'tirante' || productType === 'tirante_copo') && width === '25mm') {
    paperWidthMm = 220;
  } else {
    paperWidthMm = 150; 
  }
  
  const totalTapeMeters = quantity * lengthMeters;
  const paperMetersPerSide = totalTapeMeters / effectiveItemsPerRow;
  const totalPrintMeters = totalTapeMeters * 2;
  const rawPaperConsumption = totalPrintMeters / effectiveItemsPerRow;
  const paperConsumptionMeters = rawPaperConsumption * 1.05; 

  const paperCost = paperConsumptionMeters * (paperWidthMm === 220 ? 1.50 : 1.10); 
  const tapeCost = totalTapeMeters * 0.40; 
  
  const estimatedCost = paperCost + tapeCost;

  let timePlotterStr = "--:--";
  let timeCalandraStr = "--:--";

  if (config && config.productionSettings) {
      // Plotter
      const pConfig = config.productionSettings.plotter;
      const pTotalSecondsRef = (pConfig.timeMinutes * 60) + pConfig.timeSeconds;
      if (pTotalSecondsRef > 0) {
        const pSpeedMetersPerSec = pConfig.referenceDistanceMeters / pTotalSecondsRef;
        const totalSecondsPlotter = paperConsumptionMeters / pSpeedMetersPerSec;
        const pHours = Math.floor(totalSecondsPlotter / 3600);
        const pMinutes = Math.floor((totalSecondsPlotter % 3600) / 60);
        timePlotterStr = `${pHours}h ${pMinutes}m`;
      }

      // Calandra
      const cConfig = config.productionSettings.calandra;
      const cTotalSecondsRef = (cConfig.timeMinutes * 60) + cConfig.timeSeconds;
      if (cTotalSecondsRef > 0) {
        const cSpeedMetersPerSec = cConfig.referenceDistanceMeters / cTotalSecondsRef;
        const totalSecondsCalandra = paperConsumptionMeters / cSpeedMetersPerSec;
        const cHours = Math.floor(totalSecondsCalandra / 3600);
        const cMinutes = Math.floor((totalSecondsCalandra % 3600) / 60);
        timeCalandraStr = `${cHours}h ${cMinutes}m`;
      }
  }

  return {
    totalLinearMeters: Math.ceil(totalTapeMeters),
    paperRows: effectiveItemsPerRow,
    paperMetersPerSide: parseFloat(paperMetersPerSide.toFixed(2)),
    paperConsumptionMeters: parseFloat(paperConsumptionMeters.toFixed(2)),
    estimatedCost: parseFloat(estimatedCost.toFixed(2)),
    estimatedTimePlotter: timePlotterStr,
    estimatedTimeCalandra: timeCalandraStr
  };
};