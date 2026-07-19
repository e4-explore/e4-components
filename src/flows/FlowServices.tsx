import React, { createContext, useContext } from 'react';
import type { FlowClients } from './clients/types';

const FlowServicesContext = createContext<FlowClients | null>(null);

export interface FlowServicesProviderProps {
  clients: FlowClients;
  children: React.ReactNode;
}

/**
 * Hands backend clients to every flow underneath. Mount once near the app
 * root (inside ThemeProvider/ToastProvider) with either the mock clients or
 * real adapters:
 *
 *   <FlowServicesProvider clients={createMockClients()}>
 */
export function FlowServicesProvider({ clients, children }: FlowServicesProviderProps) {
  return (
    <FlowServicesContext.Provider value={clients}>{children}</FlowServicesContext.Provider>
  );
}

export function useFlowServices(): FlowClients {
  const clients = useContext(FlowServicesContext);
  if (!clients) {
    throw new Error(
      'useFlowServices: wrap your app in <FlowServicesProvider clients={...}> ' +
        '(createMockClients() works for prototyping).',
    );
  }
  return clients;
}
