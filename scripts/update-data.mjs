import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataPath = join(root, "data", "market.json");
const isCheck = process.argv.includes("--check");

const FRED_URL = "https://fred.stlouisfed.org/graph/fredgraph.csv";
const STOOQ_URL = "https://stooq.com/q/l/";
const GOOGLE_FINANCE_URL = "https://www.google.com/finance/quote";
const REQUEST_TIMEOUT_MS = 12000;
const GOOGLE_EXCHANGES = {
  ANET: "NYSE",
  ETN: "NYSE",
  FCX: "NYSE",
  GEV: "NYSE",
  LLY: "NYSE",
  NEM: "NYSE",
  TSM: "NYSE",
  VRT: "NYSE",
};

const previous = JSON.parse(await readFile(dataPath, "utf8"));
const companies = previous.companies;

function withTimeout(ms = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, timer };
}

async function fetchText(url) {
  const { controller, timer } = withTimeout();
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "daily-investment-research-site/0.1",
      },
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchGoogleQuote(symbol) {
  const exchange = GOOGLE_EXCHANGES[symbol] || "NASDAQ";
  const html = await fetchText(`${GOOGLE_FINANCE_URL}/${symbol}:${exchange}`);
  const pattern = new RegExp(
    String.raw`\["${symbol}","([^"]+)"\],"([^"]+)",0,"([A-Z]+)",\[([-0-9.]+),([-0-9.]+),([-0-9.]+)`,
  );
  const match = html.match(pattern);
  if (!match) throw new Error(`Google Finance quote missing for ${symbol}:${exchange}`);
  const [, resolvedExchange, name, currency, closeRaw, changeRaw, changePercentRaw] = match;
  const close = Number(closeRaw);
  const change = Number(changeRaw);
  const changePercent = Number(changePercentRaw);
  return {
    symbol,
    name,
    exchange: resolvedExchange,
    currency,
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toISOString().slice(11, 19),
    open: null,
    high: null,
    low: null,
    close: Number.isFinite(close) ? close : null,
    volume: null,
    change: Number.isFinite(change) ? change : null,
    changePercent: Number.isFinite(changePercent) ? changePercent : null,
    source: "google-finance",
  };
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(",");
  return lines
    .filter(Boolean)
    .map((line) => {
      const cells = line.split(",");
      return Object.fromEntries(headers.map((header, index) => [header, cells[index]]));
    });
}

function latestNumber(rows, key) {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const value = Number(rows[index][key]);
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function previousNumber(rows, key, offset = 1) {
  let found = 0;
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const value = Number(rows[index][key]);
    if (Number.isFinite(value)) {
      found += 1;
      if (found === offset + 1) return value;
    }
  }
  return null;
}

function percentChange(current, prior) {
  if (!Number.isFinite(current) || !Number.isFinite(prior) || prior === 0) return null;
  return ((current - prior) / prior) * 100;
}

async function fetchFredSeries(id) {
  const rows = parseCsv(await fetchText(`${FRED_URL}?id=${id}`));
  return rows.filter((row) => row[id] !== "." && row[id] !== undefined);
}

async function fetchMacro() {
  const [gdpRows, cpiRows, unrateRows, dffRows, dgs10Rows] = await Promise.all([
    fetchFredSeries("GDPC1"),
    fetchFredSeries("CPIAUCSL"),
    fetchFredSeries("UNRATE"),
    fetchFredSeries("DFF"),
    fetchFredSeries("DGS10"),
  ]);
  const gdp = latestNumber(gdpRows, "GDPC1");
  const gdpPrev = previousNumber(gdpRows, "GDPC1");
  const cpi = latestNumber(cpiRows, "CPIAUCSL");
  const cpi12 = previousNumber(cpiRows, "CPIAUCSL", 12);
  const cpiPrev = previousNumber(cpiRows, "CPIAUCSL");
  const unrate = latestNumber(unrateRows, "UNRATE");
  const dff = latestNumber(dffRows, "DFF");
  const dgs10 = latestNumber(dgs10Rows, "DGS10");

  const gdpAnnualized =
    Number.isFinite(gdp) && Number.isFinite(gdpPrev) && gdpPrev > 0
      ? (Math.pow(gdp / gdpPrev, 4) - 1) * 100
      : null;
  const cpiYoY = percentChange(cpi, cpi12);
  const cpiMoM = percentChange(cpi, cpiPrev);
  const growthMomentum = gdpAnnualized !== null && gdpAnnualized >= 1.2 ? "up" : "down";
  const inflationMomentum = cpiYoY !== null && (cpiYoY >= 2.8 || cpiMoM >= 0.25) ? "up" : "down";

  let stage = "复苏";
  if (growthMomentum === "up" && inflationMomentum === "up") stage = "过热";
  if (growthMomentum === "down" && inflationMomentum === "up") stage = "滞胀";
  if (growthMomentum === "down" && inflationMomentum === "down") stage = "衰退";

  return {
    stage,
    growthMomentum,
    inflationMomentum,
    metrics: [
      {
        label: "实际 GDP 动能",
        value: gdpAnnualized,
        format: "pct",
        note: "FRED GDPC1 最近两期变化，作为增长动能近似值",
      },
      {
        label: "CPI 同比",
        value: cpiYoY,
        format: "pct",
        note: "FRED CPIAUCSL 12 个月变化，观察通胀是否高于目标区间",
      },
      {
        label: "失业率",
        value: unrate,
        format: "pct",
        note: "FRED UNRATE，观察就业是否开始明显走弱",
      },
      {
        label: "有效联邦基金利率",
        value: dff,
        format: "pct",
        note: `FRED DFF；10 年期美债收益率约 ${Number.isFinite(dgs10) ? dgs10.toFixed(2) : "--"}%`,
      },
    ],
  };
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
}

