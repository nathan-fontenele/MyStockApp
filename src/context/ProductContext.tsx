import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Produto {
  id: number;
  nome: string;
  tamanho: string;
  cor: string;
  marca: string;
  precoCompra: number;
  precoVenda: number;
  quantidade: number;
}

interface ProdutosContextData {
  produtos: Produto[];
  adicionarProduto: (produto: Omit<Produto, 'id'>) => void;
  removerProduto: (id: number) => void;
  atualizarProduto: (id: number, produto: Omit<Produto, 'id'>) => void;
}

const ProdutosContext = createContext<ProdutosContextData | undefined>(undefined);

const PRODUTOS_KEY = '@produtos';

export const ProdutosProvider = ({ children }: { children: ReactNode }) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const produtosJSON = await AsyncStorage.getItem(PRODUTOS_KEY);
      if (produtosJSON) {
        setProdutos(JSON.parse(produtosJSON));
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const salvarProdutos = async (produtosAtualizados: Produto[]) => {
    try {
      await AsyncStorage.setItem(PRODUTOS_KEY, JSON.stringify(produtosAtualizados));
      setProdutos(produtosAtualizados);
    } catch (error) {
      console.error('Erro ao salvar produtos:', error);
    }
  };

  const adicionarProduto = (produto: Omit<Produto, 'id'>) => {
    const novoProduto = {
      id: Date.now(), // Usando timestamp como ID único
      ...produto,
    };
    const produtosAtualizados = [...produtos, novoProduto];
    salvarProdutos(produtosAtualizados);
  };

  const removerProduto = (id: number) => {
    const produtosAtualizados = produtos.filter((produto) => produto.id !== id);
    salvarProdutos(produtosAtualizados);
  };

  const atualizarProduto = (id: number, produtoAtualizado: Omit<Produto, 'id'>) => {
    const produtosAtualizados = produtos.map((produto) =>
      produto.id === id ? { id, ...produtoAtualizado } : produto
    );
    salvarProdutos(produtosAtualizados);
  };

  return (
    <ProdutosContext.Provider value={{ produtos, adicionarProduto, removerProduto, atualizarProduto }}>
      {children}
    </ProdutosContext.Provider>
  );
};

export const useProdutos = () => {
  const context = useContext(ProdutosContext);
  if (!context) {
    throw new Error('useProdutos deve ser usado dentro de um ProdutosProvider');
  }
  return context;
};
