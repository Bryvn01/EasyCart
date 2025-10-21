import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const testQueryClient = new QueryClient();

export function withQueryClientProvider(ui) {
  return (
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
}
