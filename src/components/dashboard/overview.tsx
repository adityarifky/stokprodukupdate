
"use client"

import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  subtracted: {
    label: "Stok Keluar",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function Overview({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
        <div className="flex h-[240px] w-full items-center justify-center text-center text-sm text-muted-foreground">
            Tidak ada data pengurangan stok untuk ditampilkan.
        </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data} margin={{ top: 20 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.length > 10 ? `${value.slice(0, 10)}...` : value}
        />
        <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            allowDecimals={false}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent />}
        />
        <Legend content={<ChartLegendContent />} />
        <Bar dataKey="subtracted" fill="var(--color-subtracted)" radius={8} />
      </BarChart>
    </ChartContainer>
  )
}
