import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProdutos } from '../context/ProductContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

type RootStackParamList = {
  Index: undefined;
  CadastroProduto: undefined;
  ListaProdutos: undefined;
  CadastroVendas: undefined;
  HistoricoVendas: undefined;
};

type IndexScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Index'
>;

interface IndexProps {
  navigation: IndexScreenNavigationProp;
}

const Index: React.FC<IndexProps> = ({ navigation }) => {
  const { produtos } = useProdutos();

  const [totalCompra, setTotalCompra] = useState(0);
  const [totalVenda, setTotalVenda] = useState(0);
  const [quantidadeTotal, setQuantidadeTotal] = useState(0);
  const [lucroEstimado, setLucroEstimado] = useState(0);

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
    setLucroEstimado(somaTotalVenda - somaTotalCompra);
  }, [produtos]);
  
  const handleNavigation = (route: keyof RootStackParamList) => {
    navigation.navigate(route);
  };

  const renderButton = (
    icon: string,
    title: string,
    route: keyof RootStackParamList
  ) => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => handleNavigation(route)}
    >
      <MaterialIcons name={icon as any} size={32} color="#fff" style={styles.buttonIcon} />
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#209bf2', '#1f55d7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <View style={styles.avatar}>
          <Image 
            source={require('../../assets/favicon.png')} 
            style={styles.avatarImage}
            defaultSource={require('../../assets/favicon.png')}
          />
        </View>
        <Text style={styles.headerText}>Moda Blue</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Valor em Estoque</Text>
            <Text style={[styles.statText, styles.green]}>
              R$ {formatMonetaryValue(totalCompra)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Potencial de Vendas</Text>
            <Text style={[styles.statText, styles.red]}>
              R$ {formatMonetaryValue(totalVenda)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Quantidade Total</Text>
            <Text style={[styles.statText, styles.white]}>
              {quantidadeTotal}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Lucro Estimado</Text>
            <Text style={[styles.statText, { color: '#FFD700' }]}>
              {formatMonetaryValue(lucroEstimado)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.buttonContainer}>
        {renderButton('add-box', 'Cadastrar produto', 'CadastroProduto')}
        {renderButton('format-list-bulleted', 'Lista de produtos', 'ListaProdutos')}
        {renderButton('shopping-cart', 'Cadastrar Venda', 'CadastroVendas')}
        {renderButton('history', 'Histórico de Vendas', 'HistoricoVendas')}
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
    paddingTop: Platform.OS === 'ios' ? 120 : 90,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    marginBottom: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatarImage: {
    width: '70%',
    height: '70%',
    resizeMode: 'contain',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
    gap: 10,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    minWidth: '45%',
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
    color: '#20C20E',
  },
  red: {
    color: '#FF6B6B',
  },
  white: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'column',
    padding: 20,
    gap: 15,
  },
  button: {
    backgroundColor: '#1f55d7',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonIcon: {
    marginRight: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Index;