function stooqSymbol(symbol) {
  return `${symbol.toLowerCase()}.us`;
}

async function fetchQuotes() {
  const symbols = companies.map((company) => company.symbol);
  const googleResults = [];
  const googleErrors = [];

  for (const group of chunk(symbols, 4)) {
    const settled = await Promise.allSettled(group.map((symbol) => fetchGoogleQuote(symbol)));
    for (const result of settled) {
      if (result.status === "fulfilled") googleResults.push(result.value);
      else googleErrors.push(result.reason.message);
    }
  }

  if (googleResults.length >= Math.ceil(symbols.length * 0.6)) {
    return {
      ...(previous.quotes || {}),
      ...Object.fromEntries(googleResults.map((quote) => [quote.symbol, quote])),
    };
  }

  const quoteEntries = [];

  for (const group of chunk(symbols, 20)) {
    const params = new URLSearchParams({
      s: group.map(stooqSymbol).join(","),
      f: "sd2t2ohlcv",
      h: "",
      e: "csv",
    });
    const rows = parseCsv(await fetchText(`${STOOQ_URL}?${params.toString()}`));
    for (const row of rows) {
      const rawSymbol = (row.Symbol || "").replace(/\.US$/i, "").toUpperCase();
      const close = Number(row.Close);
      const open = Number(row.Open);
      const changePercent = Number.isFinite(close) && Number.isFinite(open) && open !== 0
        ? ((close - open) / open) * 100
        : null;
      quoteEntries.push([
        rawSymbol,
        {
          symbol: rawSymbol,
          date: row.Date,
          time: row.Time,
          open: Number.isFinite(open) ? open : null,
          high: Number.isFinite(Number(row.High)) ? Number(row.High) : null,
          low: Number.isFinite(Number(row.Low)) ? Number(row.Low) : null,
          close: Number.isFinite(close) ? close : null,
          volume: Number.isFinite(Number(row.Volume)) ? Number(row.Volume) : null,
          changePercent,
          source: "stooq",
        },
      ]);
    }
  }

  if (quoteEntries.length > 0) {
    return {
      ...(previous.quotes || {}),
      ...Object.fromEntries(quoteEntries),
    };
  }

  throw new Error(googleErrors.slice(0, 5).join("; ") || "no quote source returned data");
}

function keepPreviousMacro() {
  return {
    ...previous.macro,
    metrics: previous.macro.metrics.map((metric) => ({
      ...metric,
      note: `${metric.note}；本次更新未能联网刷新`,
    })),
  };
}

let macro = previous.macro;
let quotes = previous.quotes || {};
const errors = [];
let macroOk = false;
let quoteOk = false;

try {
  macro = await fetchMacro();
  macroOk = true;
} catch (error) {
  macro = keepPreviousMacro();
  errors.push(`macro: ${error.message}`);
}

try {
  quotes = await fetchQuotes();
  quoteOk = Object.keys(quotes).length > 0;
} catch (error) {
  errors.push(`quotes: ${error.message}`);
}

const output = {
  ...previous,
  generatedAt: new Date().toISOString(),
  sourceStatus: {
    quoteOk,
    macroOk,
    summary: errors.length
      ? `部分数据沿用上次结果：${errors.join("; ")}`
      : `行情与宏观数据已更新，行情覆盖 ${Object.keys(quotes).length}/${companies.length}`,
  },
  macro,
  quotes,
  companies,
};

if (!isCheck) {
  await writeFile(dataPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
}

console.log(output.sourceStatus.summary);
console.log(`companies=${companies.length} quotes=${Object.keys(quotes).length} macroStage=${macro.stage}`);
