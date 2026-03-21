import { useState, useMemo, type FC, type FormEvent } from 'react';
import { useStore } from '../hooks/useStore';
import type { Order, OrderStatus, OrderPriority } from '../types';
import { Plus, Search, ChevronLeft, ChevronRight, Pencil, Trash2, X, Check, ArrowUpDown } from 'lucide-react';

const PAGE_SIZE = 10;

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending:    'bg-amber-50 text-amber-700 ring-amber-500/20',
  processing: 'bg-blue-50 text-blue-700 ring-blue-500/20',
  completed:  'bg-emerald-50 text-emerald-700 ring-emerald-500/20',
  cancelled:  'bg-red-50 text-red-600 ring-red-500/20',
};

const PRIORITY_STYLE: Record<OrderPriority, string> = {
  low:    'text-gray-400',
  medium: 'text-blue-500',
  high:   'text-amber-500 font-semibold',
  urgent: 'text-red-500 font-bold',
};

// ─── Modal ───────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: FC<ModalProps> = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-900 text-sm">{title}</span>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ─── Order form ──────────────────────────────────────────────────────────────

type OrderFormFields = {
  customer_name:  string;
  customer_email: string;
  product:        string;
  amount:         string | number;
  status:         OrderStatus;
  priority:       OrderPriority;
  notes:          string;
};

interface OrderFormProps {
  init?: Partial<OrderFormFields>;
  onSave:   (f: OrderFormFields) => void;
  onCancel: () => void;
  saving:   boolean;
}

const EMPTY_FORM: OrderFormFields = {
  customer_name:  '',
  customer_email: '',
  product:        '',
  amount:         '',
  status:         'pending',
  priority:       'medium',
  notes:          '',
};

const OrderForm: FC<OrderFormProps> = ({ init, onSave, onCancel, saving }) => {
  const [f, setF] = useState<OrderFormFields>({ ...EMPTY_FORM, ...init });
  const set = <K extends keyof OrderFormFields>(k: K, v: OrderFormFields[K]) =>
    setF(p => ({ ...p, [k]: v }));

  const inp = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition';

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(f);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Customer name</label>
          <input value={f.customer_name} onChange={e => set('customer_name', e.target.value)} className={inp} required />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input type="email" value={f.customer_email} onChange={e => set('customer_email', e.target.value)} className={inp} required />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>
          <input value={f.product} onChange={e => set('product', e.target.value)} className={inp} required />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Amount ($)</label>
          <input type="number" step="0.01" value={f.amount} onChange={e => set('amount', e.target.value)} className={inp} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select value={f.status} onChange={e => set('status', e.target.value as OrderStatus)} className={inp}>
            <option value="pending">pending</option>
            <option value="processing">processing</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
          <select value={f.priority} onChange={e => set('priority', e.target.value as OrderPriority)} className={inp}>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="urgent">urgent</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
          <textarea value={f.notes} onChange={e => set('notes', e.target.value)} rows={2} className={`${inp} resize-none`} />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800">
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg flex items-center gap-1.5 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
};

// ─── Sortable header ──────────────────────────────────────────────────────────

interface SHProps {
  col: keyof Order;
  children: React.ReactNode;
  sortCol: keyof Order;
  sortDir: 'asc' | 'desc';
  onSort: (col: keyof Order) => void;
}

const SH: FC<SHProps> = ({ col, children, sortCol, sortDir, onSort }) => (
  <th
    onClick={() => onSort(col)}
    className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-700 whitespace-nowrap"
  >
    <span className="inline-flex items-center gap-1">
      {children}
      {sortCol === col
        ? <span className="text-brand-500">{sortDir === 'asc' ? '↑' : '↓'}</span>
        : <ArrowUpDown className="h-3 w-3 opacity-30" />}
    </span>
  </th>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

type ModalState = null | 'create' | Order;

export default function Orders() {
  const { state, dispatch } = useStore();
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [sortCol,      setSortCol]      = useState<keyof Order>('created_at');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('desc');
  const [page,         setPage]         = useState(1);
  const [modal,        setModal]        = useState<ModalState>(null);

  const filtered = useMemo(() => {
    let data = state.orders;
    if (statusFilter) data = data.filter(o => o.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(o =>
        o.customer_name.toLowerCase().includes(q)  ||
        o.customer_email.toLowerCase().includes(q) ||
        o.product.toLowerCase().includes(q)
      );
    }
    return [...data].sort((a, b) => {
      const av = String(a[sortCol]).toLowerCase();
      const bv = String(b[sortCol]).toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
  }, [state.orders, search, statusFilter, sortCol, sortDir]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (col: keyof Order) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const handleCreate = (f: OrderFormFields) => {
    dispatch({ type: 'CREATE_ORDER', payload: { ...f, amount: Number(f.amount), notes: f.notes || null } });
    setModal(null);
  };

  const handleUpdate = (f: OrderFormFields) => {
    if (modal && modal !== 'create') {
      dispatch({ type: 'UPDATE_ORDER', id: (modal as Order).id, payload: { ...f, amount: Number(f.amount), notes: f.notes || null } });
    }
    setModal(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm(`Delete order #${id}?`)) {
      dispatch({ type: 'DELETE_ORDER', id });
    }
  };

  const sharedSHProps = { sortCol, sortDir, onSort: handleSort };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{filtered.length} of {state.orders.length} orders</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl flex items-center gap-1.5 transition"
        >
          <Plus className="h-4 w-4" /> New Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search…"
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as OrderStatus | ''); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition bg-white"
        >
          <option value="">All status</option>
          <option value="pending">pending</option>
          <option value="processing">processing</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50/70 border-b border-gray-100">
              <tr>
                <SH col="id"            {...sharedSHProps}>#</SH>
                <SH col="customer_name" {...sharedSHProps}>Customer</SH>
                <SH col="product"       {...sharedSHProps}>Product</SH>
                <SH col="amount"        {...sharedSHProps}>Amount</SH>
                <SH col="status"        {...sharedSHProps}>Status</SH>
                <SH col="priority"      {...sharedSHProps}>Priority</SH>
                <SH col="created_at"    {...sharedSHProps}>Date</SH>
                <th className="w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-sm text-gray-400">No orders found</td></tr>
              ) : rows.map(o => (
                <tr key={o.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-3 py-3 text-xs text-gray-400">#{o.id}</td>
                  <td className="px-3 py-3">
                    <p className="text-sm font-medium text-gray-900 leading-none">{o.customer_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{o.customer_email}</p>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 max-w-[160px] truncate">{o.product}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-gray-900">${o.amount.toLocaleString()}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${STATUS_BADGE[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`text-xs capitalize ${PRIORITY_STYLE[o.priority]}`}>{o.priority}</span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(o.created_at).toLocaleDateString('en-AU')}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setModal(o)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-brand-600 transition"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(o.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-500">Page {page} of {pages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      <Modal
        open={modal !== null}
        title={modal === 'create' ? 'New Order' : `Edit Order #${(modal as Order)?.id}`}
        onClose={() => setModal(null)}
      >
        <OrderForm
          init={modal !== 'create' && modal !== null ? {
            ...modal,
            amount: modal.amount,
            notes:  modal.notes ?? '',
          } : undefined}
          onSave={modal === 'create' ? handleCreate : handleUpdate}
          onCancel={() => setModal(null)}
          saving={false}
        />
      </Modal>
    </div>
  );
}
