import type { Dispatch, ReactElement, ReactNode } from 'react';
import { createContext, useState } from 'react';

import type { CartItem } from '../Domain/Cart';

export const CartStateContext = createContext<CartItem[] | undefined>(undefined);
export const CartDispatchContext = createContext<Dispatch<CartItem[]> | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }): ReactElement {
  const [cart, setCart] = useState<CartItem[]>([]);

  return (
    <CartStateContext.Provider value={cart}>
      <CartDispatchContext.Provider value={setCart}>{children}</CartDispatchContext.Provider>
    </CartStateContext.Provider>
  );
};
