/**
 * Global in-memory store using React context + useReducer.
 * All CRUD operations run client-side — no backend required.
 * Data resets on page refresh (intentional for a demo).
 */
import { createContext, useContext, useReducer, useMemo, type ReactNode, type Dispatch } from 'react';
import { INITIAL_ORDERS, DEMO_USER } from '../data/mockData';
import type { StoreState, StoreAction, Order } from '../types';

interface StoreContextValue {
  state: StoreState;
  dispatch: Dispatch<StoreAction>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

let nextId = INITIAL_ORDERS.length + 1;

function reducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {

    case 'CREATE_ORDER': {
      const order: Order = {
        ...action.payload,
        id:         nextId++,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return {
        ...state,
        orders: [order, ...state.orders],
        activity: [
          {
            id:         Date.now(),
            action:     'create',
            details:    `Created order for ${order.customer_name}`,
            user_name:  DEMO_USER.name,
            created_at: new Date().toISOString(),
          },
          ...state.activity,
        ],
      };
    }

    case 'UPDATE_ORDER': {
      const updated = state.orders.map(o =>
        o.id === action.id
          ? { ...o, ...action.payload, updated_at: new Date().toISOString() }
          : o
      );
      return {
        ...state,
        orders: updated,
        activity: [
          {
            id:         Date.now(),
            action:     'update',
            details:    `Updated order #${action.id}`,
            user_name:  DEMO_USER.name,
            created_at: new Date().toISOString(),
          },
          ...state.activity,
        ],
      };
    }

    case 'DELETE_ORDER': {
      return {
        ...state,
        orders: state.orders.filter(o => o.id !== action.id),
        activity: [
          {
            id:         Date.now(),
            action:     'delete',
            details:    `Deleted order #${action.id}`,
            user_name:  DEMO_USER.name,
            created_at: new Date().toISOString(),
          },
          ...state.activity,
        ],
      };
    }

    default:
      return state;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    orders: INITIAL_ORDERS,
    activity: [
      {
        id:         1,
        action:     'system',
        details:    'Session started — demo data loaded',
        user_name:  'System',
        created_at: new Date().toISOString(),
      },
    ],
  });

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}
