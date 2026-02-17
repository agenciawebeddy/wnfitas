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
  // Ex: 100 fitas * 0.90m = 90m de fita
  const totalTapeMeters = quantity * LANYARD_LENGTH_METERS;
  
  // 2. Cálculo de Papel por Lado (Frente ou Verso) - Sem margem de segurança para exibição visual
  // Ex: 90m fita / 5 fileiras = 18m de papel para um lado
  const paperMetersPerSide = totalTapeMeters / itemsPerRow;
  
  // 3. Total de metros de IMPRESSÃO (Frente + Verso)
  // "Somar o metro linear x 2"
  const totalPrintMeters = totalTapeMeters * 2;

  // 4. Cálculo de consumo de Papel TOTAL para custos (com margem)
  // Dividimos o total de impressão pelas colunas da bobina (5)
  const rawPaperConsumption = totalPrintMeters / itemsPerRow;
  const paperConsumptionMeters = rawPaperConsumption * 1.05; // +5% margem

  // Estimativa de Tinta (12ml por m²)
  const paperAreaSqm = (paperConsumptionMeters * (paperWidthMm / 1000));
  const inkConsumptionLitres = (paperAreaSqm * 12) / 1000; // 12ml avg

  // Estimativa de Custo (Valores base)
  const paperCost = paperConsumptionMeters * (paperWidthMm === 220 ? 1.50 : 1.10); 
  const inkCost = inkConsumptionLitres * 80; // R$ 80 por litro
  const tapeCost = totalTapeMeters * 0.40; // R$ 0.40 por metro de fita crua
  
  const estimatedCost = paperCost + inkCost + tapeCost;

  // 5. Cálculo de Tempo Estimado
  let timePlotterStr = "--:--";
  let timeCalandraStr = "--:--";

  if (config && config.productionSettings) {
      // PLOTTER: Calcula velocidade em m/s e aplica à metragem de papel (linear com margem)
      const pConfig = config.productionSettings.plotter;
      const pTotalSecondsRef = (pConfig.timeMinutes * 60) + pConfig.timeSeconds;
      const pSpeedMetersPerSec = pConfig.referenceDistanceMeters / pTotalSecondsRef;
      
      const totalSecondsPlotter = paperConsumptionMeters / pSpeedMetersPerSec;
      
      const pHours = Math.floor(totalSecondsPlotter / 3600);
      const pMinutes = Math.floor((totalSecondsPlotter % 3600) / 60);
      timePlotterStr = `${pHours}h ${pMinutes}m`;

      // CALANDRA: Calcula velocidade em m/s e aplica à metragem de papel
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
    inkConsumptionLitres: parseFloat(inkConsumptionLitres.toFixed(3)),
    estimatedCost: parseFloat(estimatedCost.toFixed(2)),
    estimatedTimePlotter: timePlotterStr,
    estimatedTimeCalandra: timeCalandraStr
  };
};