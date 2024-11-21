import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useProdutos } from '../context/ProductContext';

type RootStackParamList = {
  Home: undefined;
  CadastroNovoProduto: undefined;
  CadastroNovaVenda: undefined;
  HistoricoDeVendas: undefined;
  Atualizar: undefined;
  Remover: undefined;
  Listar: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const Index = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { produtos } = useProdutos();

  const [totalCompra, setTotalCompra] = useState(0);
  const [totalVenda, setTotalVenda] = useState(0);
  const [quantidadeTotal, setQuantidadeTotal] = useState(0);

  // Função para formatar valores monetários acima de 1000 para "k"
  const formatMonetaryValue = (value: number) => {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(2);
  };

  useEffect(() => {
    let somaTotalCompra = 0;
    let somaTotalVenda = 0;
    let somaQuantidade = 0;

    produtos.forEach((produto) => {
      somaTotalCompra += produto.precoCompra * produto.quantidade;
      somaTotalVenda += produto.precoVenda * produto.quantidade;
      somaQuantidade += produto.quantidade;
    });

    setTotalCompra(somaTotalCompra);
    setTotalVenda(somaTotalVenda);
    setQuantidadeTotal(somaQuantidade);
  }, [produtos]);

  return (
    <View style={styles.container}>
      {/* Cabeçalho com Gradiente, Avatar e Informações de Estoque */}
      <LinearGradient
        colors={['#209bf2', '#1f55d7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <View style={styles.avatar}>
          <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.avatarImage} />
        </View>
        <Text style={styles.headerText}>Moda Blue</Text>

        {/* Valores de Compra, Venda e Quantidade */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Valor de estoque</Text>
            <Text style={[styles.statText, styles.green]}>R$ {formatMonetaryValue(totalCompra)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total de venda</Text>
            <Text style={[styles.statText, styles.red]}>R$ {formatMonetaryValue(totalVenda)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Quantidade Total</Text>
            <Text style={[styles.statText, styles.white]}>{quantidadeTotal}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Container de Botões em Duas Colunas */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CadastroNovoProduto')}>
          <Text style={styles.buttonText}>Cadastrar produto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Listar')}>
          <Text style={styles.buttonText}>Todos os produtos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CadastroNovaVenda')}>
          <Text style={styles.buttonText}>Cadastrar venda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('HistoricoDeVendas')}>
          <Text style={styles.buttonText}>Histórico de venda</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 90,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D3D3D3',
    marginBottom: 10,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  green: {
    color: '#FF6B6B',
  },
  red: {
    color: '#20C20E',
  },
  white: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1f55d7',
    borderRadius: 15,
    margin: 0,
    marginTop: 10,
    width: 240,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Index;
