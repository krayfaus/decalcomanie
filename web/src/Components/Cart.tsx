import React, { useReducer } from 'react';
import type { StoreItem } from '../Domain/Store';
import { useCartDispatch, useCartState } from '../Hooks/Cart';
import { Link } from 'react-router-dom';
import ColorSquare from './ColorSquare';

type MouseCallback = (event: React.MouseEvent<HTMLDivElement>, itemId: string) => void;

export function Item(props: { item: StoreItem, removeItem?: MouseCallback}) {
  let hasRemove = props.removeItem !== undefined;

  return (
    <div className="flex items-center border p-4 mb-4 rounded-md shadow-md">
      <div className="flex-shrink-0">
        <ColorSquare hexValue={props.item.id} />
      </div>
      <div className="ml-4 flex-grow">
        <h3 className="text-lg font-semibold">{props.item.name}</h3>
        <p className="text-gray-600">$ {props.item.price}</p>
        <p className="text-gray-600">#{props.item.id}</p>
        {hasRemove && (
          <div className="flex mt-2 items-end">
            <div className="w-100 h-8 flex align-middle items-end">
              <div
                className="ml-auto hover:bg-gray-200 justify-content-center text-center w-1/4 h-100 items-center flex"
                onClick={(e) => {
                  if (props.removeItem) {
                    props.removeItem(e, props.item.id)
                  }
                }}
              >
                <span className="fa-solid fa-trash"></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Cart(props: { isCartOpen: boolean; toggleCart: () => void }) {
  // eslint-disable-next-line
  const [_ignored, forceUpdate] = useReducer(x => x + 1, 0);
  const cart = useCartState();
  const setCart = useCartDispatch();

  function removeItem(event: React.MouseEvent<HTMLDivElement>, itemId: string) {
    console.log('Product removed:', itemId);
    const index = cart.findIndex((element) => element.id === itemId);
    if (index > -1) {
      cart.splice(index, 1)
    }
    
    setCart(cart);
    forceUpdate();
  }

  return (
    <React.Fragment>
      <div className={`z-10 sidebar ${props.isCartOpen === true ? 'active' : ''}`}>
        <div className="flex items-center justify-between p-4">
          <h4 className="mb-0 font-semibold">Shopping Cart</h4>
          <div className="btn btn-primary" onClick={props.toggleCart}>
            <i className="fa fa-times"></i>
          </div>
        </div>
        <div className="sd-body">
          <ul>
            {cart.map((item) => (
              <Item
                key={item.id}
                item={item}
                removeItem={removeItem}
              />
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-content-center pb-4 h-12 w-full absolute bottom-0">
          {cart.length === 0 ? (
            <span className="w-100 text-center font-semibold">
              The cart is empty!
            </span>
          ) : (
            <Link to="/checkout" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={props.toggleCart}>
              Checkout
            </Link>
          )}
        </div>
      </div>
      <div className={`${props.isCartOpen === true ? '' : 'hidden'} z-0 inset-0 fixed h-screen w-screen bg-black opacity-80`} />
    </React.Fragment >
  );
}
