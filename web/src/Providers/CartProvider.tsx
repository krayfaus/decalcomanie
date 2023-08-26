import type { Dispatch, ReactElement, ReactNode } from 'react';
import { createContext, useState } from 'react';

import type { StoreItem } from '../Domain/Store';

export const CartStateContext = createContext<StoreItem[] | undefined>(undefined);
export const CartDispatchContext = createContext<Dispatch<StoreItem[]> | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }): ReactElement {
  const [cart, setCart] = useState<StoreItem[]>([]);

  return (
    <CartStateContext.Provider value={cart}>
      <CartDispatchContext.Provider value={setCart}>{children}</CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
};
