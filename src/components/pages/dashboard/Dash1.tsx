import { motion, type Variants } from "framer-motion";
import { CustomLineChart } from "@/components/reusables/LineChart";
import { CustomPieChart } from "@/components/reusables/PieChart";
import AnimatedNumber from "@/components/reusables/AnimatedNumber";
import { useGetCashFlow2Query, useGetDash1Query } from "@/store/api/ReportsApi";
import { Bar2Chart } from "@/components/reusables/Bar2Chart";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const item: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

interface Dash1Props {
  from: string;
  to: string;
}

/* ------------------ COMPONENT ------------------ */

function Dash1({ from, to }: Dash1Props) {
  const getDash1 = useGetDash1Query({ from: from, to: to });

  const getCashFlow = useGetCashFlow2Query({ from: from, to: to });

  return (
    <motion.div
      className="p-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* EVERYTHING BELOW MUST BE motion.div */}
      <motion.div className="w-full grid gap-4">
        {/* ---------------- TOP SECTION ---------------- */}
        <motion.div className="grid grid-cols-4 gap-4">
          {/* SUMMARY CARDS */}
          <motion.div className="flex flex-col gap-3 h-full">
            <motion.div
              variants={item}
              className="flex-1 flex flex-col p-4 bg-blue-700 rounded-lg justify-between"
            >
              <span className="text-white text-xl font-medium">
                Total Assets
              </span>
              <span className="text-white text-3xl text-right font-medium">
                <AnimatedNumber value={Number(getDash1?.data?.assets ?? 0)} />
              </span>
            </motion.div>

            <motion.div
              variants={item}
              className="flex-1 flex flex-col p-4 bg-green-500 rounded-lg justify-between"
            >
              <span className="text-white text-xl font-medium">
                Total Liabilities
              </span>
              <span className="text-white text-3xl text-right font-medium">
                <AnimatedNumber value={Number(getDash1?.data?.liab ?? 0)} />
              </span>
            </motion.div>

            <motion.div
              variants={item}
              className="flex-1 flex flex-col p-4 bg-gray-500 rounded-lg justify-between"
            >
              <span className="text-white text-xl font-medium">Net Worth</span>
              <span className="text-white text-3xl text-right font-medium">
                <AnimatedNumber
                  value={Number(
                    (getDash1?.data?.assets ?? 0) - (getDash1?.data?.liab ?? 1),
                  )}
                />
              </span>
            </motion.div>
          </motion.div>

          {/* PROFIT MARGIN */}
          <motion.div
            variants={item}
            className="col-span-2 border p-4 rounded-lg"
          >
            <div className="text-xl font-bold pb-2">Profit Margin</div>
            <div className="grid grid-cols-2">
              <div className="text-center">
                <span className="text-lg font-medium">Gross Profit Margin</span>
                <CustomPieChart
                  data={getDash1?.data?.gross}
                  center={getDash1?.data?.grossp}
                  footer={getDash1?.data?.income - getDash1?.data?.cogs}
                />
              </div>
              <div className="text-center">
                <span className="text-lg font-medium">Net Profit Margin</span>
                <CustomPieChart
                  data={getDash1?.data?.net}
                  center={getDash1?.data?.netpr}
                  footer={
                    getDash1?.data?.income -
                    getDash1?.data?.cogs -
                    getDash1?.data?.expense
                  }
                />
              </div>
            </div>
          </motion.div>

          {/* PAYMENT STATUS */}
          <motion.div variants={item} className="border py-4 px-1 rounded-lg">
            <div className="text-xl font-bold pb-2 px-4">Payment Status</div>
            <div className="text-center">
              <span className="text-lg font-medium">&nbsp;</span>
              <CustomPieChart
                data={getDash1?.data?.inv}
                center={getDash1?.data?.inv1}
                footer={getDash1?.data?.open_inv}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* ---------------- BOTTOM CHARTS ---------------- */}
        <motion.div className="grid grid-cols-2 gap-4">
          <motion.div variants={item}>
            <CustomLineChart
              data={getDash1?.data?.ni}
              title="Revenue"
              color="#1D4ED8"
            />
          </motion.div>

          <motion.div variants={item}>
            {/* <CustomLineChart
              data={getDash11?.data?.monthly_cashflow}
              title="Cash Flow"
              color="#1D4ED8"
            /> */}
            <Bar2Chart
              title="Cash Flow"
              data={getCashFlow?.data?.monthly_cashflow}
              color=""
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default Dash1;
