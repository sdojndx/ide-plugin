import React from 'react';
import ReactDOM from 'react-dom/client';
// 导入样式
import 'tea-component/lib/tea.css';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
