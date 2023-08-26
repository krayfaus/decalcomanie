import React, { useState } from 'react';
import { Navigation } from '../Components/Navigation';
import { Cart } from '../Components/Cart';
import { Store } from '../Components/Store';
import { Checkout } from '../Components/Checkout';
import { CartProvider } from '../Providers/CartProvider';
import { StoreProvider } from '../Providers/StoreProvider';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export function MainPage() {
  const [isCartOpen, setCartOpen] = useState(false);
  const [randomize, setRandomize] = useState(false);

  const ToggleCart = () => {
    isCartOpen === true ? setCartOpen(false) : setCartOpen(true);
  };

  return (
    <Router>
      <React.Fragment>
        <Navigation toggleCart={ToggleCart} setRandomize={() => setRandomize(true)} />
        <CartProvider>
          <StoreProvider>
            <PayPalScriptProvider options={{
              clientId: "AdfcOLIp_S_3YgO_miIAaWJ-Blwo82HFNHBlNaZNEaW126fSCd0DTM9jKtq5xpysx751qGdXo_PPvDae",
              currency: "USD",
              locale: "en_US",
              buyerCountry: "US",
              intent: "capture"
            }}>
              <Routes>
                <Route path="/" element={<Store randomize={randomize} unsetRandomize={() => setRandomize(false)} />} />
                <Route path="/checkout" element={<Checkout />} />
              </Routes>
            </PayPalScriptProvider>
          </StoreProvider>
          <Cart
            isCartOpen={isCartOpen}
            toggleCart={ToggleCart}
          />
        </CartProvider>
      </React.Fragment>
    </Router >

  );
}
