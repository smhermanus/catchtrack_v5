import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { QuotaWithRelations } from '@/types/quota';

interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  includeForecasts?: boolean;
  includeTrends?: boolean;
}

export async function generateQuotaReport(quotas: QuotaWithRelations[], options: ExportOptions) {
  const reportData = quotas.map(quota => {
    const totalCatch = quota.catches.reduce((sum, c) => sum + c.weight, 0);
    const remaining = quota.amount - totalCatch;
    const utilizationRate = (totalCatch / quota.amount) * 100;
    const daysUntilExpiry = Math.ceil(
      (quota.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      'Vessel Name': quota.vessel.name,
      'Total Quota (tons)': quota.amount,
      'Used Quota (tons)': totalCatch,
      'Remaining Quota (tons)': remaining,
      'Utilization Rate (%)': utilizationRate.toFixed(1),
      'Start Date': format(quota.startDate, 'yyyy-MM-dd'),
      'End Date': format(quota.endDate, 'yyyy-MM-dd'),
      'Days Until Expiry': daysUntilExpiry,
      'Status': utilizationRate >= 90 ? 'Critical' : utilizationRate >= 75 ? 'Warning' : 'Normal',
    };
  });

  switch (options.format) {
    case 'pdf':
      return generatePDF(reportData);
    case 'excel':
      return generateExcel(reportData);
    default:
      return generateCSV(reportData);
  }
}

function generatePDF(data: any[]) {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('Quota Management Report', 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated on ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 22);

  // Add table
  doc.autoTable({
    head: [Object.keys(data[0])],
    body: data.map(Object.values),
    startY: 30,
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 25 }, // Vessel Name
      1: { cellWidth: 20 }, // Total Quota
      2: { cellWidth: 20 }, // Used Quota
      3: { cellWidth: 20 }, // Remaining Quota
      4: { cellWidth: 20 }, // Utilization Rate
      5: { cellWidth: 20 }, // Start Date
      6: { cellWidth: 20 }, // End Date
      7: { cellWidth: 20 }, // Days Until Expiry
      8: { cellWidth: 20 }, // Status
    },
  });

  return doc.output('blob');
}

function generateExcel(data: any[]) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Add some styling
  const colWidths = [
    { wch: 15 }, // Vessel Name
    { wch: 12 }, // Total Quota
    { wch: 12 }, // Used Quota
    { wch: 12 }, // Remaining Quota
    { wch: 12 }, // Utilization Rate
    { wch: 12 }, // Start Date
    { wch: 12 }, // End Date
    { wch: 12 }, // Days Until Expiry
    { wch: 10 }, // Status
  ];

  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Quota Report');
  
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

function generateCSV(data: any[]) {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  return [headers, ...rows].join('\n');
}
