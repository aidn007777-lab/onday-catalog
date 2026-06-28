export interface ParsedPriceLine {
  id: string;
  category: string;
  brand: string;
  model: string;
  memory: string;
  color: string;
  simEac: string;
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

interface MemoryMatch {
  raw: string;
  value: string;
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

const colorPattern = new RegExp(`\\b(${colorAliases.join("|")})\\b`, "gi");

const memoryPatterns = [
  { pattern: /\b12\s*\/\s*512\s*(?:gb)?\b/i, value: "12/512 GB" },
  { pattern: /\b12\s*\/\s*256\s*(?:gb)?\b/i, value: "12/256 GB" },
  { pattern: /\b8\s*\/\s*256\s*(?:gb)?\b/i, value: "8/256 GB" },
  { pattern: /\b6\s*\/\s*256\s*(?:gb)?\b/i, value: "6/256 GB" },
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
  { pattern: /\bapple\s+watch\b/i, brand: "Apple" },
  { pattern: /\bsamsung\b/i, brand: "Samsung" },
  { pattern: /\bgalaxy\b/i, brand: "Samsung" },
  { pattern: /\bbuds\b/i, brand: "Samsung" },
  { pattern: /\bxiaomi\b/i, brand: "Xiaomi" },
  { pattern: /\bredmi\b/i, brand: "Xiaomi" },
  { pattern: /\bpoco\b/i, brand: "Poco" },
  { pattern: /\brealme\b/i, brand: "Realme" },
  { pattern: /\bhonor\b/i, brand: "Honor" },
  { pattern: /\bx9d\b/i, brand: "Honor" },
  { pattern: /\bvivo\b/i, brand: "Vivo" },
  { pattern: /\by0?4s\b/i, brand: "Vivo" },
  { pattern: /\boppo\b/i, brand: "OPPO" },
  { pattern: /\bairpods\b/i, brand: "Apple" },
  { pattern: /\btab\b/i, brand: "Samsung" }
];

const categoryRules = [
  { pattern: /\b(?:tab|pad|ipad)\b/i, category: "Планшеты" },
  { pattern: /\b(?:apple\s+watch|watch)\b/i, category: "Смарт-часы" },
  { pattern: /\b(?:airpods|buds|наушники)\b/i, category: "Наушники" },
  {
    pattern: /\b(?:iphone|samsung|galaxy|xiaomi|redmi|poco|realme|honor|vivo|oppo|x9d|y0?4s)\b/i,
    category: "Смартфоны"
  }
];

const pendingPricePattern = /(?:цена\s+уточняется|уточняется)/i;
const pricePattern = /(?<!\d)(\d{2,3}(?:[\s.,]\d{3})|\d{5,7})(?!\d)/g;
const noiseLinePattern =
  /^(?:[*\s]*mobilagid\.kz[*\s]*|[*\s]*оптовый\s+прайс.*|[*\s]*товар\s+в\s+наличии[*\s]*|[-—–_▪️🔳🔘\s]+)$/i;

export function parseWhatsappPriceList(rawText: string, supplier: string): PriceParseResult {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const parsedGroups = lines.map((line, index) => parsePriceLine(line, index + 1, supplier));
  const parsedLines = parsedGroups.flat();
  const rows = parsedLines.filter((row) => row.status !== "Ошибка");
  const errors = parsedLines.filter((row) => row.status === "Ошибка");

  return {
    rows,
    errors,
    summary: {
      total: lines.length,
      parsed: rows.filter((row) => row.status === "Распознано").length,
      pricePending: rows.filter((row) => row.status === "Цена уточняется").length,
      errors: errors.length
    }
  };
}

function parsePriceLine(originalLine: string, lineNumber: number, supplier: string): ParsedPriceLine[] {
  const cleanedLine = cleanLine(originalLine);

  if (isNoiseLine(cleanedLine)) {
    return [makeErrorLine(lineNumber, originalLine, supplier, "Служебная или заголовочная строка")];
  }

  const brand = detectBrand(cleanedLine);
  const category = detectCategory(cleanedLine);
  const memory = detectMemory(cleanedLine);
  const colors = detectColors(cleanedLine);
  const simEac = detectSimEac(cleanedLine);
  const pricePending = pendingPricePattern.test(cleanedLine);
  const price = pricePending ? null : detectPrice(cleanedLine);
  const model = detectModel(cleanedLine, brand, memory, colors, simEac);
  const missingFields = [
    brand ? "" : "бренд",
    category ? "" : "категория",
    model ? "" : "модель",
    memory.value ? "" : "память",
    colors.length > 0 ? "" : "цвет",
    price !== null || pricePending ? "" : "цена"
  ].filter(Boolean);

  if (missingFields.length > 0) {
    return [makeErrorLine(lineNumber, originalLine, supplier, `Не распознано: ${missingFields.join(", ")}`)];
  }

  return colors.map((color, colorIndex) => ({
    id: `${lineNumber}-${colorIndex}-${originalLine}`,
    category,
    brand,
    model,
    memory: memory.value,
    color,
    simEac: simEac || "—",
    price,
    status: pricePending ? "Цена уточняется" : "Распознано",
    supplier,
    originalLine
  }));
}

function makeErrorLine(lineNumber: number, originalLine: string, supplier: string, error: string): ParsedPriceLine {
  return {
    id: `${lineNumber}-error-${originalLine}`,
    category: "—",
    brand: "—",
    model: "—",
    memory: "—",
    color: "—",
    simEac: "—",
    price: null,
    status: "Ошибка",
    supplier,
    originalLine,
    error
  };
}

function cleanLine(line: string) {
  return line
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/[*]+$/g, "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function isNoiseLine(line: string) {
  return noiseLinePattern.test(line) || (!detectPrice(line) && !pendingPricePattern.test(line) && !detectMemory(line).value);
}

function detectBrand(line: string) {
  return brandRules.find((rule) => rule.pattern.test(line))?.brand ?? "";
}

function detectCategory(line: string) {
  return categoryRules.find((rule) => rule.pattern.test(line))?.category ?? "";
}

function detectMemory(line: string): MemoryMatch {
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

function detectColors(line: string) {
  const matches = Array.from(line.matchAll(colorPattern), (match) => match[0]);
  const normalizedSeen = new Set<string>();
  const colors: string[] = [];

  for (const color of matches) {
    const key = color.toLowerCase();

    if (!normalizedSeen.has(key)) {
      normalizedSeen.add(key);
      colors.push(color);
    }
  }

  return colors;
}

function detectPrice(line: string) {
  const matches = Array.from(line.matchAll(pricePattern));
  const lastMatch = matches.at(-1);

  if (!lastMatch?.[1]) {
    return null;
  }

  return Number(lastMatch[1].replace(/[\s.,]/g, ""));
}

function detectPriceRaw(line: string) {
  const matches = Array.from(line.matchAll(pricePattern));

  return matches.at(-1)?.[1] ?? "";
}

function detectSimEac(line: string) {
  const tokens: string[] = [];

  addToken(tokens, line, /\beac\s*\/\s*kct\b/i, "EAC/KCT");
  addToken(tokens, line, /\b1\s*sim\s*\+\s*esim\b/i, "1 SIM + eSIM");
  addToken(tokens, line, /\bnano\s*sim\b/i, "nanoSIM");
  addToken(tokens, line, /\b2\s*sim\b/i, "2 SIM");
  addToken(tokens, line, /\besim\b/i, "eSIM");
  addToken(tokens, line, /\beac\b/i, "EAC");
  addToken(tokens, line, /\bkct\b/i, "KCT");
  addToken(tokens, line, /\b4g\b/i, "4G");
  addToken(tokens, line, /\b5g\b/i, "5G");

  return tokens.join(" / ");
}

function addToken(tokens: string[], line: string, pattern: RegExp, label: string) {
  if (pattern.test(line) && !tokens.includes(label)) {
    if (label === "EAC" && tokens.includes("EAC/KCT")) {
      return;
    }

    if (label === "KCT" && tokens.includes("EAC/KCT")) {
      return;
    }

    if (label === "eSIM" && tokens.includes("1 SIM + eSIM")) {
      return;
    }

    tokens.push(label);
  }
}

function detectModel(line: string, brand: string, memory: MemoryMatch, colors: string[], simEac: string) {
  let model = line;
  const rawPrice = detectPriceRaw(model);

  model = model.replace(pendingPricePattern, "");

  if (rawPrice) {
    model = model.replace(new RegExp(escapeRegExp(rawPrice), "g"), "");
  }

  if (memory.raw) {
    model = model.replace(new RegExp(escapeRegExp(memory.raw), "i"), "");
  }

  for (const color of colors) {
    model = model.replace(new RegExp(`\\b${escapeRegExp(color)}\\b`, "gi"), "");
  }

  for (const token of simEac.split(" / ").filter(Boolean)) {
    model = model.replace(new RegExp(escapeRegExp(token).replace(/\\ /g, "\\s*"), "gi"), "");
  }

  model = model
    .replace(/[(),/]/g, " ")
    .replace(/\s*[-—]\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (brand === "Samsung") {
    model = model.replace(/\bsamsung\b/i, "").trim();
  } else if (brand && brand !== "Apple") {
    model = model.replace(new RegExp(`\\b${escapeRegExp(brand)}\\b`, "i"), "").trim();
  }

  return model.replace(/\s{2,}/g, " ").trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
