import { useState, useEffect, useMemo } from 'react';
import apiRequest from '../api/apiClient';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getLevel(count) {
  if (!count || count <= 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

export default function ActivityHeatmap({ title = 'Contributions', subtitle = 'in the last year', className = '' }) {
  const [data, setData] = useState({ totalContributions: 0, byDay: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest('/api/users/me/activity-heatmap?days=365');
        if (cancelled) return;
        if (res?.success && res?.data) {
          setData({ totalContributions: res.data.totalContributions ?? 0, byDay: res.data.byDay ?? {} });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load activity');
          setData({ totalContributions: 0, byDay: {} });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const { grid, weekLabels } = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - 364);
    start.setUTCHours(0, 0, 0, 0);
    const byDay = data.byDay;
    const cols = 53;
    const rows = 7;
    const grid = [];
    const monthCols = [];
    let lastMonth = -1;
    for (let col = 0; col < cols; col++) {
      const weekStart = new Date(start);
      weekStart.setDate(weekStart.getDate() + col * 7);
      const m = weekStart.getMonth();
      if (m !== lastMonth) {
        monthCols.push({ month: MONTHS[m], col });
        lastMonth = m;
      }
      const cellCounts = [];
      for (let row = 0; row < rows; row++) {
        const dayIndex = col * 7 + row;
        const d = new Date(start);
        d.setDate(d.getDate() + dayIndex);
        const dateStr = d.toISOString().slice(0, 10);
        const count = byDay[dateStr] || 0;
        cellCounts.push({ count, dateStr, level: getLevel(count) });
      }
      grid.push(cellCounts);
    }
    return { grid, weekLabels: monthCols };
  }, [data.byDay]);

  if (loading) {
    return (
      <div className={`rounded-2xl border border-brintelli-border bg-brintelli-card p-6 ${className}`}>
        <div className="h-8 w-48 rounded bg-brintelli-baseAlt animate-pulse mb-4" />
        <div className="h-[120px] rounded bg-brintelli-baseAlt/60 animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl border border-brintelli-border bg-brintelli-card p-6 ${className}`}>
        <p className="text-sm text-rose-600">{error}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-brintelli-border bg-brintelli-card p-6 shadow-soft ${className}`}>
      <h3 className="text-lg font-semibold text-text mb-1">
        {data.totalContributions.toLocaleString()} {title}
      </h3>
      <p className="text-sm text-textMuted mb-4">{subtitle}</p>

      <div className="overflow-x-auto">
        <div className="inline-flex gap-[3px] min-w-0">
          {/* Day labels (Mon, Wed, Fri) - 7 rows */}
          <div className="flex flex-col justify-between py-0.5 pr-2 text-[10px] text-textMuted shrink-0 self-stretch">
            <span>Mon</span>
            <span className="opacity-0 pointer-events-none" aria-hidden>Tu</span>
            <span>Wed</span>
            <span className="opacity-0 pointer-events-none" aria-hidden>Th</span>
            <span>Fri</span>
            <span className="opacity-0 pointer-events-none" aria-hidden>Sa</span>
            <span>Sun</span>
          </div>
          {/* Grid: 53 cols x 7 rows */}
          <div className="flex flex-col gap-[3px]">
            {[0, 1, 2, 3, 4, 5, 6].map((row) => (
              <div key={row} className="flex gap-[3px]">
                {grid.map((colCells, col) => {
                  const cell = colCells[row];
                  if (!cell) return null;
                  const level = cell.level;
                  const bg =
                    level === 0
                      ? 'bg-brintelli-baseAlt/80'
                      : level === 1
                        ? 'bg-emerald-300/70 dark:bg-emerald-500/40'
                        : level === 2
                          ? 'bg-emerald-400/80 dark:bg-emerald-500/60'
                          : level === 3
                            ? 'bg-emerald-500 dark:bg-emerald-600'
                            : 'bg-emerald-600 dark:bg-emerald-700';
                  return (
                    <div
                      key={`${col}-${row}`}
                      className={`w-[11px] h-[11px] rounded-[2px] ${bg} transition-colors`}
                      title={`${cell.dateStr}: ${cell.count} contribution${cell.count !== 1 ? 's' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Month labels row - one per week, show month at first week of month */}
        <div className="flex mt-1 pl-9" style={{ width: 53 * 14 }}>
          {Array.from({ length: 53 }, (_, col) => {
            const label = weekLabels.find((w) => w.col === col);
            return (
              <div key={col} className="w-[11px] shrink-0 mr-[3px] text-[10px] text-textMuted">
                {label?.month ?? ''}
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3 text-xs text-textMuted">
          <span>Less</span>
          <div className="flex gap-[2px]">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-[2px] ${
                  level === 0
                    ? 'bg-brintelli-baseAlt/80'
                    : level === 1
                      ? 'bg-emerald-300/70'
                      : level === 2
                        ? 'bg-emerald-400/80'
                        : level === 3
                          ? 'bg-emerald-500'
                          : 'bg-emerald-600'
                }`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
      <p className="text-xs text-textMuted mt-2">Logins, workshop joins, certificate downloads, and other activity.</p>
    </div>
  );
}
