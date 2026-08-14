// lib/context/ConfigContext.tsx
"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { getAppConfig, resetAppConfigCache, type AppConfig } from '@/lib/config/app-config';

interface ConfigContextType {
  /** null until the fetch resolves, and if it fails. */
  config: AppConfig | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

/**
 * Server-driven application config, fetched once at app start.
 *
 * Lives at the root rather than inside BookingProvider because it is needed
 * outside the booking flow too — the refund modal in the dashboard, the refund
 * ladder on the Terms page, the FAQ. Previously BookingContext owned this
 * fetch, which meant anything outside /book-road-test-vehicle had to hardcode.
 */
export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);

    getAppConfig()
      .then((next) => {
        if (isMounted.current) setConfig(next);
      })
      .catch((err) => {
        console.error('Could not load application config:', err);
        if (isMounted.current) {
          setConfig(null);
          setError("We couldn't load current pricing. Please refresh and try again.");
        }
      })
      .finally(() => {
        if (isMounted.current) setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reload = useCallback(() => {
    resetAppConfigCache();
    load();
  }, [load]);

  return (
    <ConfigContext.Provider value={{ config, isLoading, error, reload }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useAppConfig(): ConfigContextType {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useAppConfig must be used within a ConfigProvider');
  }
  return context;
}
