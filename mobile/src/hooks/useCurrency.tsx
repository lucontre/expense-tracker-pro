import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '../lib/supabase';

type Currency = 'USD' | 'MXN' | 'GTQ' | 'EUR';

interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  nameEs: string;
}

const CURRENCIES: Record<Currency, CurrencyInfo> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    nameEs: 'Dólar Estadounidense'
  },
  MXN: {
    code: 'MXN',
    symbol: '$',
    name: 'Mexican Peso',
    nameEs: 'Peso Mexicano'
  },
  GTQ: {
    code: 'GTQ',
    symbol: 'Q',
    name: 'Guatemalan Quetzal',
    nameEs: 'Quetzal Guatemalteco'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    nameEs: 'Euro'
  }
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
  getCurrencyInfo: () => CurrencyInfo;
  getAllCurrencies: () => CurrencyInfo[];
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('currency')
          .eq('id', user.id)
          .single();

        if (userData?.currency) {
          setCurrencyState(userData.currency);
          await AsyncStorage.setItem('currency', userData.currency);
        } else {
          // Load from AsyncStorage as fallback
          const storedCurrency = await AsyncStorage.getItem('currency');
          if (storedCurrency && CURRENCIES[storedCurrency as Currency]) {
            setCurrencyState(storedCurrency as Currency);
          }
        }
      } else {
        // Load from AsyncStorage when not authenticated
        const storedCurrency = await AsyncStorage.getItem('currency');
        if (storedCurrency && CURRENCIES[storedCurrency as Currency]) {
          setCurrencyState(storedCurrency as Currency);
        }
      }
    } catch (error) {
      console.error('Error loading currency:', error);
      // Load from AsyncStorage as fallback
      const storedCurrency = await AsyncStorage.getItem('currency');
      if (storedCurrency && CURRENCIES[storedCurrency as Currency]) {
        setCurrencyState(storedCurrency as Currency);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCurrency = async (newCurrency: Currency) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase
          .from('users')
          .update({ currency: newCurrency })
          .eq('id', user.id);

        if (!error) {
          setCurrencyState(newCurrency);
          await AsyncStorage.setItem('currency', newCurrency);
        }
      } else {
        setCurrencyState(newCurrency);
        await AsyncStorage.setItem('currency', newCurrency);
      }
    } catch (error) {
      console.error('Error updating currency:', error);
    }
  };

  const formatCurrency = (amount: number): string => {
    const currencyInfo = CURRENCIES[currency];
    
    // Format with appropriate decimal places
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);

    return `${currencyInfo.symbol}${formattedAmount}`;
  };

  const getCurrencyInfo = (): CurrencyInfo => {
    return CURRENCIES[currency];
  };

  const getAllCurrencies = (): CurrencyInfo[] => {
    return Object.values(CURRENCIES);
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency: updateCurrency,
      formatCurrency,
      getCurrencyInfo,
      getAllCurrencies,
      loading
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
