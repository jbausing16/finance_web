import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateM = (date: Date) => {
  if (!date || isNaN(date.getTime())) {
    return "";
  }
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
};

export const formatDateNormal = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month like "Jan"
    day: "numeric",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options).replace(" ", ". ");
};

export const formatDateFull = (dateString: Date | string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const day = String(date.getDate()).padStart(2, "0");

  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
    date,
  );

  return `${month} ${day}, ${year}`;
};

// export const formatMoney = (money: number) => {
//   return money.toLocaleString("en-US", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   });
// };

export function formatMoney(value?: number | string) {
  const num = Number(value ?? 0);
  const abs = Math.abs(num);

  const formatted = abs.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return num < 0 ? `(${formatted})` : formatted;
}

export function generateMonths(fromD: string, toD: string) {
  const result = [];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let current = new Date(fromD);
  const end = new Date(toD);

  // normalize to first day of month
  current.setDate(1);
  end.setDate(1);

  while (current <= end) {
    const monthName = monthNames[current.getMonth()];
    const year = current.getFullYear();

    result.push(`${monthName} ${year}`);

    // move to next month
    current.setMonth(current.getMonth() + 1);
  }

  return result;
}

export function generateMonths1(fromD: string, toD: string) {
  const result = [];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  let current = new Date(fromD);
  const end = new Date(toD);

  // normalize to first day of month
  current.setDate(1);
  end.setDate(1);

  while (current <= end) {
    const monthName = monthNames[current.getMonth()];
    const year = current.getFullYear();

    result.push(`${monthName}`);

    // move to next month
    current.setMonth(current.getMonth() + 1);
  }

  return result;
}

export const numToWords = (num: any) => {
  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const teens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const thousands = ["", "thousand", "million", "billion"];

  const convertHundreds = (num: any) => {
    if (num > 99) {
      return ones[Math.floor(num / 100)] + " hundred " + convertTens(num % 100);
    } else {
      return convertTens(num);
    }
  };

  const convertTens = (num: any) => {
    if (num < 10) return ones[num];
    else if (num >= 10 && num < 20) return teens[num - 10];
    else {
      return (
        tens[Math.floor(num / 10)] +
        (num % 10 !== 0 ? "-" + ones[num % 10] : "")
      );
    }
  };

  const convertThousands = (num: any) => {
    if (num === 0) return "";
    let result = "";
    let thousandsCounter = 0;

    while (num > 0) {
      if (num % 1000 !== 0) {
        result =
          convertHundreds(num % 1000) +
          " " +
          thousands[thousandsCounter] +
          " " +
          result;
      }
      num = Math.floor(num / 1000);
      thousandsCounter++;
    }
    return result.trim();
  };

  if (num === 0) return "zero";

  return convertThousands(num).trim().toUpperCase();
};

export const numberToWords = (amount: any) => {
  // Convert amount to a number and ensure it's valid
  const numAmount = Number(amount);
  if (isNaN(numAmount)) {
    throw new Error("Invalid amount");
  }

  // Use toFixed to ensure 2 decimal places
  const [pesos, centavos] = numAmount.toFixed(2).split(".");

  const pesoWords = numToWords(parseInt(pesos));
  const centavoWords =
    parseFloat(centavos) > 0 ? `AND ${centavos}/100 Centavos` : "";

  return `${pesoWords} ${centavoWords} ONLY `.trim();
};

// export const round2 = (num: number) => Math.round(num * 100) / 100;

// export const round2 = (num: number) =>
//   Math.round((num + Number.EPSILON) * 100) / 100;

// export const round2 = (num: number) =>
//   Math.round((num + Number.EPSILON) * 100) / 100;

export const round2 = (num: number) => Math.round((num + 1e-8) * 100) / 100;

export const get_origin = (num: number) => {
  if (num === 1) {
    return "Journal Entry";
  } else if (num === 2) {
    return "A/R Invoice";
  } else if (num === 3) {
    return "A/R Credit Memo";
  } else if (num === 4) {
    return "A/P Invoice";
  } else if (num === 5) {
    return "A/P Credit Memo";
  } else if (num === 6) {
    return "Incoming Payment";
  } else if (num === 7) {
    return "Outgoing Payment";
  } else {
    return "";
  }
};

export const formatDate1 = (dateString: Date) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getInitials = (name: string) => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

export const hasAccess = (
  access: any[],
  moduleId: number | string,
  permission: "view" | "create" | "edit" | "delete" | "access" = "view",
) => {
  const mod = access?.find((item) => String(item?.module) === String(moduleId));
  return mod?.[permission] === true;
};

export const modules = [
  {
    id: 1,
    url: "/dashboard",
  },
  {
    id: 2,
    url: "/reports/balance-sheet",
  },
  {
    id: 3,
    url: "/reports/profit-loss",
  },
  {
    id: 4,
    url: "/reports/cash-flow",
  },
  {
    id: 5,
    url: "/reports/general-ledger",
  },
  {
    id: 6,
    url: "/reports/financial-performance",
  },
  {
    id: 7,
    url: "/reports/projection",
  },
  {
    id: 8,
    url: "/administration/users",
  },
  {
    id: 9,
    url: "/administration/approval",
  },
  {
    id: 10,
    url: "/administration/automatic-entries",
  },
  {
    id: 11,
    url: "/administration/posting-period",
  },
  {
    id: 12,
    url: "/administration/document-number",
  },
  {
    id: 13,
    url: "/administration/bank",
  },
  {
    id: 14,
    url: "/administration/payment-terms",
  },
  {
    id: 15,
    url: "/financials/chart-of-accounts",
  },
  {
    id: 16,
    url: "/financials/journal-entry",
  },
  {
    id: 17,
    url: "/financials/journal-report",
  },
  {
    id: 18,
    url: "/sales/invoice",
  },
  {
    id: 19,
    url: "/sales/credit-memo",
  },
  {
    id: 20,
    url: "/sales/recurring-transactions",
  },
  {
    id: 21,
    url: "/purchasing/invoice",
  },
  {
    id: 22,
    url: "/purchasing/credit-memo",
  },
  {
    id: 23,
    url: "/purchasing/recurring-transactions",
  },
  {
    id: 24,
    url: "/banking/incoming-payment",
  },
  {
    id: 25,
    url: "/banking/outgoing-payment",
  },
  {
    id: 26,
    url: "/banking/bank-recon",
  },
  {
    id: 27,
    url: "/business-partner",
  },
  {
    id: 28,
    url: "/inventory",
  },
  {
    id: 29,
    url: "/approval",
  },
];
