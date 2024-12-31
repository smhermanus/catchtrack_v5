"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCreateQuota, useUpdateQuota } from "../_hooks/use-quotas";

const formSchema = z.object({
  quotaCode: z.string().min(1, "Quota code is required"),
  quotaAllocation: z.number().positive("Allocation must be positive"),
  startDate: z.date(),
  endDate: z.date(),
  marineResources: z.array(z.string()).min(1, "At least one resource is required"),
  productType: z.string().min(1, "Product type is required"),
  sectorName: z.string().min(1, "Sector is required"),
  species: z.array(z.object({
    id: z.number(),
    catchLimit: z.number().optional(),
    minimumSize: z.number().optional(),
    maximumSize: z.number().optional(),
    seasonStart: z.date().optional(),
    seasonEnd: z.date().optional(),
  })),
  landingSites: z.array(z.number()),
  rightsholders: z.array(z.number()),
  warningThreshold: z.number().min(0).max(100),
  criticalThreshold: z.number().min(0).max(100),
  seasonalRestrictions: z.array(z.object({
    startDate: z.date(),
    endDate: z.date(),
    reason: z.string(),
  })).optional(),
  notes: z.string().optional(),
});

type QuotaFormValues = z.infer<typeof formSchema>;

interface QuotaFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export function QuotaForm({ initialData, onSuccess }: QuotaFormProps) {
  const [selectedResources, setSelectedResources] = useState<string[]>(
    initialData?.marineResources || []
  );
  const [openResource, setOpenResource] = useState(false);

  const form = useForm<QuotaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      quotaCode: "",
      quotaAllocation: 0,
      startDate: new Date(),
      endDate: new Date(),
      marineResources: [],
      productType: "",
      sectorName: "",
      species: [],
      landingSites: [],
      rightsholders: [],
      warningThreshold: 20,
      criticalThreshold: 10,
      seasonalRestrictions: [],
      notes: "",
    },
  });

  const createQuota = useCreateQuota();
  const updateQuota = useUpdateQuota();

  const onSubmit = async (values: QuotaFormValues) => {
    try {
      if (initialData) {
        await updateQuota.mutateAsync({
          id: initialData.id,
          data: values,
        });
        toast.success("Quota updated successfully");
      } else {
        await createQuota.mutateAsync(values);
        toast.success("Quota created successfully");
      }
      onSuccess?.();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const resources = [
    "West Coast Rock Lobster",
    "South Coast Rock Lobster",
    "Hake",
    "Small Pelagics",
    "Line Fish",
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="quotaCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quota Code</FormLabel>
                <FormControl>
                  <Input placeholder="QT-2024-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quotaAllocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quota Allocation (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date > form.getValues("endDate")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < form.getValues("startDate")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marineResources"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Marine Resources</FormLabel>
                <Popover open={openResource} onOpenChange={setOpenResource}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        Select resources
                        <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search resources..." />
                      <CommandEmpty>No resource found.</CommandEmpty>
                      <CommandGroup>
                        {resources.map((resource) => (
                          <CommandItem
                            value={resource}
                            key={resource}
                            onSelect={() => {
                              const newResources = selectedResources.includes(resource)
                                ? selectedResources.filter((x) => x !== resource)
                                : [...selectedResources, resource];
                              setSelectedResources(newResources);
                              field.onChange(newResources);
                            }}
                          >
                            {resource}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedResources.map((resource) => (
                    <Badge
                      key={resource}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {resource}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          const newResources = selectedResources.filter(
                            (x) => x !== resource
                          );
                          setSelectedResources(newResources);
                          field.onChange(newResources);
                        }}
                      />
                    </Badge>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="productType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Fresh">Fresh</SelectItem>
                    <SelectItem value="Frozen">Frozen</SelectItem>
                    <SelectItem value="Live">Live</SelectItem>
                    <SelectItem value="Processed">Processed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sectorName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sector</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Small Scale">Small Scale</SelectItem>
                    <SelectItem value="Recreational">Recreational</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="warningThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warning Threshold (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="20"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Alert when quota usage reaches this percentage
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="criticalThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Critical Threshold (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="10"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Alert when quota balance falls below this percentage
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes or comments..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createQuota.isPending || updateQuota.isPending}
          >
            {initialData ? "Update" : "Create"} Quota
          </Button>
        </div>
      </form>
    </Form>
  );
}
