import { StoreItem } from './Store';

/**
 * Represents a product added to the cart.
 */
export type CartItem = StoreItem & {
  quantity: number,
};