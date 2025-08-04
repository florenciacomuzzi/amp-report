import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import './index.css';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './trpc';
import { store } from './store';
import theme from './styles/theme';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const queryClient = new QueryClient();

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/trpc`
        : '/trpc',
      fetch(input: RequestInfo | URL, init?: RequestInit) {
        const token = localStorage.getItem('token');
        return fetch(input, {
          ...init,
          credentials: 'include',
          headers: {
            ...init?.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      },
    }),
  ],
});

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <App />
            </ThemeProvider>
          </QueryClientProvider>
        </trpc.Provider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);