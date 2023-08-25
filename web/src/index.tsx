import React, { PropsWithChildren, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { MainPage } from './Pages/Main';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <MainPage />
);
