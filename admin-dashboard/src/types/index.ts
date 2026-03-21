// ─── Domain types ─────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ActivityAction = 'create' | 'update' | 'delete' | 'system';

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  product: string;
  amount: number;
  status: OrderStatus;
  priority: OrderPriority;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityEntry {
  id: number;
  action: ActivityAction;
  details: string;
  user_name: string;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
}

// ─── Store types ──────────────────────────────────────────────────────────────

export interface StoreState {
  orders: Order[];
  activity: ActivityEntry[];
}

export type StoreAction =
  | { type: 'CREATE_ORDER'; payload: Omit<Order, 'id' | 'created_at' | 'updated_at'> }
  | { type: 'UPDATE_ORDER'; id: number; payload: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>> }
  | { type: 'DELETE_ORDER'; id: number };

// ─── Chart / stats types ──────────────────────────────────────────────────────

export interface ChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface StatusCount {
  status: OrderStatus;
  count: number;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  avgOrderValue: number;
  statusBreakdown: StatusCount[];
}
