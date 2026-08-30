// React entry point — bootstraps app + i18n
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n'; // initializes multilingual support

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);