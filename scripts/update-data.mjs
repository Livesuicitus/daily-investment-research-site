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
const REDDIT_WSB_URL = "https://www.reddit.com/r/wallstreetbets";
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
const SOCIAL_WINDOWS = {
  today: {
    label: "今日",
    hours: 30,
    redditTime: "day",
  },
  week: {
    label: "本周",
    hours: 24 * 8,
    redditTime: "week",
  },
};
const SOCIAL_ALIASES = {
  NVDA: ["NVIDIA", "Nvidia"],
  AVGO: ["Broadcom"],
  AMD: ["Advanced Micro Devices"],
  TSM: ["TSMC", "Taiwan Semiconductor"],
  ASML: ["ASML"],
  AMAT: ["Applied Materials"],
  ANET: ["Arista", "Arista Networks"],
  VRT: ["Vertiv"],
  ETN: ["Eaton"],
  GEV: ["GE Vernova", "Vernova"],
  MSFT: ["Microsoft", "Azure"],
  GOOGL: ["Alphabet", "Google"],
  AMZN: ["Amazon", "AWS"],
  PANW: ["Palo Alto", "Palo Alto Networks"],
  CRWD: ["CrowdStrike", "Crowdstrike"],
  LLY: ["Eli Lilly", "Lilly"],
  ISRG: ["Intuitive Surgical"],
  FCX: ["Freeport", "Freeport-McMoRan"],
  NEM: ["Newmont"],
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

function emptySocialItem(symbol) {
  return {
    symbol,
    score: 0,
    mentions: 0,
    posts: 0,
    comments: 0,
    upvotes: 0,
    sources: {
      reddit: {
        mentions: 0,
        posts: 0,
        comments: 0,
        upvotes: 0,
        topPosts: [],
      },
      x: {
        mentions: null,
        status: "not_configured",
      },
    },
  };
}

function emptySocialWindow(key, summary = "暂无社媒热度数据") {
  return {
    key,
    label: SOCIAL_WINDOWS[key].label,
    source: "wallstreetbets",
    fetchedPosts: 0,
    leaders: [],
    items: Object.fromEntries(companies.map((company) => [company.symbol, emptySocialItem(company.symbol)])),
    summary,
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function companyAliases(company) {
  const base = [company.symbol, `$${company.symbol}`, company.name, ...(SOCIAL_ALIASES[company.symbol] || [])];
  return Array.from(new Set(base.filter(Boolean).map((item) => item.trim()).filter(Boolean)));
}

function countSymbolMatches(text, symbol) {
  const pattern = new RegExp(`(^|[^A-Z0-9])\\$?${escapeRegExp(symbol)}([^A-Z0-9]|$)`, "gi");
  return Array.from(text.matchAll(pattern)).length;
}

function countAliasMatches(text, alias) {
  const normalized = alias.replace(/^\$/, "");
  if (/^[A-Z]{2,5}$/.test(normalized)) {
    return countSymbolMatches(text, normalized);
  }
  const pattern = new RegExp(`(^|[^A-Z0-9])${escapeRegExp(normalized)}([^A-Z0-9]|$)`, "gi");
  return Array.from(text.matchAll(pattern)).length;
}

function normalizeRedditPost(child) {
  const item = child.data || {};
  return {
    id: item.id,
    title: item.title || "",
    text: item.selftext || "",
    url: item.permalink ? `https://www.reddit.com${item.permalink}` : item.url,
    score: Number(item.score) || 0,
    comments: Number(item.num_comments) || 0,
    createdAt: new Date((Number(item.created_utc) || 0) * 1000).toISOString(),
    createdMs: (Number(item.created_utc) || 0) * 1000,
  };
}

async function fetchRedditListing(path, params) {
  const search = new URLSearchParams({
    limit: "100",
    raw_json: "1",
    ...params,
  });
  const text = await fetchText(`${REDDIT_WSB_URL}/${path}.json?${search.toString()}`);
  const json = JSON.parse(text);
  return (json.data?.children || []).map(normalizeRedditPost).filter((post) => post.id);
}

async function fetchRedditPosts(windowKey) {
  const window = SOCIAL_WINDOWS[windowKey];
  const listings = await Promise.allSettled([
    fetchRedditListing("top", { t: window.redditTime }),
    fetchRedditListing("hot", {}),
    fetchRedditListing("new", {}),
  ]);
  const posts = new Map();
  const failures = [];
  const earliestMs = Date.now() - window.hours * 60 * 60 * 1000;

  for (const listing of listings) {
    if (listing.status === "rejected") {
      failures.push(listing.reason.message);
      continue;
    }
    for (const post of listing.value) {
      if (post.createdMs >= earliestMs) posts.set(post.id, post);
    }
  }

  if (posts.size === 0 && failures.length) {
    throw new Error(failures.slice(0, 2).join("; "));
  }

  return Array.from(posts.values());
}

function scoreSocialMatch(post, matches, windowKey) {
  const ageHours = Math.max(0, (Date.now() - post.createdMs) / (60 * 60 * 1000));
  const windowHours = SOCIAL_WINDOWS[windowKey].hours;
  const recency = Math.max(0.45, 1 - ageHours / (windowHours * 1.25));
  const engagement = 1 + Math.log10(1 + Math.max(post.score, 0)) * 1.1 + Math.log10(1 + post.comments) * 1.45;
  return matches * engagement * recency;
}

function buildSocialWindow(windowKey, posts) {
  const rawItems = new Map(companies.map((company) => [company.symbol, emptySocialItem(company.symbol)]));
  const rawScores = new Map(companies.map((company) => [company.symbol, 0]));

  for (const post of posts) {
    const searchable = `${post.title}\n${post.text}`;
    for (const company of companies) {
      const aliases = companyAliases(company);
      const mentions = aliases.reduce((total, alias) => total + countAliasMatches(searchable, alias), 0);
      if (mentions <= 0) continue;

      const item = rawItems.get(company.symbol);
      item.mentions += mentions;
      item.posts += 1;
      item.comments += post.comments;
      item.upvotes += post.score;
      item.sources.reddit.mentions += mentions;
      item.sources.reddit.posts += 1;
      item.sources.reddit.comments += post.comments;
      item.sources.reddit.upvotes += post.score;
      item.sources.reddit.topPosts.push({
        title: post.title,
        url: post.url,
        score: post.score,
        comments: post.comments,
        createdAt: post.createdAt,
      });
      rawScores.set(company.symbol, rawScores.get(company.symbol) + scoreSocialMatch(post, mentions, windowKey));
    }
  }

  const maxRawScore = Math.max(...rawScores.values(), 1);
  for (const [symbol, item] of rawItems) {
    item.score = Math.round((rawScores.get(symbol) / maxRawScore) * 100);
    item.sources.reddit.topPosts = item.sources.reddit.topPosts
      .sort((a, b) => b.score + b.comments * 1.5 - (a.score + a.comments * 1.5))
      .slice(0, 3);
  }

  const leaders = Array.from(rawItems.values())
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.mentions - a.mentions)
    .slice(0, 8)
    .map((item) => ({
      symbol: item.symbol,
      name: companies.find((company) => company.symbol === item.symbol)?.name || item.symbol,
      score: item.score,
      mentions: item.mentions,
      posts: item.posts,
      comments: item.comments,
      topPost: item.sources.reddit.topPosts[0] || null,
    }));

  return {
    key: windowKey,
    label: SOCIAL_WINDOWS[windowKey].label,
    source: "wallstreetbets",
    fetchedPosts: posts.length,
    leaders,
    items: Object.fromEntries(rawItems.entries()),
    summary: leaders.length
      ? `${SOCIAL_WINDOWS[windowKey].label} WSB 热度最高：${leaders
          .slice(0, 3)
          .map((item) => item.symbol)
          .join(" / ")}`
      : `${SOCIAL_WINDOWS[windowKey].label} WSB 未匹配到研究池股票`,
  };
}

function keepPreviousSocialHeat(reason) {
  if (previous.socialHeat) {
    return {
      ...previous.socialHeat,
      sourceStatus: {
        ...(previous.socialHeat.sourceStatus || {}),
        redditOk: false,
        xOk: false,
        summary: `社媒热度本次未能刷新，沿用上次结果：${reason}`,
      },
    };
  }
  return {
    generatedAt: new Date().toISOString(),
    sourceStatus: {
      redditOk: false,
      xOk: false,
      summary: `社媒热度暂不可用：${reason}`,
    },
    windows: {
      today: emptySocialWindow("today"),
      week: emptySocialWindow("week"),
    },
  };
}

async function fetchSocialHeat() {
  const windows = {};
  const errors = [];

  for (const key of Object.keys(SOCIAL_WINDOWS)) {
    try {
      const posts = await fetchRedditPosts(key);
      windows[key] = buildSocialWindow(key, posts);
    } catch (error) {
      errors.push(`${SOCIAL_WINDOWS[key].label}: ${error.message}`);
      windows[key] = previous.socialHeat?.windows?.[key] || emptySocialWindow(key, `本次 ${SOCIAL_WINDOWS[key].label} 热度抓取失败`);
    }
  }

  const redditOk = Object.values(windows).some((window) => window.fetchedPosts > 0);
  const matchedSymbols = new Set(Object.values(windows).flatMap((window) => window.leaders.map((item) => item.symbol)));
  const summary = redditOk
    ? `WSB 热度已更新，匹配 ${matchedSymbols.size} 只研究池股票；X 热度需配置 API 后接入`
    : `WSB 热度未刷新；X 热度需配置 API 后接入${errors.length ? `：${errors.join("; ")}` : ""}`;

  return {
    generatedAt: new Date().toISOString(),
    sourceStatus: {
      redditOk,
      xOk: false,
      summary,
    },
    windows,
  };
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
let socialHeat = previous.socialHeat || {
  generatedAt: new Date().toISOString(),
  sourceStatus: {
    redditOk: false,
    xOk: false,
    summary: "社媒热度等待首次刷新",
  },
  windows: {
    today: emptySocialWindow("today"),
    week: emptySocialWindow("week"),
  },
};
const errors = [];
let macroOk = false;
let quoteOk = false;
let socialOk = false;

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

try {
  socialHeat = await fetchSocialHeat();
  socialOk = socialHeat.sourceStatus.redditOk || socialHeat.sourceStatus.xOk;
} catch (error) {
  socialHeat = keepPreviousSocialHeat(error.message);
  errors.push(`social: ${error.message}`);
}

const marketSummary = errors.length
  ? `部分数据沿用上次结果：${errors.join("; ")}`
  : `行情与宏观数据已更新，行情覆盖 ${Object.keys(quotes).length}/${companies.length}`;

const output = {
  ...previous,
  generatedAt: new Date().toISOString(),
  sourceStatus: {
    quoteOk,
    macroOk,
    socialOk,
    summary: `${marketSummary}；${socialHeat.sourceStatus.summary}`,
  },
  macro,
  quotes,
  socialHeat,
  companies,
};

if (!isCheck) {
  await writeFile(dataPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
}

console.log(output.sourceStatus.summary);
console.log(
  `companies=${companies.length} quotes=${Object.keys(quotes).length} macroStage=${macro.stage} social=${socialOk ? "ok" : "fallback"}`,
);
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
const REDDIT_WSB_URL = "https://www.reddit.com/r/wallstreetbets";
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
const SOCIAL_WINDOWS = {
  today: {
    label: "今日",
    hours: 30,
    redditTime: "day",
  },
  week: {
    label: "本周",
    hours: 24 * 8,
    redditTime: "week",
  },
};
const SOCIAL_ALIASES = {
  NVDA: ["NVIDIA", "Nvidia"],
  AVGO: ["Broadcom"],
  AMD: ["Advanced Micro Devices"],
  TSM: ["TSMC", "Taiwan Semiconductor"],
  ASML: ["ASML"],
  AMAT: ["Applied Materials"],
  ANET: ["Arista", "Arista Networks"],
  VRT: ["Vertiv"],
  ETN: ["Eaton"],
  GEV: ["GE Vernova", "Vernova"],
  MSFT: ["Microsoft", "Azure"],
  GOOGL: ["Alphabet", "Google"],
  AMZN: ["Amazon", "AWS"],
  PANW: ["Palo Alto", "Palo Alto Networks"],
  CRWD: ["CrowdStrike", "Crowdstrike"],
  LLY: ["Eli Lilly", "Lilly"],
  ISRG: ["Intuitive Surgical"],
  FCX: ["Freeport", "Freeport-McMoRan"],
  NEM: ["Newmont"],
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

function emptySocialItem(symbol) {
  return {
    symbol,
    score: 0,
    mentions: 0,
    posts: 0,
    comments: 0,
    upvotes: 0,
    sources: {
      reddit: {
        mentions: 0,
        posts: 0,
        comments: 0,
        upvotes: 0,
        topPosts: [],
      },
      x: {
        mentions: null,
        status: "not_configured",
      },
    },
  };
}

function emptySocialWindow(key, summary = "暂无社媒热度数据") {
  return {
    key,
    label: SOCIAL_WINDOWS[key].label,
    source: "wallstreetbets",
    fetchedPosts: 0,
    leaders: [],
    items: Object.fromEntries(companies.map((company) => [company.symbol, emptySocialItem(company.symbol)])),
    summary,
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function companyAliases(company) {
  const base = [company.symbol, `$${company.symbol}`, company.name, ...(SOCIAL_ALIASES[company.symbol] || [])];
  return Array.from(new Set(base.filter(Boolean).map((item) => item.trim()).filter(Boolean)));
}

function countSymbolMatches(text, symbol) {
  const pattern = new RegExp(`(^|[^A-Z0-9])\\$?${escapeRegExp(symbol)}([^A-Z0-9]|$)`, "gi");
  return Array.from(text.matchAll(pattern)).length;
}

function countAliasMatches(text, alias) {
  const normalized = alias.replace(/^\$/, "");
  if (/^[A-Z]{2,5}$/.test(normalized)) {
    return countSymbolMatches(text, normalized);
  }
  const pattern = new RegExp(`(^|[^A-Z0-9])${escapeRegExp(normalized)}([^A-Z0-9]|$)`, "gi");
  return Array.from(text.matchAll(pattern)).length;
}

function normalizeRedditPost(child) {
  const item = child.data || {};
  return {
    id: item.id,
    title: item.title || "",
    text: item.selftext || "",
    url: item.permalink ? `https://www.reddit.com${item.permalink}` : item.url,
    score: Number(item.score) || 0,
    comments: Number(item.num_comments) || 0,
    createdAt: new Date((Number(item.created_utc) || 0) * 1000).toISOString(),
    createdMs: (Number(item.created_utc) || 0) * 1000,
  };
}

async function fetchRedditListing(path, params) {
  const search = new URLSearchParams({
    limit: "100",
    raw_json: "1",
    ...params,
  });
  const text = await fetchText(`${REDDIT_WSB_URL}/${path}.json?${search.toString()}`);
  const json = JSON.parse(text);
  return (json.data?.children || []).map(normalizeRedditPost).filter((post) => post.id);
}

async function fetchRedditPosts(windowKey) {
  const window = SOCIAL_WINDOWS[windowKey];
  const listings = await Promise.allSettled([
    fetchRedditListing("top", { t: window.redditTime }),
    fetchRedditListing("hot", {}),
    fetchRedditListing("new", {}),
  ]);
  const posts = new Map();
  const failures = [];
  const earliestMs = Date.now() - window.hours * 60 * 60 * 1000;

  for (const listing of listings) {
    if (listing.status === "rejected") {
      failures.push(listing.reason.message);
      continue;
    }
    for (const post of listing.value) {
      if (post.createdMs >= earliestMs) posts.set(post.id, post);
    }
  }

  if (posts.size === 0 && failures.length) {
    throw new Error(failures.slice(0, 2).join("; "));
  }

  return Array.from(posts.values());
}

function scoreSocialMatch(post, matches, windowKey) {
  const ageHours = Math.max(0, (Date.now() - post.createdMs) / (60 * 60 * 1000));
  const windowHours = SOCIAL_WINDOWS[windowKey].hours;
  const recency = Math.max(0.45, 1 - ageHours / (windowHours * 1.25));
  const engagement = 1 + Math.log10(1 + Math.max(post.score, 0)) * 1.1 + Math.log10(1 + post.comments) * 1.45;
  return matches * engagement * recency;
}

function buildSocialWindow(windowKey, posts) {
  const rawItems = new Map(companies.map((company) => [company.symbol, emptySocialItem(company.symbol)]));
  const rawScores = new Map(companies.map((company) => [company.symbol, 0]));

  for (const post of posts) {
    const searchable = `${post.title}\n${post.text}`;
    for (const company of companies) {
      const aliases = companyAliases(company);
      const mentions = aliases.reduce((total, alias) => total + countAliasMatches(searchable, alias), 0);
      if (mentions <= 0) continue;

      const item = rawItems.get(company.symbol);
      item.mentions += mentions;
      item.posts += 1;
      item.comments += post.comments;
      item.upvotes += post.score;
      item.sources.reddit.mentions += mentions;
      item.sources.reddit.posts += 1;
      item.sources.reddit.comments += post.comments;
      item.sources.reddit.upvotes += post.score;
      item.sources.reddit.topPosts.push({
        title: post.title,
        url: post.url,
        score: post.score,
        comments: post.comments,
        createdAt: post.createdAt,
      });
      rawScores.set(company.symbol, rawScores.get(company.symbol) + scoreSocialMatch(post, mentions, windowKey));
    }
  }

  const maxRawScore = Math.max(...rawScores.values(), 1);
  for (const [symbol, item] of rawItems) {
    item.score = Math.round((rawScores.get(symbol) / maxRawScore) * 100);
    item.sources.reddit.topPosts = item.sources.reddit.topPosts
      .sort((a, b) => b.score + b.comments * 1.5 - (a.score + a.comments * 1.5))
      .slice(0, 3);
  }

  const leaders = Array.from(rawItems.values())
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.mentions - a.mentions)
    .slice(0, 8)
    .map((item) => ({
      symbol: item.symbol,
      name: companies.find((company) => company.symbol === item.symbol)?.name || item.symbol,
      score: item.score,
      mentions: item.mentions,
      posts: item.posts,
      comments: item.comments,
      topPost: item.sources.reddit.topPosts[0] || null,
    }));

  return {
    key: windowKey,
    label: SOCIAL_WINDOWS[windowKey].label,
    source: "wallstreetbets",
    fetchedPosts: posts.length,
    leaders,
    items: Object.fromEntries(rawItems.entries()),
    summary: leaders.length
      ? `${SOCIAL_WINDOWS[windowKey].label} WSB 热度最高：${leaders
          .slice(0, 3)
          .map((item) => item.symbol)
          .join(" / ")}`
      : `${SOCIAL_WINDOWS[windowKey].label} WSB 未匹配到研究池股票`,
  };
}

function keepPreviousSocialHeat(reason) {
  if (previous.socialHeat) {
    return {
      ...previous.socialHeat,
      sourceStatus: {
        ...(previous.socialHeat.sourceStatus || {}),
        redditOk: false,
        xOk: false,
        summary: `社媒热度本次未能刷新，沿用上次结果：${reason}`,
      },
    };
  }
  return {
    generatedAt: new Date().toISOString(),
    sourceStatus: {
      redditOk: false,
      xOk: false,
      summary: `社媒热度暂不可用：${reason}`,
    },
    windows: {
      today: emptySocialWindow("today"),
      week: emptySocialWindow("week"),
    },
  };
}

async function fetchSocialHeat() {
  const windows = {};
  const errors = [];

  for (const key of Object.keys(SOCIAL_WINDOWS)) {
    try {
      const posts = await fetchRedditPosts(key);
      windows[key] = buildSocialWindow(key, posts);
    } catch (error) {
      errors.push(`${SOCIAL_WINDOWS[key].label}: ${error.message}`);
      windows[key] = previous.socialHeat?.windows?.[key] || emptySocialWindow(key, `本次 ${SOCIAL_WINDOWS[key].label} 热度抓取失败`);
    }
  }

  const redditOk = Object.values(windows).some((window) => window.fetchedPosts > 0);
  const matchedSymbols = new Set(Object.values(windows).flatMap((window) => window.leaders.map((item) => item.symbol)));
  const summary = redditOk
    ? `WSB 热度已更新，匹配 ${matchedSymbols.size} 只研究池股票；X 热度需配置 API 后接入`
    : `WSB 热度未刷新；X 热度需配置 API 后接入${errors.length ? `：${errors.join("; ")}` : ""}`;

  return {
    generatedAt: new Date().toISOString(),
    sourceStatus: {
      redditOk,
      xOk: false,
      summary,
    },
    windows,
  };
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
let socialHeat = previous.socialHeat || {
  generatedAt: new Date().toISOString(),
  sourceStatus: {
    redditOk: false,
    xOk: false,
    summary: "社媒热度等待首次刷新",
  },
  windows: {
    today: emptySocialWindow("today"),
    week: emptySocialWindow("week"),
  },
};
const errors = [];
let macroOk = false;
let quoteOk = false;
let socialOk = false;

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

try {
  socialHeat = await fetchSocialHeat();
  socialOk = socialHeat.sourceStatus.redditOk || socialHeat.sourceStatus.xOk;
} catch (error) {
  socialHeat = keepPreviousSocialHeat(error.message);
  errors.push(`social: ${error.message}`);
}

const marketSummary = errors.length
  ? `部分数据沿用上次结果：${errors.join("; ")}`
  : `行情与宏观数据已更新，行情覆盖 ${Object.keys(quotes).length}/${companies.length}`;

const output = {
  ...previous,
  generatedAt: new Date().toISOString(),
  sourceStatus: {
    quoteOk,
    macroOk,
    socialOk,
    summary: `${marketSummary}；${socialHeat.sourceStatus.summary}`,
  },
  macro,
  quotes,
  socialHeat,
  companies,
};

if (!isCheck) {
  await writeFile(dataPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
}

console.log(output.sourceStatus.summary);
console.log(
  `companies=${companies.length} quotes=${Object.keys(quotes).length} macroStage=${macro.stage} social=${socialOk ? "ok" : "fallback"}`,
);
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
