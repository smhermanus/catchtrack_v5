'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoom } from '@/hooks';
import { HeaderComponent, FooterComponent, TableComponent, ChartComponent, ImageComponent, TextComponent, SignatureComponent, QRCodeComponent, BarcodeComponent, MapComponent, WeatherWidget, CatchSummaryComponent, VesselStatsComponent, QuotaProgressComponent, TimelineComponent, AnnotationsComponent } from '@/components/dashboard/reports/template-components';

interface TemplateComponent {
  id: string;
  type: keyof typeof templateComponents;
  title: string;
  config: TemplateComponentConfig;
}

interface TemplateComponentItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}

const templateComponents: Record<string, TemplateComponentItem> = {
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
};

type TemplateComponentConfig = 
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

interface ChartConfig {
  chartType: string;
  dataSource: string;
  xAxis?: string;
  yAxis?: string;
}

interface TableConfig {
  dataSource: string;
  columns: string[];
  sortBy?: string;
}

interface TextConfig {
  content: string;
  fontSize?: number;
  fontColor?: string;
}

interface ImageConfig {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface SignatureConfig {
  required: boolean;
  label?: string;
}

interface QRCodeConfig {
  data: string;
  size?: number;
}

interface BarcodeConfig {
  data: string;
  type: 'CODE128' | 'CODE39' | 'EAN13' | 'UPC';
}

interface MapConfig {
  latitude: number;
  longitude: number;
  zoom?: number;
}

interface WeatherWidgetConfig {
  location: string;
  units?: 'metric' | 'imperial';
}

interface CatchSummaryConfig {
  dateRange?: {
    start: string;
    end: string;
  };
}

interface VesselStatsConfig {
  vesselId: string;
}

interface QuotaProgressConfig {
  speciesId: string;
}

interface TimelineConfig {
  events: Array<{
    date: string;
    description: string;
  }>;
}

interface AnnotationsConfig {
  annotations: Array<{
    text: string;
    color?: string;
  }>;
}

interface TemplateSettings {
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

interface TemplateDesignerProps {
  onSave: (template: {
    name: string;
    components: TemplateComponent[];
    settings: TemplateSettings;
  }) => void;
}

const templateSettings: TemplateSettings = {
  pageSize: 'A4',
  orientation: 'portrait',
  margins: {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  },
  headerHeight: 50,
  footerHeight: 50,
  theme: {
    primaryColor: '#333',
    secondaryColor: '#666',
    fontFamily: 'Arial',
  },
};

export function TemplateDesigner({ onSave }: TemplateDesignerProps) {
  const { room } = useRoom();
  
  const [components, setComponents] = useState<TemplateComponent[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [settings, setSettings] = useState(templateSettings);

  const componentTypes = Object.keys(templateComponents).map((id) => ({
    id,
    icon: templateComponents[id].icon,
    title: templateComponents[id].title,
  }));

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setComponents(items);
    room.broadcast({ type: 'COMPONENTS_UPDATE', components: items });
  };

  const addComponent = (type: TemplateComponent['type']) => {
    const newComponent: TemplateComponent = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      config: {} as TemplateComponentConfig,
    };
    setComponents([...components, newComponent]);
  };

  const updateComponent = (id: string, updates: Partial<TemplateComponent>) => {
    setComponents(components.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  const removeComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id));
  };

  const handleSave = () => {
    onSave({
      name: templateName,
      components,
      settings,
    });
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Template Designer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>

            <Tabs defaultValue="layout">
              <TabsList>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="layout" className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Page Orientation</Label>
                    <Select
                      value={settings.orientation}
                      onValueChange={(value: 'portrait' | 'landscape') => 
                        setSettings({ ...settings, orientation: value })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(['portrait', 'landscape'] as const).map((orientation) => (
                          <SelectItem key={orientation} value={orientation}>{orientation}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Page Size</Label>
                    <Select
                      value={settings.pageSize}
                      onValueChange={(value: 'A4' | 'Letter' | 'Legal') => 
                        setSettings({ ...settings, pageSize: value })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(['A4', 'Letter', 'Legal'] as const).map((pageSize) => (
                          <SelectItem key={pageSize} value={pageSize}>{pageSize}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Include Header</Label>
                    <Switch
                      checked={settings.headerHeight !== undefined}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, headerHeight: checked ? 50 : undefined })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Include Footer</Label>
                    <Switch
                      checked={settings.footerHeight !== undefined}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, footerHeight: checked ? 50 : undefined })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Include Date Range</Label>
                    <Switch
                      checked={settings.margins !== undefined}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, margins: checked ? { top: 10, right: 10, bottom: 10, left: 10 } : undefined })
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="components" className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {componentTypes.map(({ id, icon: Icon, title }) => (
                    <Button
                      key={id}
                      variant="outline"
                      className="h-20"
                      onClick={() => addComponent(id as TemplateComponent['type'])}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {Icon && <Icon className="h-6 w-6" />}
                        <span>{title}</span>
                      </div>
                    </Button>
                  ))}
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="components">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2"
                      >
                        {components.map((component, index) => (
                          <Draggable
                            key={component.id}
                            draggableId={component.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="border rounded-lg p-4"
                              >
                                <div className="flex items-center justify-between">
                                  <Input
                                    value={component.title}
                                    onChange={(e) =>
                                      updateComponent(component.id, {
                                        title: e.target.value,
                                      })
                                    }
                                    className="w-[200px]"
                                  />
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeComponent(component.id)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </TabsContent>

              <TabsContent value="preview" className="min-h-[500px]">
                {/* Add preview rendering logic */}
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave}>Save Template</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
