import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

export function Navigation(props: { toggleCart: () => void, setRandomize: () => void }) {
  const navigate = useNavigate();

  function goHome() {
    navigate("/");
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl text-black italic">
            Décalcomanie
          </Link>
          {(window.location.pathname != '/checkout') && (
            <React.Fragment>
              <div className="space-x-4">
                <button className="text-gray-700 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-md"
                  onClick={() => {
                    if (window.location.pathname == '/') {
                      props.setRandomize();
                    } else {
                      goHome();
                    }
                  }}
                >
                  <span className='pr-2'>Randomize Colors</span>
                  <span className='fa fa-random'></span>
                </button>
              </div>
              <div className="space-x-4">
                <a
                  href="#cart"
                  className="text-gray-700 hover:text-gray-900"
                  onClick={props.toggleCart}
                >
                  Cart
                </a>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </nav>
  );
}
