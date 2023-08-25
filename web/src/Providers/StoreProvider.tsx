import type { Dispatch, ReactElement, ReactNode } from 'react';
import { createContext, useState } from 'react';

import type { StoreItem } from '../Domain/Store';

export const StoreStateContext = createContext<StoreItem[] | undefined>(undefined);
export const StoreDispatchContext = createContext<Dispatch<StoreItem[]> | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }): ReactElement {
  const [store, setStore] = useState<StoreItem[]>([]);

  return (
    <StoreStateContext.Provider value={store}>
      <StoreDispatchContext.Provider value={setStore}>{children}</StoreDispatchContext.Provider>
    </StoreStateContext.Provider>
  );
};
