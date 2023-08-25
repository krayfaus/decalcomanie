import type { Dispatch } from 'react';
import { useContext } from 'react';
import type { StoreItem } from '../Domain/Store';
import { StoreStateContext, StoreDispatchContext } from '../Providers/StoreProvider';

export const useStoreDispatch = (): Dispatch<StoreItem[]> => {
  const storeDispatch = useContext(StoreDispatchContext);

  if (typeof storeDispatch === 'undefined') {
    throw Error('useStoreDispatch must be used inside an StoreProvider component');
  }

  return storeDispatch;
};

export const useStoreState = (): StoreItem[] => {
  const storeState = useContext(StoreStateContext);

  if (typeof storeState === 'undefined') {
    throw Error('useStoreState must be used inside an StoreProvider component');
  }

  return storeState;
};
