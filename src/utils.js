export function filterByPeriod(list, period, key = "date") {
  const now = new Date("2026-05-28");
  return list.filter(d => {
    const diff = (now - new Date(d[key])) / 86400000;
    if (period === "1주") return diff <= 7;
    if (period === "1개월") return diff <= 30;
    if (period === "3개월") return diff <= 90;
    return true;
  });
}

export function getHotKeywords(list) {
  const freq = {};
  list.forEach(n => n.keyword.forEach(kw => { freq[kw] = (freq[kw] || 0) + 1; }));
  return Object.entries(freq).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]);
}
