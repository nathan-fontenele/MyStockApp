import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Venda {
  id: number;
  produto: string;
  marca: string;
  cor: string;
  tamanho: string;
  precoVenda: number;
  quantidade: number;
  valorTotal: number;
  data: string;
}

interface VendasContextData {
  vendas: Venda[];
  carregarVendas: () => Promise<void>;
  adicionarVenda: (venda: Omit<Venda, 'id'>) => Promise<void>;
  limparVendas: () => Promise<void>;
}

const VendasContext = createContext<VendasContextData | undefined>(undefined);
const VENDAS_KEY = '@vendas';

export const VendasProvider = ({ children }: { children: ReactNode }) => {
  const [vendas, setVendas] = useState<Venda[]>([]);

  useEffect(() => {
    carregarVendas();
  }, []);

  const carregarVendas = async () => {
    try {
      const vendasJSON = await AsyncStorage.getItem(VENDAS_KEY);
      if (vendasJSON) {
        setVendas(JSON.parse(vendasJSON));
      }
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
    }
  };

  const salvarVendas = async (vendasAtualizadas: Venda[]) => {
    try {
      await AsyncStorage.setItem(VENDAS_KEY, JSON.stringify(vendasAtualizadas));
      setVendas(vendasAtualizadas);
    } catch (error) {
      console.error('Erro ao salvar vendas:', error);
    }
  };

  const adicionarVenda = async (venda: Omit<Venda, 'id'>) => {
    const novaVenda = {
      id: Date.now(),
      ...venda,
    };
    const vendasAtualizadas = [...vendas, novaVenda];
    await salvarVendas(vendasAtualizadas);
  };

  const limparVendas = async () => {
    try {
      await AsyncStorage.removeItem(VENDAS_KEY);
      setVendas([]);
    } catch (error) {
      console.error('Erro ao limpar vendas:', error);
    }
  };

  return (
    <VendasContext.Provider value={{ vendas, carregarVendas, adicionarVenda, limparVendas }}>
      {children}
    </VendasContext.Provider>
  );
};

export const useVendas = () => {
  const context = useContext(VendasContext);
  if (!context) {
    throw new Error('useVendas deve ser usado dentro de um VendasProvider');
  }
  return context;
};