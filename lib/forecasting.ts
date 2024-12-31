import { addDays, subDays, format } from 'date-fns';
import { QuotaWithRelations } from '@/types/quota';

interface ForecastOptions {
  model: 'linear' | 'exponential' | 'moving-average';
  daysToForecast: number;
  historicalDays: number;
}

export function generateQuotaForecast(quota: QuotaWithRelations, options: ForecastOptions) {
  const historicalData = getHistoricalData(quota, options.historicalDays);
  
  switch (options.model) {
    case 'exponential':
      return exponentialSmoothing(historicalData, options.daysToForecast);
    case 'moving-average':
      return movingAverage(historicalData, options.daysToForecast);
    default:
      return linearRegression(historicalData, options.daysToForecast);
  }
}

function getHistoricalData(quota: QuotaWithRelations, days: number) {
  const startDate = subDays(new Date(), days);
  const dailyUsage: { date: string; usage: number }[] = [];

  for (let i = 0; i <= days; i++) {
    const date = addDays(startDate, i);
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    const daysCatches = quota.catches.filter(
      (c) => format(c.date, 'yyyy-MM-dd') === formattedDate
    );
    
    const usage = daysCatches.reduce((sum, c) => sum + c.weight, 0);
    dailyUsage.push({ date: formattedDate, usage });
  }

  return dailyUsage;
}

function linearRegression(
  historicalData: { date: string; usage: number }[],
  daysToForecast: number
) {
  const n = historicalData.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = historicalData.map(d => d.usage);

  // Calculate coefficients
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, curr, i) => acc + curr * y[i], 0);
  const sumXX = x.reduce((acc, curr) => acc + curr * curr, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Generate forecast
  const forecast = [];
  const lastDate = new Date(historicalData[historicalData.length - 1].date);

  for (let i = 1; i <= daysToForecast; i++) {
    const forecastDate = addDays(lastDate, i);
    const forecastValue = slope * (n + i) + intercept;
    forecast.push({
      date: format(forecastDate, 'yyyy-MM-dd'),
      projected: Math.max(0, forecastValue), // Ensure non-negative values
    });
  }

  return forecast;
}

function exponentialSmoothing(
  historicalData: { date: string; usage: number }[],
  daysToForecast: number,
  alpha = 0.3
) {
  const y = historicalData.map(d => d.usage);
  let lastSmoothed = y[0];
  const smoothed = [lastSmoothed];

  // Calculate smoothed values
  for (let i = 1; i < y.length; i++) {
    lastSmoothed = alpha * y[i] + (1 - alpha) * lastSmoothed;
    smoothed.push(lastSmoothed);
  }

  // Generate forecast
  const forecast = [];
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

function movingAverage(
  historicalData: { date: string; usage: number }[],
  daysToForecast: number,
  windowSize = 7
) {
  const y = historicalData.map(d => d.usage);
  const ma = [];

  // Calculate moving average
  for (let i = windowSize - 1; i < y.length; i++) {
    const window = y.slice(i - windowSize + 1, i + 1);
    const average = window.reduce((a, b) => a + b, 0) / windowSize;
    ma.push(average);
  }

  // Use the last moving average as the forecast value
  const lastMA = ma[ma.length - 1];
  const forecast = [];
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
