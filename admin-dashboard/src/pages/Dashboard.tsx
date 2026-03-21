import { useMemo, type FC } from 'react';
import { useStore } from '../hooks/useStore';
import { buildStats, buildChartData } from '../data/mockData';
import type { OrderStatus, DashboardStats, ChartPoint, ActivityEntry } from '../types';
import {
  DollarSign, ShoppingCart, Clock, BarChart2,
  TrendingUp, TrendingDown, Activity,
  type LucideIcon,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  type TooltipProps,
} from 'recharts';

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending:    '#f59e0b',
  processing: '#3b82f6',
  completed:  '#10b981',
  cancelled:  '#ef4444',
};

// ─── KPI card ────────────────────────────────────────────────────────────────

interface KPIProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: number;
  iconClass?: string;
}

const KPI: FC<KPIProps> = ({ icon: Icon, label, value, trend, iconClass = 'bg-brand-50 text-brand-600' }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${iconClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      {trend != null && (
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900 mb-0.5">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </div>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const CustomTooltip: FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label?.slice(5)}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'revenue' ? fmt(p.value as number) : `${p.value} orders`}
        </p>
      ))}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { state } = useStore();
  const stats = useMemo<DashboardStats>(() => buildStats(state.orders),    [state.orders]);
  const chart = useMemo<ChartPoint[]>(() => buildChartData(state.orders),  [state.orders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Operations overview — last 30 days</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI icon={DollarSign}   label="Total Revenue"   value={fmt(stats.totalRevenue)}  trend={12}  iconClass="bg-emerald-50 text-emerald-600" />
        <KPI icon={ShoppingCart} label="Total Orders"    value={stats.totalOrders}         trend={8}   iconClass="bg-blue-50 text-blue-600" />
        <KPI icon={Clock}        label="Pending"         value={stats.pendingOrders}                   iconClass="bg-amber-50 text-amber-600" />
        <KPI icon={BarChart2}    label="Avg Order Value" value={fmt(stats.avgOrderValue)} trend={-3} />
      </div>

      {/* Revenue + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Revenue (30 days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chart} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} fontSize={11} stroke="#d1d5db" tickLine={false} />
              <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} fontSize={11} stroke="#d1d5db" tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="#006fc7" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Status</h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={stats.statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%" cy="50%"
                  innerRadius={52} outerRadius={78}
                  paddingAngle={3}
                >
                  {stats.statusBreakdown.map(e => (
                    <Cell key={e.status} fill={STATUS_COLOR[e.status]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-2">
            {stats.statusBreakdown.map(s => (
              <div key={s.status} className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLOR[s.status] }} />
                <span className="capitalize text-gray-500 truncate">{s.status}</span>
                <span className="font-semibold text-gray-900 ml-auto">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Daily Orders</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chart} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} fontSize={11} stroke="#d1d5db" tickLine={false} />
              <YAxis fontSize={11} stroke="#d1d5db" tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" fill="#0158a1" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-400" /> Activity
          </h3>
          <div className="space-y-3 overflow-y-auto max-h-52">
            {state.activity.map((a: ActivityEntry) => (
              <div key={a.id} className="flex gap-2.5 text-xs">
                <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                  a.action === 'create' ? 'bg-emerald-400' :
                  a.action === 'update' ? 'bg-blue-400'   :
                  a.action === 'delete' ? 'bg-red-400'    : 'bg-gray-300'
                }`} />
                <div>
                  <p className="text-gray-700 leading-snug">{a.details}</p>
                  <p className="text-gray-400 mt-0.5">{a.user_name} · {new Date(a.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
