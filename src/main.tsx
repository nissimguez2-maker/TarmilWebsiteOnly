import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { AppRoutes } from './routes';
import { SupabaseDataProvider } from './lib/SupabaseDataProvider';

const root = document.getElementById('root');
if (!root) throw new Error('#root element not found');

createRoot(root).render(
  <StrictMode>
    <SupabaseDataProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SupabaseDataProvider>
  </StrictMode>,
);
