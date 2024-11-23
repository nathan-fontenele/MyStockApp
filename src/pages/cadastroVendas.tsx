import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ActivityIndicator,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useProdutos } from '../context/ProductContext';
import { useVendas } from '../context/VendasContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Index: undefined;
  CadastroVenda: undefined;
};

type CadastroVendaScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CadastroVenda'
>;

interface CadastroVendaProps {
  navigation: CadastroVendaScreenNavigationProp;
}

const CadastroVenda: React.FC<CadastroVendaProps> = ({ navigation }) => {
  const { produtos, atualizarProduto } = useProdutos();
  const { adicionarVenda } = useVendas();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProdutos, setFilteredProdutos] = useState(produtos);
  const [selectedProduto, setSelectedProduto] = useState<any>(null);
  const [quantidadeVendida, setQuantidadeVendida] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFilteredProdutos(produtos);
  }, [produtos]);

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    const filtered = text
      ? produtos.filter(produto =>
          produto.nome.toLowerCase().includes(text.toLowerCase()) ||
          produto.marca.toLowerCase().includes(text.toLowerCase())
        )
      : produtos;
    setFilteredProdutos(filtered);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleRegistrarVenda = async () => {
    if (!selectedProduto) {
      Alert.alert('Erro', 'Selecione um produto antes de registrar a venda.');
      return;
    }
    
    if (!quantidadeVendida || parseInt(quantidadeVendida, 10) <= 0) {
      Alert.alert('Erro', 'Informe uma quantidade válida.');
      return;
    }

    const quantidade = parseInt(quantidadeVendida, 10);
    if (quantidade > selectedProduto.quantidade) {
      Alert.alert('Erro', 'Quantidade vendida excede o estoque disponível.');
      return;
    }

    setIsLoading(true);
    try {
      const novaQuantidade = selectedProduto.quantidade - quantidade;
      const valorTotal = quantidade * selectedProduto.precoVenda;

      await atualizarProduto(selectedProduto.id, {
        ...selectedProduto,
        quantidade: novaQuantidade,
      });

      await adicionarVenda({
        produto: selectedProduto.nome,
        marca: selectedProduto.marca,
        precoVenda: selectedProduto.precoVenda,
        cor: selectedProduto.cor,
        tamanho: selectedProduto.tamanho,
        quantidade,
        valorTotal,
        data: new Date().toISOString(),
      });

      Alert.alert(
        'Sucesso', 
        'Venda registrada com sucesso!',
        [
          {
            text: 'Nova Venda',
            onPress: () => {
              setSelectedProduto(null);
              setQuantidadeVendida('');
              setSearchTerm('');
              setFilteredProdutos(produtos);
            },
          },
          {
            text: 'Voltar ao Início',
            onPress: () => navigation.navigate('Index'),
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      Alert.alert('Erro', 'Não foi possível registrar a venda. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderProdutoItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.produtoItem,
        selectedProduto?.id === item.id && styles.selectedProduto,
      ]}
      onPress={() => setSelectedProduto(item)}
    >
      <View style={styles.produtoHeader}>
        <Text style={styles.produtoNome}>{item.nome}</Text>
        <MaterialIcons 
          name={selectedProduto?.id === item.id ? "check-circle" : "radio-button-unchecked"} 
          size={24} 
          color={selectedProduto?.id === item.id ? "#1f55d7" : "#666"}
        />
      </View>
      
      <View style={styles.produtoInfo}>
        <Text style={styles.produtoDetalhe}>
          <MaterialIcons name="label" size={16} color="#666" /> {item.marca}
        </Text>
        <Text style={styles.produtoDetalhe}>
          <MaterialIcons name="palette" size={16} color="#666" /> {item.cor}
        </Text>
        <Text style={styles.produtoDetalhe}>
          <MaterialIcons name="straighten" size={16} color="#666" /> {item.tamanho}
        </Text>
      </View>

      <View style={styles.produtoFooter}>
        <Text style={styles.precoProduto}>
          {formatCurrency(item.precoVenda)}
        </Text>
        <Text style={[
  styles.estoqueProduto,
  item.quantidade <= 5 ? styles.estoquesBaixo : {}
]}>
  Estoque: {item.quantidade}
</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1f55d7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#209bf2', '#1f55d7']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Registrar Venda</Text>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produto por nome ou marca..."
          value={searchTerm}
          onChangeText={handleSearch}
          placeholderTextColor="#666"
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredProdutos}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProdutoItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={48} color="#666" />
            <Text style={styles.emptyText}>
              {searchTerm 
                ? 'Nenhum produto encontrado para esta busca'
                : 'Nenhum produto cadastrado'}
            </Text>
          </View>
        )}
      />

      {selectedProduto && (
        <View style={styles.selectedContainer}>
          <TextInput
            style={styles.quantidadeInput}
            placeholder="Quantidade a ser vendida"
            keyboardType="numeric"
            value={quantidadeVendida}
            onChangeText={setQuantidadeVendida}
          />
          {quantidadeVendida !== '' && (
            <Text style={styles.totalText}>
              Total: {formatCurrency(selectedProduto.precoVenda * parseInt(quantidadeVendida || '0', 10))}
            </Text>
          )}
          <TouchableOpacity 
            style={styles.registrarButton} 
            onPress={handleRegistrarVenda}
            disabled={isLoading}
          >
            <MaterialIcons name="shopping-cart" size={24} color="#fff" />
            <Text style={styles.registrarButtonText}>Registrar Venda</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    padding: 15,
  },
  produtoItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  produtoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  produtoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  produtoInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  produtoDetalhe: {
    fontSize: 14,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  produtoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  precoProduto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f55d7',
  },
  estoqueProduto: {
    fontSize: 14,
    color: '#666',
  },
  estoquesBaixo: {
    color: '#FF6B6B',
  },
  selectedProduto: {
    borderColor: '#1f55d7',
    borderWidth: 2,
  },
  selectedContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  quantidadeInput: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#97A5FF',
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    marginBottom: 10,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f55d7',
    textAlign: 'center',
    marginBottom: 10,
  },
  registrarButton: {
    backgroundColor: '#1f55d7',
    borderRadius: 10,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  registrarButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default CadastroVenda;