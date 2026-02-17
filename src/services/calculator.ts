import { LanyardWidth, ProductionCalculation, PricingConfig } from '../types';

const LANYARD_LENGTH_METERS = 0.90; // 900mm

export const calculateProduction = (
  width: LanyardWidth,
  quantity: number,
  config?: PricingConfig // Config agora é opcional mas idealmente passado para cálculos de tempo
): ProductionCalculation => {
  // Configuração das Bobinas:
  // Fitas 15mm e 20mm -> Bobina 150mm (5 artes por fileira)
  // Fita 25mm -> Bobina 220mm (5 artes por fileira)
  
  let paperWidthMm = 150;
  const itemsPerRow = 5; // Fixo conforme regra de negócio (5 artes por coluna da bobina)

  if (width === '25mm') {
    paperWidthMm = 220;
  } else {
    paperWidthMm = 150; // 15mm e 20mm
  }
  
  // 1. Total de metros lineares de FITA (Material cru)
  const totalTapeMeters = quantity * LANYARD_LENGTH_METERS;
  
  // 2. Cálculo de Papel por Lado (Frente ou Verso)
  const paperMetersPerSide = totalTapeMeters / itemsPerRow;
  
  // 3. Total de metros de IMPRESSÃO (Frente + Verso)
  const totalPrintMeters = totalTapeMeters * 2;

  // 4. Cálculo de consumo de Papel TOTAL para custos (com margem)
  const rawPaperConsumption = totalPrintMeters / itemsPerRow;
  const paperConsumptionMeters = rawPaperConsumption * 1.05; // +5% margem

  // Estimativa de Custo (Valores base sem tinta)
  const paperCost = paperConsumptionMeters * (paperWidthMm === 220 ? 1.50 : 1.10); 
  const tapeCost = totalTapeMeters * 0.40; // R$ 0.40 por metro de fita crua
  
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