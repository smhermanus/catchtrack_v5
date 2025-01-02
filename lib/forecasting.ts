import { addDays, subDays, format } from 'date-fns';

// Core interfaces for quota and catch data
export interface Catch {
  id: string;
  date: Date;
  weight: number;
  vesselId: string;
  quotaId: string;
}

export interface Vessel {
  id: string;
  name: string;
  registration: string;
}

export interface QuotaWithRelations {
  id: string;
  totalAllocation: number;
  startDate: Date;
  endDate: Date;
  catches: Catch[];
  vessels: Vessel[];
}

// Forecast related interfaces
export interface ForecastOptions {
  model: 'linear' | 'exponential' | 'moving-average';
  daysToForecast: number;
  historicalDays: number;
  confidenceInterval?: number;
}

export interface DailyUsage {
  date: string;
  usage: number;
}

export interface ForecastData {
  date: string;
  projected: number;
  lowerBound?: number;
  upperBound?: number;
}

export interface ForecastResult {
  forecast: ForecastData[];
  remainingQuota: number;
  projectedEndDate: Date | null;
  projectedOverage: number | null;
}

/**
 * Generates a forecast for quota usage based on historical data
 * @param quota The quota with related catches and vessels
 * @param options Configuration options for the forecast
 * @returns Complete forecast results including projections and analysis
 */
export function generateQuotaForecast(
  quota: QuotaWithRelations,
  options: ForecastOptions
): ForecastResult {
  const historicalData = getHistoricalData(quota, options.historicalDays);
  let forecast: ForecastData[];

  // Generate base forecast using specified model
  switch (options.model) {
    case 'exponential':
      forecast = exponentialSmoothing(historicalData, options.daysToForecast);
      break;
    case 'moving-average':
      forecast = movingAverage(historicalData, options.daysToForecast);
      break;
    default:
      forecast = linearRegression(historicalData, options.daysToForecast);
  }

  // Add confidence intervals if requested
  if (options.confidenceInterval) {
    forecast = addConfidenceIntervals(forecast, options.confidenceInterval);
  }

  // Calculate remaining quota and projections
  const usedQuota = quota.catches.reduce((sum: number, c) => sum + c.weight, 0);
  const remainingQuota = quota.totalAllocation - usedQuota;
  const projectedUsage = forecast.reduce((sum: number, f) => sum + f.projected, 0);

  // Determine if and when quota will be exceeded
  let projectedEndDate: Date | null = null;
  let projectedOverage: number | null = null;

  if (projectedUsage > remainingQuota) {
    projectedOverage = projectedUsage - remainingQuota;
    // Find the date when quota is projected to be exceeded
    let cumulativeUsage = 0;
    for (const day of forecast) {
      cumulativeUsage += day.projected;
      if (cumulativeUsage > remainingQuota) {
        projectedEndDate = new Date(day.date);
        break;
      }
    }
  }

  return {
    forecast,
    remainingQuota,
    projectedEndDate,
    projectedOverage,
  };
}

/**
 * Retrieves and processes historical catch data
 */
function getHistoricalData(quota: QuotaWithRelations, days: number): DailyUsage[] {
  const startDate = subDays(new Date(), days);
  const dailyUsage: DailyUsage[] = [];

  for (let i = 0; i <= days; i++) {
    const date = addDays(startDate, i);
    const formattedDate = format(date, 'yyyy-MM-dd');
    const daysCatches = quota.catches.filter((c) => format(c.date, 'yyyy-MM-dd') === formattedDate);
    const usage = daysCatches.reduce((sum: number, c) => sum + c.weight, 0);
    dailyUsage.push({ date: formattedDate, usage });
  }

  return dailyUsage;
}

/**
 * Implements linear regression forecasting
 */
function linearRegression(historicalData: DailyUsage[], daysToForecast: number): ForecastData[] {
  const n = historicalData.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = historicalData.map((d) => d.usage);

  // Calculate regression coefficients
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, curr, i) => acc + curr * y[i], 0);
  const sumXX = x.reduce((acc, curr) => acc + curr * curr, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Generate forecast
  const forecast: ForecastData[] = [];
  const lastDate = new Date(historicalData[historicalData.length - 1].date);

  for (let i = 1; i <= daysToForecast; i++) {
    const forecastDate = addDays(lastDate, i);
    const forecastValue = slope * (n + i) + intercept;
    forecast.push({
      date: format(forecastDate, 'yyyy-MM-dd'),
      projected: Math.max(0, forecastValue),
    });
  }

  return forecast;
}

/**
 * Implements exponential smoothing forecasting
 */
function exponentialSmoothing(
  historicalData: DailyUsage[],
  daysToForecast: number,
  alpha = 0.3
): ForecastData[] {
  const y = historicalData.map((d) => d.usage);
  let lastSmoothed = y[0];
  const smoothed = [lastSmoothed];

  // Calculate smoothed values
  for (let i = 1; i < y.length; i++) {
    lastSmoothed = alpha * y[i] + (1 - alpha) * lastSmoothed;
    smoothed.push(lastSmoothed);
  }

  // Generate forecast
  const forecast: ForecastData[] = [];
  const lastDate = new Date(historicalData[historicalData.length - 1].date);

  for (let i = 1; i <= daysToForecast; i++) {
    const forecastDate = addDays(lastDate, i);
    forecast.push({
      date: format(forecastDate, 'yyyy-MM-dd'),
      projected: Math.max(0, lastSmoothed),
    });
  }

  return forecast;
}

/**
 * Implements moving average forecasting
 */
function movingAverage(
  historicalData: DailyUsage[],
  daysToForecast: number,
  windowSize = 7
): ForecastData[] {
  const y = historicalData.map((d) => d.usage);
  const ma: number[] = [];

  // Calculate moving average
  for (let i = windowSize - 1; i < y.length; i++) {
    const window = y.slice(i - windowSize + 1, i + 1);
    const average = window.reduce((a, b) => a + b, 0) / windowSize;
    ma.push(average);
  }

  // Use the last moving average as the forecast value
  const lastMA = ma[ma.length - 1];
  const forecast: ForecastData[] = [];
  const lastDate = new Date(historicalData[historicalData.length - 1].date);

  for (let i = 1; i <= daysToForecast; i++) {
    const forecastDate = addDays(lastDate, i);
    forecast.push({
      date: format(forecastDate, 'yyyy-MM-dd'),
      projected: Math.max(0, lastMA),
    });
  }

  return forecast;
}

/**
 * Adds confidence intervals to forecast data
 */
function addConfidenceIntervals(forecast: ForecastData[], confidenceLevel: number): ForecastData[] {
  return forecast.map((day) => {
    const margin = day.projected * (confidenceLevel / 100);
    return {
      ...day,
      lowerBound: Math.max(0, day.projected - margin),
      upperBound: day.projected + margin,
    };
  });
}
