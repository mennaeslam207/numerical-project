export function linearInterpolation(x, x0, y0, x1, y1) {
  if (x1 === x0) return y0;
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

export function buildCubicSpline(points) {
  if (!points || points.length === 0) {
    return { evaluate: () => 1.0 };
  }

  const sorted = [...points]
    .map((p) => ({ x: Number(p.x), y: Number(p.y) }))
    .sort((a, b) => a.x - b.x);

  const unique = [];
  for (const pt of sorted) {
    if (unique.length === 0 || unique[unique.length - 1].x !== pt.x) {
      unique.push(pt);
    } else {
      unique[unique.length - 1].y = (unique[unique.length - 1].y + pt.y) / 2;
    }
  }

  const n = unique.length;
  if (n === 1) {
    return { evaluate: () => Math.max(0.5, unique[0].y) };
  }
  if (n === 2) {
    const [p0, p1] = unique;
    return { evaluate: (x) => linearInterpolation(x, p0.x, p0.y, p1.x, p1.y) };
  }

  const h = Array(n - 1);
  for (let i = 0; i < n - 1; i++) h[i] = unique[i + 1].x - unique[i].x;

  const alpha = Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    alpha[i] =
      (3 / h[i]) * (unique[i + 1].y - unique[i].y) -
      (3 / h[i - 1]) * (unique[i].y - unique[i - 1].y);
  }

  const l = Array(n).fill(1);
  const mu = Array(n).fill(0);
  const z = Array(n).fill(0);

  for (let i = 1; i < n - 1; i++) {
    l[i] = 2 * (unique[i + 1].x - unique[i - 1].x) - h[i - 1] * mu[i - 1];
    mu[i] = h[i] / l[i];
    z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
  }

  const c = Array(n).fill(0);
  const b = Array(n - 1).fill(0);
  const d = Array(n - 1).fill(0);
  const a = unique.map((p) => p.y);

  for (let j = n - 2; j >= 0; j--) {
    c[j] = z[j] - mu[j] * c[j + 1];
    b[j] = (a[j + 1] - a[j]) / h[j] - (h[j] * (c[j + 1] + 2 * c[j])) / 3;
    d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
  }

  const evaluate = (xVal) => {
    const x = Number(xVal);
    if (x <= unique[0].x) return a[0] + b[0] * (x - unique[0].x);
    if (x >= unique[n - 1].x) {
      const last = n - 2;
      const dx = unique[n - 1].x - unique[last].x;
      const slopeEnd = b[last] + 2 * c[last] * dx + 3 * d[last] * dx * dx;
      return a[n - 1] + slopeEnd * (x - unique[n - 1].x);
    }

    let i = 0;
    for (let idx = 0; idx < n - 1; idx++) {
      if (x >= unique[idx].x && x <= unique[idx + 1].x) {
        i = idx;
        break;
      }
    }
    const dx = x - unique[i].x;
    return a[i] + b[i] * dx + c[i] * dx * dx + d[i] * dx * dx * dx;
  };

  return { evaluate };
}

export function predictStudyHours({ pages, difficultyMultiplier = 1, historicalData }) {
  const effectiveLoad = Number(pages) * Number(difficultyMultiplier);
  const spline = buildCubicSpline(historicalData);
  return Number(Math.max(0.5, spline.evaluate(effectiveLoad)).toFixed(1));
}

export function distributeHoursOverDays(totalHours, daysLeft) {
  const days = Math.max(1, Number(daysLeft));
  if (days === 1) {
    return [{ day: "Day 1", hours: Number(Number(totalHours).toFixed(1)) }];
  }

  const controlPoints = [
    { x: 1, y: 0.7 },
    { x: (1 + days) / 2, y: 1.0 },
    { x: days, y: 1.3 },
  ];
  const spline = buildCubicSpline(controlPoints);

  const weights = [];
  for (let day = 1; day <= days; day++) {
    weights.push({ day: `Day ${day}`, w: Math.max(0.1, spline.evaluate(day)) });
  }

  const sumW = weights.reduce((acc, item) => acc + item.w, 0);
  return weights.map((item) => ({
    day: item.day,
    hours: Number(((item.w / sumW) * totalHours).toFixed(1)),
  }));
}