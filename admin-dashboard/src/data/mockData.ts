// ─── Deterministic mock data (no backend required) ───────────────────────────

import type { Order, OrderStatus, OrderPriority, User, ChartPoint, DashboardStats, StatusCount } from '../types';

interface Customer {
  name: string;
  email: string;
}

const PRODUCTS: string[] = [
  'API Integration Package', 'Backend Optimization Sprint', 'Database Migration',
  'CI/CD Pipeline Setup', 'Monitoring Dashboard', 'Auth System Upgrade',
  'Report Automation', 'Webhook Integration', 'Queue System Setup',
  'Performance Audit', 'Security Review', 'Cloud Migration',
  'Microservice Extraction', 'Load Testing Suite', 'Caching Layer'
];

const CUSTOMERS: Customer[] = [
  { name: 'Acme Corp',         email: 'ops@acme.dev' },
  { name: 'TechFlow Inc',      email: 'admin@techflow.io' },
  { name: 'DataSync Ltd',      email: 'eng@datasync.com' },
  { name: 'CloudNine Systems', email: 'team@cloudnine.dev' },
  { name: 'Velocity Labs',     email: 'hello@velocitylabs.co' },
  { name: 'Apex Digital',      email: 'dev@apexdigital.com' },
  { name: 'NovaBridge',        email: 'info@novabridge.io' },
  { name: 'Streamline AI',     email: 'ops@streamline.ai' },
  { name: 'PulseMetrics',      email: 'support@pulsemetrics.dev' },
  { name: 'StackForge',        email: 'eng@stackforge.com' },
];

const STATUSES: OrderStatus[] = ['pending', 'processing', 'completed', 'cancelled'];
const PRIORITIES: OrderPriority[] = ['low', 'medium', 'high', 'urgent'];

function seededRand(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildOrders(): Order[] {
  const rand = seededRand(42);
  const orders: Order[] = [];
  const now = new Date('2026-03-19T12:00:00Z');

  for (let i = 1; i <= 85; i++) {
    const daysAgo = Math.floor(rand() * 30);
    const created = new Date(now);
    created.setDate(created.getDate() - daysAgo);
    created.setHours(Math.floor(rand() * 24), Math.floor(rand() * 60), 0, 0);

    orders.push({
      id: i,
      customer_name:  CUSTOMERS[Math.floor(rand() * CUSTOMERS.length)].name,
      customer_email: CUSTOMERS[Math.floor(rand() * CUSTOMERS.length)].email,
      product:        PRODUCTS[Math.floor(rand() * PRODUCTS.length)],
      amount:         Math.round((200 + rand() * 4800) * 100) / 100,
      status:         STATUSES[Math.floor(rand() * STATUSES.length)],
      priority:       PRIORITIES[Math.floor(rand() * PRIORITIES.length)],
      notes:          null,
      created_at:     created.toISOString(),
      updated_at:     created.toISOString(),
    });
  }
  return orders;
}

export const INITIAL_ORDERS: Order[] = buildOrders();

export function buildChartData(orders: Order[]): ChartPoint[] {
  const map: Record<string, ChartPoint> = {};
  const now = new Date('2026-03-19');

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    map[key] = { date: key, revenue: 0, orders: 0 };
  }

  orders.forEach(o => {
    if (o.status === 'cancelled') return;
    const key = o.created_at.split('T')[0];
    if (map[key]) {
      map[key].revenue += o.amount;
      map[key].orders  += 1;
    }
  });

  return Object.values(map).map(d => ({
    ...d,
    revenue: Math.round(d.revenue * 100) / 100,
  }));
}

export function buildStats(orders: Order[]): DashboardStats {
  const active = orders.filter(o => o.status !== 'cancelled');
  const totalRevenue   = active.reduce((s, o) => s + o.amount, 0);
  const pending        = orders.filter(o => o.status === 'pending').length;
  const avgOrderValue  = active.length ? totalRevenue / active.length : 0;

  const statusBreakdown: StatusCount[] = STATUSES.map(s => ({
    status: s,
    count:  orders.filter(o => o.status === s).length,
  })).filter(s => s.count > 0);

  return {
    totalOrders:    orders.length,
    totalRevenue:   Math.round(totalRevenue  * 100) / 100,
    pendingOrders:  pending,
    avgOrderValue:  Math.round(avgOrderValue * 100) / 100,
    statusBreakdown,
  };
}

export const DEMO_USER: User = {
  id:    1,
  name:  'Admin User',
  email: 'admin@demo.com',
  role:  'admin',
};
