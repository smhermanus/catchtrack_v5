"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateComplianceRecord } from "../../_hooks/use-compliance";
import { toast } from "sonner";

const formSchema = z.object({
  violationType: z.string({
    required_error: "Please select a violation type",
  }),
  description: z.string().min(1, "Description is required"),
});

const violationTypes = [
  "QUOTA_EXCEEDANCE",
  "ILLEGAL_FISHING",
  "REPORTING_VIOLATION",
  "GEAR_VIOLATION",
  "AREA_VIOLATION",
  "DOCUMENTATION_VIOLATION",
  "OTHER",
] as const;

interface ComplianceFormProps {
  quotaId: string;
  onSuccess: () => void;
}

export function ComplianceForm({ quotaId, onSuccess }: ComplianceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const createCompliance = useCreateComplianceRecord();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      await createCompliance.mutateAsync({
        quotaId,
        data: values,
      });
      toast.success("Compliance record created successfully");
      onSuccess();
    } catch (error) {
      toast.error("Failed to create compliance record");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="violationType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Violation Type</FormLabel>
              <Select
                disabled={isLoading}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a violation type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {violationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  disabled={isLoading}
                  placeholder="Provide details about the violation"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            Create Record
          </Button>
        </div>
      </form>
    </Form>
  );
}
