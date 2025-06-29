
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { day: "Sen", sales: 1230 },
  { day: "Sel", sales: 1543 },
  { day: "Rab", sales: 980 },
  { day: "Kam", sales: 2150 },
  { day: "Jum", sales: 1765 },
  { day: "Sab", sales: 2540 },
  { day: "Min", sales: 2310 },
];

const chartConfig = {
  sales: {
    label: "Penjualan",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function Overview() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickFormatter={(value) => `$${value / 1000}k`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Bar dataKey="sales" fill="var(--color-sales)" radius={8} />
      </BarChart>
    </ChartContainer>
  )
}
