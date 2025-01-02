// types/template-types.ts
import {
  HeaderComponent,
  FooterComponent,
  TableComponent,
  ChartComponent,
  ImageComponent,
  TextComponent,
  SignatureComponent,
  QRCodeComponent,
  BarcodeComponent,
  MapComponent,
  WeatherWidget,
  CatchSummaryComponent,
  VesselStatsComponent,
  QuotaProgressComponent,
  TimelineComponent,
  AnnotationsComponent,
} from '@/components/dashboard/reports/template-components';

export interface TemplateComponent {
  id: string;
  type: keyof typeof templateComponents;
  title: string;
  config: TemplateComponentConfig;
}

export interface TemplateComponentItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}

export const templateComponents = {
  header: { title: 'Header', icon: HeaderComponent },
  footer: { title: 'Footer', icon: FooterComponent },
  table: { title: 'Table', icon: TableComponent },
  chart: { title: 'Chart', icon: ChartComponent },
  image: { title: 'Image', icon: ImageComponent },
  text: { title: 'Text', icon: TextComponent },
  signature: { title: 'Signature', icon: SignatureComponent },
  qrCode: { title: 'QR Code', icon: QRCodeComponent },
  barcode: { title: 'Barcode', icon: BarcodeComponent },
  map: { title: 'Map', icon: MapComponent },
  weatherWidget: { title: 'Weather Widget', icon: WeatherWidget },
  catchSummary: { title: 'Catch Summary', icon: CatchSummaryComponent },
  vesselStats: { title: 'Vessel Stats', icon: VesselStatsComponent },
  quotaProgress: { title: 'Quota Progress', icon: QuotaProgressComponent },
  timeline: { title: 'Timeline', icon: TimelineComponent },
  annotations: { title: 'Annotations', icon: AnnotationsComponent },
} as const;

export interface ChartConfig {
  chartType: string;
  dataSource: string;
  xAxis?: string;
  yAxis?: string;
}

export interface TableConfig {
  dataSource: string;
  columns: string[];
  sortBy?: string;
}

export interface TextConfig {
  content: string;
  fontSize?: number;
  fontColor?: string;
}

export interface ImageConfig {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface SignatureConfig {
  required: boolean;
  label?: string;
}

export interface QRCodeConfig {
  data: string;
  size?: number;
}

export interface BarcodeConfig {
  data: string;
  type: 'CODE128' | 'CODE39' | 'EAN13' | 'UPC';
}

export interface MapConfig {
  latitude: number;
  longitude: number;
  zoom?: number;
}

export interface WeatherWidgetConfig {
  location: string;
  units?: 'metric' | 'imperial';
}

export interface CatchSummaryConfig {
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface VesselStatsConfig {
  vesselId: string;
}

export interface QuotaProgressConfig {
  speciesId: string;
}

export interface TimelineConfig {
  events: Array<{
    date: string;
    description: string;
  }>;
}

export interface AnnotationsConfig {
  annotations: Array<{
    text: string;
    color?: string;
  }>;
}

export type TemplateComponentConfig =
  | ChartConfig
  | TableConfig
  | TextConfig
  | ImageConfig
  | SignatureConfig
  | QRCodeConfig
  | BarcodeConfig
  | MapConfig
  | WeatherWidgetConfig
  | CatchSummaryConfig
  | VesselStatsConfig
  | QuotaProgressConfig
  | TimelineConfig
  | AnnotationsConfig;

export interface TemplateSettings {
  pageSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  headerHeight?: number;
  footerHeight?: number;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
  };
}

export interface Template {
  name: string;
  components: TemplateComponent[];
  settings: TemplateSettings;
}
