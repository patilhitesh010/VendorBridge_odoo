"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect } from "react"

const quotationSchema = z.object({
  rfqId: z.string(),
  lineItemPrices: z.array(z.object({
    itemName: z.string(),
    qty: z.number(),
    unit: z.string(),
    unitPrice: z.number().min(0.01, "Price required"),
    total: z.number(),
  })),
  grandTotal: z.number(),
  deliveryDate: z.string().min(1, "Delivery date required"),
  terms: z.string().optional(),
})

type QuotationFormValues = z.infer<typeof quotationSchema>

interface QuotationFormProps {
  rfq: any
  onSubmit: (data: any) => Promise<void>
  isLoading?: boolean
}

export function QuotationForm({ rfq, onSubmit, isLoading }: QuotationFormProps) {
  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      rfqId: rfq.id,
      lineItemPrices: rfq.lineItems.map((item: any) => ({
        itemName: item.name,
        qty: item.qty,
        unit: item.unit,
        unitPrice: 0,
        total: 0,
      })),
      grandTotal: 0,
      deliveryDate: "",
      terms: "",
    },
  })

  const { fields } = useFieldArray({
    control: form.control,
    name: "lineItemPrices",
  })

  const lineItemPrices = form.watch("lineItemPrices")

  useEffect(() => {
    const total = lineItemPrices.reduce((acc, curr) => acc + (curr.unitPrice * curr.qty), 0)
    form.setValue("grandTotal", total)
  }, [lineItemPrices, form])

  const onFormSubmit = async (values: QuotationFormValues) => {
    const data = {
      ...values,
      deliveryDate: new Date(values.deliveryDate).toISOString(),
      lineItemPrices: values.lineItemPrices.map(item => ({
        itemName: item.itemName,
        unitPrice: item.unitPrice,
        total: item.unitPrice * item.qty
      }))
    }
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Line Items Pricing</h3>
          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium">{field.itemName}</p>
                  <p className="text-sm text-muted-foreground">{field.qty} {field.unit}</p>
                </div>
                <div className="w-32">
                  <FormField
                    control={form.control}
                    name={`lineItemPrices.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Unit Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Price" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-32 text-right">
                  <p className="text-sm font-bold">
                    ₹{(lineItemPrices[index]?.unitPrice * field.qty).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end items-center gap-4 border-t pt-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Grand Total</p>
            <p className="text-2xl font-bold">₹{form.watch("grandTotal").toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="deliveryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Delivery Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Terms</FormLabel>
                <FormControl>
                  <Textarea placeholder="Payment terms, warranty, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit Quotation"}
        </Button>
      </form>
    </Form>
  )
}
