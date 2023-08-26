import React, { useEffect, useState } from 'react';
import type { StoreItem } from '../Domain/Store';
import { useCartDispatch, useCartState } from '../Hooks/Cart';
import { useStoreDispatch, useStoreState } from '../Hooks/Store';
import { getRandomHexColor } from '../Utils/RandomColor';
import PixelSpinner from './PixelSpinner';
import ColorSquare from './ColorSquare';

export async function downloadJson(
  request: RequestInfo
): Promise<any> {
  const response = await fetch(request);
  const body = await response.json();
  return body;
}

export function Store(props: { randomize: boolean, unsetRandomize: () => void }) {
  const [isReady, setReady] = useState(false);
  const [firstTime, setFirstTime] = useState(true);

  const cart = useCartState();
  const setCart = useCartDispatch();
  const store = useStoreState();
  const setStore = useStoreDispatch();

  async function getStoreItems(): Promise<void> {
    let items: StoreItem[] = [];
    while (items.length < 6) {
      let colorCode = getRandomHexColor();
           
      const index = items.findIndex((element) => element.id === colorCode);
      if (index > -1) {
        continue;
      }

      let url = 'https://www.thecolorapi.com/id?hex=' + colorCode;
      await fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const item: StoreItem = {
            id: colorCode,
            name: data.name.value,
            price: (Math.random() * 1000 + 1).toFixed(2).toString(),
          };
          
          items.push(item);
        });
    }

    setStore(items);
    setReady(true);
    props.unsetRandomize();
  }

  useEffect(() => {
    if ((props.randomize && isReady) || firstTime) {
      console.log("> Randomizing colors!");
      setReady(false);
      setFirstTime(false);
      getStoreItems();
    }
  }, [props.randomize, isReady, firstTime]);

  function addCartItem(event: React.MouseEvent<HTMLButtonElement>, storeItem: StoreItem) {
    const index = cart.findIndex((element) => element.id === storeItem.id);
    if (index > -1) {
      return;
    } else {
      cart.push(storeItem);
    }

    setCart(cart);
    console.log('> Product added to cart:', storeItem);
  }

  return (
    <React.Fragment>
      {isReady ? (
        <div className="mx-auto container px-6 xl:px-0 pb-12">
          <div className="flex flex-col">
            <div className="mt-10 grid lg:grid-cols-3 gap-x-8 gap-y-8 items-center">
              {store.map((item) => (
                <div
                  key={item.id}
                  className="group group-hover:bg-opacity-60 transition duration-500 relative bg-gray-50 sm:p-28 py-36 px-10 flex justify-center items-center"
                >
                  <ColorSquare hexValue={item.id} />
                  <div className="absolute sm:top-8 top-4 left-4 sm:left-8 flex justify-start items-start flex-col space-y-2">
                    <div>
                      <p className="transition duration-500 text-xl leading-5 text-gray-600">
                        {item.name}
                      </p>
                    </div>
                    <div>
                      <p className="transition duration-500 text-xl font-semibold leading-5 text-gray-800">
                        $ {item.price}
                      </p>
                    </div>
                  </div>
                  <div className="absolute sm:top-8 top-4 right-4 sm:right-8 flex justify-start items-start flex-col space-y-2">
                    <div>
                      <p className="transition duration-500 text-xl leading-5 text-gray-600">
                        {`#${item.id}`} {/* {parseInt(item.id, 16)} */}
                      </p>
                    </div>
                  </div>
                  <div className="transition duration-500 absolute top-8 right-8 flex justify-start items-start flex-row space-x-2">
                    <div>
                      <p className="transition duration-500 text-xl justify-end items leading-5 text-gray-800">
                      </p>
                    </div>
                  </div>
                  <div className="transition duration-500 absolute bottom-8 right-8 flex justify-start items-start flex-row space-x-2">
                    <button
                      className="text-gray-700 hover:text-black bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-md"
                      onClick={(e) => addCartItem(e, item)}
                    >
                      <span className="pr-2">Add to cart</span>
                      <span className="fa fa-shopping-cart"></span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <PixelSpinner />
        </div>
      )}
    </React.Fragment>
  );
}

