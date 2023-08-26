import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useCartState, useCartDispatch } from '../Hooks/Cart';
import { Item } from './Cart';
import PixelSpinner from './PixelSpinner';

// Since we're currently deploying the webpage and the server from the same host
// we are able to use the window location to avoid hardcoding a value here.
const runningProduction = process.env.NODE_ENV === "production";
const SERVER_URL = runningProduction ? window.location.host : "http://localhost";
const SERVER_PORT = "4000";

export function Checkout() {
  const [lastPurchase, setLastPurchase] = useState('93ded77e-43c2-11ee-be56-0242ac120002');
  const [pending, setPending] = useState(true);
  const [isDone, setDone] = useState(false);
  const cart = useCartState();
  const setCart = useCartDispatch();
  const hasItems = cart.length > 0;
  const totalCost = cart.reduce((total, item) => total + Number(item.price), 0).toFixed(2);
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 (484) 473-1088',
    email: 'john@doe.email',
  });

  const [shipping, setShipping] = useState({
    address1: '2211 North First Street',
    address2: 'Paypal Headquarters',
    zipCode: '95131',
    city: 'San Jose',
    state: 'CA',
    country: 'United States',
  });

  function handleCustomerChange(e: React.ChangeEvent<HTMLInputElement>) {
    let { name, value } = e.target;

    setCustomer((prevCustomer) => ({
      ...prevCustomer,
      [name]: value,
    }));
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShipping((prevShipping) => ({
      ...prevShipping,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();

    // console.log('Customer:', customer);
    // console.log('Shipping:', shipping);
    // console.log('Cart:', cart);

    setDone(true);
  };

  // Prevent user from going to '/checkout' with an empty cart.
  useEffect(() => {
    if (!hasItems) {
      navigate('/');
    }
  }, []);

  function createOrder(): Promise<string> {
    const apiUrl = `${SERVER_URL}:${SERVER_PORT}/api/create-order`;
    console.log()
    return fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: cart,
        customer: customer,
        shipping: shipping,
      }),
    })
      .then((response) => response.json())
      .then((data) => data.order);
  }

  function onApprove(data: any, actions: any) {
    return actions.order.capture().then(function (orderData: any) {
      return fetch(`${SERVER_URL}:${SERVER_PORT}/api/capture-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order: data.orderID
        })
      })
        .then((response) => response.json())
        .then((orderData) => {
          setLastPurchase(orderData.id);
          setCart([]);
          setPending(false);
        });
    });
  }

  return (
    <React.Fragment>
      {pending ? (
        <div className='flex flex-row justify-center gap-10'>
          <div className=''>
            <div className="min-w-[380px] max-w-xl mx-auto mt-8 p-4 border border-gray-300 rounded-md shadow">
              <h2 className="text-lg font-medium mb-4">Shipping information</h2>
              <form onSubmit={handleSubmit}>
                <div className='flex flex-row'>
                  <div className="mb-4 mr-2">
                    <label htmlFor="firstName" className="block text-sm font-medium">
                      First Name
                    </label>
                    <input
                      required
                      disabled={isDone}
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={customer.firstName}
                      onChange={handleCustomerChange}
                      className="mt-1 p-2 border w-full"
                    />
                  </div>
                  <div className="mb-4 ml-2">
                    <label htmlFor="lastName" className="block text-sm font-medium">
                      Last Name
                    </label>
                    <input
                      required
                      disabled={isDone}
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={customer.lastName}
                      onChange={handleCustomerChange}
                      className="mt-1 p-2 border w-full"
                    />
                  </div>
                </div>
                <div className='flex flex-row'>
                  <div className="mb-4 mr-2">
                    <label htmlFor="phone" className="block text-sm font-medium">
                      Phone Number
                    </label>
                    <input
                      required
                      disabled={isDone}
                      type="tel"
                      id="phone"
                      name="phone"
                      value={customer.phone}
                      onChange={handleCustomerChange}
                      className="mt-1 p-2 border w-full"
                    />
                  </div>
                  <div className="mb-4 ml-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                      Email
                    </label>
                    <input
                      required
                      disabled={isDone}
                      type="email"
                      id="email"
                      name="email"
                      value={customer.email}
                      onChange={handleCustomerChange}
                      className="mt-1 p-2 border w-full"
                    />
                  </div>
                </div>
                <div className='flex flex-row'>
                  <div className="mb-4 mr-2">
                    <label htmlFor="address1" className="block text-sm font-medium">
                      Street Address
                    </label>
                    <input
                      required
                      disabled={isDone}
                      type="text"
                      id="address1"
                      name="address1"
                      value={shipping.address1}
                      onChange={handleShippingChange}
                      className="mt-1 p-2 border w-full"
                    />
                  </div>
                  <div className="mb-4 ml-2">
                    <label htmlFor="address2" className="block text-sm font-medium">
                      Address Complement
                    </label>
                    <input
                      disabled={isDone}
                      type="text"
                      id="address2"
                      name="address2"
                      value={shipping.address2}
                      onChange={handleShippingChange}
                      className="mt-1 p-2 border w-full"
                    />
                  </div>
                </div>
                <div className='flex flex-row'>
                  <div className="mb-4 mr-2">
                    <label htmlFor="city" className="block text-sm font-medium">
                      City
                    </label>
                    <input
                      required
                      disabled={isDone}
                      type="text"
                      id="city"
                      name="city"
                      value={shipping.city}
                      onChange={handleShippingChange}
                      className="mt-1 p-2 border w-full"
                    />
                  </div>
                  <div className="mb-4 ml-2">
                    <label htmlFor="zipCode" className="block text-sm font-medium">
                      Zip Code
                    </label>
                    <input
                      required
                      disabled={isDone}
                      type="text"
                      pattern="[0-9]*"
                      title="Please enter at least 5 digits."
                      id="zipCode"
                      name="zipCode"
                      value={shipping.zipCode}
                      onChange={handleShippingChange}
                      className="mt-1 p-2 border w-full"
                    />
                  </div>
                </div>
                <div className='flex flex-row'>
                  <div className="mb-4 mr-2">
                    <label htmlFor="state" className="block text-sm font-medium">
                      State
                    </label>
                    <input
                      required
                      disabled={isDone}
                      type="text"
                      id="state"
                      name="state"
                      value={shipping.state}
                      onChange={handleShippingChange}
                      className="mt-1 p-2 border w-full"
                    />
                  </div>
                  <div className="mb-4 ml-2">
                    <label htmlFor="country" className="block text-sm font-medium">
                      Country
                    </label>
                    <input
                      required
                      disabled={isDone}
                      type="text"
                      id="country"
                      name="country"
                      value={shipping.country}
                      onChange={handleShippingChange}
                      className="mt-1 p-2 border w-full"
                    />
                  </div>
                </div>
                <div className='flex flex-row justify-between'>
                  <button disabled={!isDone} type="submit" className="block disabled:bg-gray-500 bg-blue-500 text-white py-2 px-4 rounded"
                    onClick={(e) => { e.preventDefault(); setDone(false) }}
                  >
                    Edit
                  </button>
                  <button disabled={isDone || !hasItems} type="submit" className="block ml-auto mr-0 disabled:bg-gray-500 bg-blue-500 text-white py-2 px-4 rounded">
                    Submit
                  </button>
                </div>
              </form>
            </div>
            {isDone && <React.Fragment>
              <div className="max-w-xl mx-auto mt-4 p-4 border border-gray-300 rounded-md shadow">
                <h2 className="text-lg font-medium mb-2">Payment options</h2>
                <p className="text-sm mb-2">Choose an option to continue:</p>
                <div className='mt-4'>
                  <PayPalButtons
                    style={{ layout: "horizontal" }}
                    createOrder={createOrder}
                    onApprove={onApprove}
                  />
                </div>
              </div>
            </React.Fragment>}
          </div>
          <div className='overflow-hidden'>
            <div className="min-w-[380px] max-w-xl mx-auto mt-8 border border-gray-300 rounded-md shadow">
              <h2 className="p-4 text-lg font-medium ">Shopping Cart</h2>
              {hasItems ? (
                <div className="overflow-y-auto p-4">
                  <ul className='max-h-[60vh]'>
                    {cart.map((item) => (
                      <Item
                        key={item.id}
                        item={item}
                      />
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="flex items-center justify-content-center pb-4">
                  <span className="w-100 mx-auto text-center font-semibold">
                    The cart is empty!
                  </span>
                </div>
              )}
              <hr className="border-t-4 border-dashed border-gray-300" />
              <div className="overflow-y-auto p-4">
                <span className="font-semibold">
                  Total: $ {totalCost}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <React.Fragment>
          <div className="h-80 flex flex-col justify-between min-w-[380px] max-w-xl mx-auto mt-8 p-4 border border-gray-300 rounded-md shadow">
            <div className='h-60 flex flex-col items-center justify-center'>
              <span className="font-bold text-2xl from-neutral-500">
                Thanks for your purchase.
              </span>
              <hr className="w-80 border-t-2 border-dashed border-gray-300 my-4" />
              <span className="font-semibold italic text-2xl from-neutral-500">
                Enjoy your colors!
              </span>
            </div>
            <span className="font-semibold mb-2">
              Transaction Id:
              <span className="pl-2 italic font-semibold">
                {lastPurchase}
              </span>
            </span>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};
