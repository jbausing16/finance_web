import { formatMoney } from "@/lib/utils";
import { useState, useEffect } from "react";

interface AnimatedNumberProps {
  value: number; // target number
  duration?: number; // duration in ms
  decimal?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 2000,
  decimal = "Y",
}) => {
  const [num, setNum] = useState<number>(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = Math.max(0.01, end / (duration / 20));
    let current = start;

    const interval = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(interval);
      }
      setNum(current);
    }, 20);

    return () => clearInterval(interval);
  }, [value, duration]);

  return (
    <div style={{ fontSize: "2rem" }}>
      {decimal === "Y" ? formatMoney(num) : Math.round(num)}
    </div>
  );
};

export default AnimatedNumber;
