export interface ParsedPriceLine {
  id: string;
  brand: string;
  model: string;
  memory: string;
  color: string;
  price: number | null;
  status: "Распознано" | "Цена уточняется" | "Ошибка";
  supplier: string;
  originalLine: string;
  error?: string;
}

export interface PriceParseSummary {
  total: number;
  parsed: number;
  pricePending: number;
  errors: number;
}

export interface PriceParseResult {
  rows: ParsedPriceLine[];
  errors: ParsedPriceLine[];
  summary: PriceParseSummary;
}

const colorAliases = [
  "black",
  "white",
  "gray",
  "grey",
  "silver",
  "blue",
  "green",
  "gold",
  "red",
  "pink",
  "purple",
  "orange",
  "yellow",
  "natural",
  "titanium"
];

const memoryPatterns = [
  { pattern: /\b12\s*\/\s*512\s*(?:gb)?\b/i, value: "12/512 GB" },
  { pattern: /\b12\s*\/\s*256\s*(?:gb)?\b/i, value: "12/256 GB" },
  { pattern: /\b8\s*\/\s*256\s*(?:gb)?\b/i, value: "8/256 GB" },
  { pattern: /\b2\s*tb\b/i, value: "2 TB" },
  { pattern: /\b1\s*tb\b/i, value: "1 TB" },
  { pattern: /\b512\s*(?:gb)?\b/i, value: "512 GB" },
  { pattern: /\b256\s*(?:gb)?\b/i, value: "256 GB" },
  { pattern: /\b128\s*(?:gb)?\b/i, value: "128 GB" },
  { pattern: /\b64\s*(?:gb)?\b/i, value: "64 GB" }
];

const brandRules = [
  { pattern: /\biphone\b/i, brand: "Apple" },
  { pattern: /\bipad\b/i, brand: "Apple" },
  { pattern: /\bsamsung\b/i, brand: "Samsung" },
  { pattern: /\bgalaxy\b/i, brand: "Samsung" },
  { pattern: /\bredmi\b/i, brand: "Xiaomi" },
  { pattern: /\bpoco\b/i, brand: "Poco" },
  { pattern: /\brealme\b/i, brand: "Realme" },
  { pattern: /\bhonor\b/i, brand: "Honor" },
  { pattern: /\bvivo\b/i, brand: "Vivo" },
  { pattern: /\boppo\b/i, brand: "OPPO" },
  { pattern: /\btab\b/i, brand: "Samsung" }
];

const pendingPricePattern = /(?:цена\s+уточняется|уточняется)/i;
const pricePattern = /(?:^|[\s-])(\d{2,3}(?:[\s.,]\d{3})|\d{5,7})\s*$/;

export function parseWhatsappPriceList(rawText: string, supplier: string): PriceParseResult {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parsedLines = lines.map((line, index) => parsePriceLine(line, index + 1, supplier));
  const rows = parsedLines.filter((row) => row.status !== "Ошибка");
  const errors = parsedLines.filter((row) => row.status === "Ошибка");

  return {
    rows,
    errors,
    summary: {
      total: parsedLines.length,
      parsed: rows.filter((row) => row.status === "Распознано").length,
      pricePending: rows.filter((row) => row.status === "Цена уточняется").length,
      errors: errors.length
    }
  };
}

function parsePriceLine(originalLine: string, lineNumber: number, supplier: string): ParsedPriceLine {
  const brand = detectBrand(originalLine);
  const memory = detectMemory(originalLine);
  const color = detectColor(originalLine);
  const pricePending = pendingPricePattern.test(originalLine);
  const price = pricePending ? null : detectPrice(originalLine);
  const model = detectModel(originalLine, brand, memory.raw, color);
  const missingFields = [
    brand ? "" : "бренд",
    model ? "" : "модель",
    memory.value ? "" : "память",
    color ? "" : "цвет",
    price !== null || pricePending ? "" : "цена"
  ].filter(Boolean);

  if (missingFields.length > 0) {
    return {
      id: `${lineNumber}-${originalLine}`,
      brand: brand || "—",
      model: model || "—",
      memory: memory.value || "—",
      color: color || "—",
      price,
      status: "Ошибка",
      supplier,
      originalLine,
      error: `Не распознано: ${missingFields.join(", ")}`
    };
  }

  return {
    id: `${lineNumber}-${originalLine}`,
    brand,
    model,
    memory: memory.value,
    color,
    price,
    status: pricePending ? "Цена уточняется" : "Распознано",
    supplier,
    originalLine
  };
}

function detectBrand(line: string) {
  return brandRules.find((rule) => rule.pattern.test(line))?.brand ?? "";
}

function detectMemory(line: string) {
  for (const item of memoryPatterns) {
    const match = line.match(item.pattern);

    if (match?.[0]) {
      return {
        raw: match[0],
        value: item.value
      };
    }
  }

  return {
    raw: "",
    value: ""
  };
}

function detectColor(line: string) {
  for (const color of colorAliases) {
    const match = line.match(new RegExp(`\\b${color}\\b`, "i"));

    if (match?.[0]) {
      return match[0];
    }
  }

  return "";
}

function detectPrice(line: string) {
  const match = line.match(pricePattern);

  if (!match?.[1]) {
    return null;
  }

  return Number(match[1].replace(/[\s.,]/g, ""));
}

function detectModel(line: string, brand: string, rawMemory: string, color: string) {
  let model = line;

  model = model.replace(pendingPricePattern, "");
  model = model.replace(pricePattern, "");

  if (rawMemory) {
    model = model.replace(new RegExp(escapeRegExp(rawMemory), "i"), "");
  }

  if (color) {
    model = model.replace(new RegExp(`\\b${escapeRegExp(color)}\\b`, "i"), "");
  }

  if (brand === "Samsung") {
    model = model.replace(/\bsamsung\b/i, "").trim();
  } else if (brand && brand !== "Apple") {
    model = model.replace(new RegExp(`\\b${escapeRegExp(brand)}\\b`, "i"), "").trim();
  }

  return model
    .replace(/\s*[-—]\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
