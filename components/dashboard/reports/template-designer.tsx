'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useRoom } from '@/types/room';
import { TemplateComponent, TemplateSettings, templateComponents } from '@/types/template-types';

interface TemplateDesignerProps {
  onSave: (template: {
    name: string;
    components: TemplateComponent[];
    settings: TemplateSettings;
  }) => void;
}

const defaultSettings: TemplateSettings = {
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
  const { room, isConnected } = useRoom();
  const [components, setComponents] = useState<TemplateComponent[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [settings, setSettings] = useState<TemplateSettings>(defaultSettings);

  const componentTypes = Object.entries(templateComponents).map(([id, component]) => ({
    id,
    icon: component.icon,
    title: component.title,
  }));

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setComponents(items);
    if (isConnected) {
      room.broadcast({ type: 'COMPONENTS_UPDATE', components: items });
    }
  };

  const addComponent = (type: keyof typeof templateComponents) => {
    const newComponent: TemplateComponent = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      config: {},
    };
    setComponents([...components, newComponent]);
  };

  const updateComponent = (id: string, updates: Partial<TemplateComponent>) => {
    const updatedComponents = components.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setComponents(updatedComponents);
    if (isConnected) {
      room.broadcast({
        type: 'COMPONENTS_UPDATE',
        components: updatedComponents,
      });
    }
  };

  const removeComponent = (id: string) => {
    const filteredComponents = components.filter((c) => c.id !== id);
    setComponents(filteredComponents);
    if (isConnected) {
      room.broadcast({
        type: 'COMPONENTS_UPDATE',
        components: filteredComponents,
      });
    }
  };

  const handleSave = () => {
    onSave({
      name: templateName,
      components,
      settings,
    });
  };

  const renderComponentPreview = (component: TemplateComponent) => {
    const ComponentIcon = templateComponents[component.type].icon;
    return (
      <div className="p-4 border rounded-lg bg-white">
        <div className="flex items-center gap-2">
          <ComponentIcon className="h-5 w-5" />
          <span>{component.title}</span>
        </div>
      </div>
    );
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
                          <SelectItem key={orientation} value={orientation}>
                            {orientation.charAt(0).toUpperCase() + orientation.slice(1)}
                          </SelectItem>
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
                          <SelectItem key={pageSize} value={pageSize}>
                            {pageSize}
                          </SelectItem>
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
                </div>
              </TabsContent>

              <TabsContent value="components" className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {componentTypes.map(({ id, icon: Icon, title }) => (
                    <Button
                      key={id}
                      variant="outline"
                      className="h-20"
                      onClick={() => addComponent(id as keyof typeof templateComponents)}
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
                          <Draggable key={component.id} draggableId={component.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="border rounded-lg p-4 bg-white"
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
                <div className="space-y-4">
                  {components.map((component) => (
                    <div key={component.id}>{renderComponentPreview(component)}</div>
                  ))}
                </div>
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
