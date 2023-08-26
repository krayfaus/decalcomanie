import type { Dispatch } from 'react';
import { useContext } from 'react';
import type { StoreItem } from '../Domain/Store';
import { CartStateContext, CartDispatchContext } from '../Providers/CartProvider';

export const useCartDispatch = (): Dispatch<StoreItem[]> => {
  const cartDispatch = useContext(CartDispatchContext);

  if (typeof cartDispatch === 'undefined') {
    throw Error('useCartDispatch must be used inside an CartProvider component');
  }

  return cartDispatch;
};

export const useCartState = (): StoreItem[] => {
  const cartState = useContext(CartStateContext);

  if (typeof cartState === 'undefined') {
    throw Error('useCartState must be used inside an CartProvider component');
  }

  return cartState;
};
