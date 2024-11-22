import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useProdutos } from '../context/ProductContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Produto } from '../context/ProductContext';

type RootStackParamList = {
  Index: undefined;
  CadastroProduto: undefined;
  ListaProdutos: undefined;
};

type ListaProdutosScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ListaProdutos'
>;

interface ListaProdutosProps {
  navigation: ListaProdutosScreenNavigationProp;
}

const ListaProdutos: React.FC<ListaProdutosProps> = ({ navigation }) => {
  const { produtos, removerProduto } = useProdutos();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredProdutos = useMemo(() => {
    return produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      produto.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
      produto.cor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      produto.tamanho.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [produtos, searchQuery]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este produto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await removerProduto(id);
            } catch (error) {
              Alert.alert('Erro', 'Erro ao remover produto');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Produto }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.productName}>{item.nome}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            onPress={() => handleDelete(item.id)}
            style={[styles.actionButton, styles.deleteButton]}
          >
            <MaterialIcons name="delete" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Marca:</Text>
          <Text style={styles.value}>{item.marca}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tamanho:</Text>
          <Text style={styles.value}>{item.tamanho}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Cor:</Text>
          <Text style={styles.value}>{item.cor}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Compra:</Text>
          <Text style={styles.priceValue}>{formatCurrency(item.precoCompra)}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Venda:</Text>
          <Text style={styles.priceValue}>{formatCurrency(item.precoVenda)}</Text>
        </View>
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Qtd:</Text>
          <Text style={styles.quantityValue}>{item.quantidade}</Text>
        </View>
      </View>
    </View>
  );

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
          <Text style={styles.headerText}>Lista de Produtos</Text>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produto por nome, marca, cor ou tamanho..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1f55d7" style={styles.loading} />
      ) : (
        <FlatList
          data={filteredProdutos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inbox" size={48} color="#666" />
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? 'Nenhum produto encontrado para esta busca'
                  : 'Nenhum produto cadastrado'}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#FFE8E8',
  },
  cardBody: {
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 70,
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f55d7',
  },
  quantityContainer: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 12,
    color: '#1f55d7',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f55d7',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ListaProdutos;