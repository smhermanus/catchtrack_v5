import { addDays, format } from 'date-fns';
import { QuotaWithRelations } from '@/types/quota'; // eslint-disable-line @typescript-eslint/no-unused-vars

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

// Holt-Winters Triple Exponential Smoothing
export function holtWinters(
  data: TimeSeriesPoint[],
  quota: QuotaWithRelations,
  daysToForecast: number,
  alpha = 0.3,
  beta = 0.1,
  gamma = 0.1,
  period = 7
) {
  // Use quota information to potentially adjust forecasting
  const maxForecastValue = quota.remainingAmount;
  const y = data.map((d) => d.value);
  const n = y.length;

  // Initialize seasonal components
  const seasonals: number[] = Array(period).fill(0);
  for (let i = 0; i < period; i++) {
    const seasonalSum = Math.floor(n / period);
    let sum = 0;
    for (let j = 0; j < seasonalSum; j++) {
      sum += y[i + j * period] || 0;
    }
    seasonals[i] = sum / seasonalSum;
  }

  // Normalize seasonal components
  const seasonalAverage = seasonals.reduce((a, b) => a + b, 0) / period;
  for (let i = 0; i < period; i++) {
    seasonals[i] /= seasonalAverage;
  }

  let level = y[0];
  let trend = (y[1] - y[0]) / period;
  const results: number[] = [];

  // Calculate initial values
  for (let i = 0; i < n; i++) {
    const observation = y[i];
    const lastLevel = level;
    const seasonalIndex = i % period;

    // Update components
    level = alpha * (observation / seasonals[seasonalIndex]) + (1 - alpha) * (lastLevel + trend);
    trend = beta * (level - lastLevel) + (1 - beta) * trend;
    seasonals[seasonalIndex] =
      gamma * (observation / level) + (1 - gamma) * seasonals[seasonalIndex];

    // Calculate forecast
    results.push(level + trend + seasonals[seasonalIndex]);
  }

  // Forecast
  const forecast: number[] = [];
  for (let i = 0; i < daysToForecast; i++) {
    const seasonalIndex = (n + i) % period;
    const forecastValue = Math.min(
      level + trend * (i + 1) + seasonals[seasonalIndex],
      maxForecastValue // Ensure forecast doesn't exceed remaining quota
    );
    forecast.push(forecastValue);
  }

  return forecast;
}

// SARIMA-inspired seasonal decomposition
export function seasonalDecomposition(data: TimeSeriesPoint[], daysToForecast: number, period = 7) {
  const y = data.map((d) => d.value);
  const n = y.length;

  // Calculate moving average
  const ma: number[] = [];
  for (let i = Math.floor(period / 2); i < n - Math.floor(period / 2); i++) {
    let sum = 0;
    for (let j = -Math.floor(period / 2); j <= Math.floor(period / 2); j++) {
      sum += y[i + j];
    }
    ma.push(sum / period);
  }

  // Calculate seasonal components
  const seasonal: number[] = Array(period).fill(0);
  for (let i = 0; i < n; i++) {
    const maIndex = i - Math.floor(period / 2);
    if (maIndex >= 0 && maIndex < ma.length) {
      const seasonalIndex = i % period;
      seasonal[seasonalIndex] += y[i] / ma[maIndex];
    }
  }

  // Normalize seasonal components
  for (let i = 0; i < period; i++) {
    const count = Math.floor(n / period);
    seasonal[i] = seasonal[i] / count;
  }

  // Calculate trend using linear regression on deseasonalized data
  const deseasonalized = y.map((val, i) => val / seasonal[i % period]);
  const x = Array.from({ length: n }, (_, i) => i);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = deseasonalized.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, curr, i) => acc + curr * deseasonalized[i], 0);
  const sumXX = x.reduce((acc, curr) => acc + curr * curr, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Generate forecast
  const forecast: TimeSeriesPoint[] = [];
  const lastDate = new Date(data[data.length - 1].date);

  for (let i = 1; i <= daysToForecast; i++) {
    const forecastDate = addDays(lastDate, i);
    const trend = slope * (n + i) + intercept;
    const seasonalFactor = seasonal[(n + i - 1) % period];
    const forecastValue = trend * seasonalFactor;

    forecast.push({
      date: format(forecastDate, 'yyyy-MM-dd'),
      value: Math.max(0, forecastValue),
    });
  }

  return forecast;
}

// Prophet-inspired changepoint detection
export function changePointForecast(
  data: TimeSeriesPoint[],
  daysToForecast: number,
  changePointPrior = 0.05
) {
  const y = data.map((d) => d.value);
  const n = y.length;
  const potentialChangePoints: number[] = [];

  // Detect potential change points using gradient changes
  for (let i = 1; i < n - 1; i++) {
    const gradBefore = y[i] - y[i - 1];
    const gradAfter = y[i + 1] - y[i];
    const gradChange = Math.abs(gradAfter - gradBefore);

    if (gradChange > changePointPrior * Math.max(...y)) {
      potentialChangePoints.push(i);
    }
  }

  // Split data into segments and fit linear models
  const segments: { start: number; end: number; slope: number; intercept: number }[] = [];
  let lastPoint = 0;

  for (const changePoint of [...potentialChangePoints, n - 1]) {
    const segmentX = Array.from({ length: changePoint - lastPoint + 1 }, (_, i) => lastPoint + i);
    const segmentY = y.slice(lastPoint, changePoint + 1);

    const sumX = segmentX.reduce((a, b) => a + b, 0);
    const sumY = segmentY.reduce((a, b) => a + b, 0);
    const sumXY = segmentX.reduce((acc, curr, i) => acc + curr * segmentY[i], 0);
    const sumXX = segmentX.reduce((acc, curr) => acc + curr * curr, 0);

    const slope = (segmentY.length * sumXY - sumX * sumY) / (segmentY.length * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / segmentY.length;

    segments.push({ start: lastPoint, end: changePoint, slope, intercept });
    lastPoint = changePoint + 1;
  }

  // Use the last segment for forecasting
  const lastSegment = segments[segments.length - 1];
  const forecast: TimeSeriesPoint[] = [];
  const lastDate = new Date(data[data.length - 1].date);

  for (let i = 1; i <= daysToForecast; i++) {
    const forecastDate = addDays(lastDate, i);
    const forecastValue = lastSegment.slope * (n + i) + lastSegment.intercept;

    forecast.push({
      date: format(forecastDate, 'yyyy-MM-dd'),
      value: Math.max(0, forecastValue),
    });
  }

  return forecast;
}
