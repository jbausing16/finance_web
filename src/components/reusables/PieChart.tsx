import * as React from "react";
import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import AnimatedNumber from "./AnimatedNumber";

const chartConfig = {} satisfies ChartConfig;

interface CustomPieChartProps {
  data: any[];
  center: number;
  footer: number;
}

export function CustomPieChart({ data, center, footer }: CustomPieChartProps) {
  return (
    <Card className="flex flex-col border-0 shadow-none gap-0 p-0">
      <CardContent className="flex-1 !pb-0">
        {/* MUST be relative */}
        <div className="relative mx-auto aspect-square">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square"
          >
            <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius="100%"
                cx="50%"
                cy="50%"
                strokeWidth={5}
              />
            </PieChart>
          </ChartContainer>

          {/* ✅ HTML OVERLAY (THIS WORKS) */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold flex z-0">
              <AnimatedNumber value={center} decimal="N" /> %
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-col text-sm text-center">
        <span className="text-2xl font-medium flex justify-center gap-2 w-full">
          <AnimatedNumber value={footer} />
        </span>
      </CardFooter>
    </Card>
  );
}
