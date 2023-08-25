import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useCartState } from '../Hooks/Cart';
import { Item } from './Cart';
import PixelSpinner from './PixelSpinner';

export function Login() {
  return (
    <div className="max-w-md mx-auto mt-4 p-4 border border-gray-300 rounded-md shadow">
      <h2 className="text-lg font-medium mb-4">Login Options</h2>
      <p className="text-sm mb-2">Choose an option to continue:</p>
      <button
        //   onClick={onContinueAsGuest}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-full mb-2 w-full"
      >
        Continue as Guest
      </button>
      <button
        //   onClick={onLoginWithPaypal}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full w-full"
      >
        Login with PayPal
      </button>
    </div>
  );
};

const SERVER_URL = "https://ec2-18-230-61-195.sa-east-1.compute.amazonaws.com"

export function Checkout() {
  const [isDone, setDone] = useState(false);
  const cart = useCartState();
  const hasItems = cart.length > 0;
  const totalCost = cart.reduce((total, item) => total + Number(item.price), 0).toFixed(2);
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    firstName: 'John',
    lastName: 'Doe',
    phone: '(555) 555-1234',
    email: 'john@doe.email',
  });

  const [shipping, setShipping] = useState({
    address1: '2211 North First Street',
    address2: 'San Jose',
    zipCode: '95131',
    state: 'California',
    country: 'USA',
  });

  const handleCustomerChange = (e: any) => {
    const { name, value } = e.target;
    setCustomer((prevCustomer) => ({
      ...prevCustomer,
      [name]: value,
    }));
  };

  const handleShippingChange = (e: any) => {
    const { name, value } = e.target;
    setShipping((prevShipping) => ({
      ...prevShipping,
      [name]: value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    console.log('Customer:', customer);
    console.log('Shipping:', shipping);
    console.log('Cart:', cart);

    setDone(true);
  };

  // Prevent user from going to '/checkout' with an empty cart.
  useEffect(() => {
    if (!hasItems) {
      navigate('/');
    }
  }, []);

  function createOrder() {
    return fetch(`${SERVER_URL}/api/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cart: [
          {
            id: "YOUR_PRODUCT_ID",
            quantity: "YOUR_PRODUCT_QUANTITY",
          },
        ],
      }),
    })
      .then((response) => response.json())
      .then((order) => order.id);
  }

  function onApprove(data: any) {
    return fetch(`${SERVER_URL}/api/capture-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderID: data.orderID
      })
    })
      .then((response) => response.json())
      .then((orderData) => {
        const name = orderData.payer.name.given_name;
        alert(`Transaction completed by ${name}`);
      });
  }

  return (
    <React.Fragment>
      <div className='flex flex-row justify-center gap-10'>
        <div className=''>
          <div className="min-w-[380px] max-w-md mx-auto mt-8 p-4 border border-gray-300 rounded-md shadow">
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
                    Address Line 1
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
                    Address Line 2
                  </label>
                  <input
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
                <div className="mb-4 mx-2">
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
            <div className="max-w-md mx-auto mt-4 p-4 border border-gray-300 rounded-md shadow">
              <h2 className="text-lg font-medium mb-2">Payment options</h2>
              <p className="text-sm mb-2">Choose an option to continue:</p>
              <div className='mt-4'>
                <PayPalButtons
                  style={{ layout: "horizontal" }}
                  createOrder={createOrder}
                  onApprove={onApprove} />
              </div>
            </div>
          </React.Fragment>}
        </div>
        <div className='overflow-hidden'>
          <div className="min-w-[380px] max-w-md mx-auto mt-8 border border-gray-300 rounded-md shadow">
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
    </React.Fragment>
  );
};
