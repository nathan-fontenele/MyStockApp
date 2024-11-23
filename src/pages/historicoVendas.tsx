import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Platform 
} from 'react-native';
import { useVendas } from '../context/VendasContext';
import { useProdutos } from '../context/ProductContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RNFS from 'react-native-fs';
import * as Sharing from 'expo-sharing'; 
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';

type RootStackParamList = {
  Index: undefined;
  HistoricoVendas: undefined;
};

type HistoricoVendasScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'HistoricoVendas'
>;

interface HistoricoVendasProps {
  navigation: HistoricoVendasScreenNavigationProp;
}

const HistoricoVendas: React.FC<HistoricoVendasProps> = ({ navigation }) => {
  const { vendas, carregarVendas, limparVendas } = useVendas();
  const { produtos } = useProdutos();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVendas, setFilteredVendas] = useState(vendas);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMarca, setSelectedMarca] = useState('');
  const [uniqueMarcas, setUniqueMarcas] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [totalPeriodo, setTotalPeriodo] = useState(0);

const handleExportReport = async () => {
  if (filteredVendas.length === 0) {
    Alert.alert('Nenhum dado', 'Não há vendas para exportar no período selecionado.');
    return;
  }

  // Organizar os dados no formato necessário para o Excel
  const data = filteredVendas.map((venda) => ({
    Data: formatDate(venda.data),
    Produto: venda.produto,
    Marca: venda.marca,
    Quantidade: venda.quantidade,
    'Preço Unitário': venda.precoVenda.toFixed(2),
    Total: venda.valorTotal.toFixed(2),
  }));

  // Criar a planilha
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório de Vendas');

  // Converter a planilha para um arquivo binário
  const xlsxOutput = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });

  // Definir o caminho para salvar o arquivo
  const fileUri = `${FileSystem.documentDirectory}relatorio_vendas.xlsx`;

  try {
    // Salvar o arquivo no sistema de arquivos
    await FileSystem.writeAsStringAsync(fileUri, xlsxOutput, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Compartilhar o arquivo gerado
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      Alert.alert('Sucesso', `Relatório salvo em: ${fileUri}`);
    }
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível gerar o relatório.');
    console.error(error);
  }
};

  
  useEffect(() => {
    carregarVendas();
  }, []);

  useEffect(() => {
    const marcas = [...new Set(produtos.map(produto => produto.marca))];
    setUniqueMarcas(marcas);
    applyFilters();
  }, [vendas, searchTerm, selectedDate, selectedMarca, produtos]);

  const applyFilters = () => {
    let filtered = [...vendas];
    filtered.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    if (searchTerm) {
      filtered = filtered.filter(venda =>
        venda.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venda.marca.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(venda => {
        const vendaDate = new Date(venda.data);
        return (
          vendaDate.getDate() === selectedDate.getDate() &&
          vendaDate.getMonth() === selectedDate.getMonth() &&
          vendaDate.getFullYear() === selectedDate.getFullYear()
        );
      });
    }

    if (selectedMarca) {
      filtered = filtered.filter(venda => venda.marca === selectedMarca);
    }

    const total = filtered.reduce((acc, venda) => acc + venda.valorTotal, 0);
    setTotalPeriodo(total);
    setFilteredVendas(filtered);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDate(null);
    setSelectedMarca('');
  };

  const handleLimparHistorico = () => {
    Alert.alert(
      'Limpar Histórico',
      'Tem certeza que deseja limpar todo o histórico de vendas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          style: 'destructive', 
          onPress: async () => {
            await limparVendas();
            Alert.alert('Sucesso', 'Histórico limpo com sucesso!');
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.produtoItem}>
      <View style={styles.produtoHeader}>
        <Text style={styles.produtoNome}>{item.produto}</Text>
        <Text style={styles.dataVenda}>{formatDate(item.data)}</Text>
      </View>
      
      <View style={styles.produtoInfo}>
        <Text style={styles.produtoDetalhe}>
          <MaterialIcons name="label" size={16} color="#666" /> {item.marca}
        </Text>
        <Text style={styles.produtoDetalhe}>
          <MaterialIcons name="palette" size={16} color="#666" /> {item.cor}
        </Text>
        <Text style={styles.produtoDetalhe}>
          <MaterialIcons name="shopping-cart" size={16} color="#666" /> Qtd: {item.quantidade}
        </Text>
      </View>

      <View style={styles.produtoFooter}>
        <View>
          <Text style={styles.precoLabel}>Preço Unit.</Text>
          <Text style={styles.precoProduto}>{formatCurrency(item.precoVenda)}</Text>
        </View>
        <View>
          <Text style={styles.precoLabel}>Total</Text>
          <Text style={styles.totalVenda}>{formatCurrency(item.valorTotal)}</Text>
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
          <Text style={styles.headerText}>Histórico de Vendas</Text>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por produto ou marca..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#666"
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialIcons 
            name={showFilters ? "filter-list-off" : "filter-list"} 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.filterButtonText}>
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
  style={styles.exportButton}
  onPress={handleExportReport}
>
  <MaterialIcons name="file-download" size={24} color="#fff" />
  <Text style={styles.exportButtonText}>Exportar Relatório</Text>
</TouchableOpacity>

        

        <TouchableOpacity
          style={styles.clearHistoryButton}
          onPress={handleLimparHistorico}
        >
          <MaterialIcons name="delete-outline" size={24} color="#fff" />
          <Text style={styles.clearHistoryButtonText}>Limpar</Text>
        </TouchableOpacity>

      </View>

      {showFilters && (
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="calendar-today" size={24} color="#1f55d7" />
            <Text style={styles.dateButtonText}>
              {selectedDate
                ? selectedDate.toLocaleDateString()
                : 'Selecionar Data'}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Text style={styles.filterLabel}>Filtrar por Marca:</Text>
          <View style={styles.marcaButtons}>
            {uniqueMarcas.map((marca) => (
              <TouchableOpacity
                key={marca}
                style={[
                  styles.marcaButton,
                  selectedMarca === marca && styles.marcaButtonSelected,
                ]}
                onPress={() => setSelectedMarca(marca === selectedMarca ? '' : marca)}
              >
                <Text style={[
                  styles.marcaButtonText,
                  selectedMarca === marca && styles.marcaButtonTextSelected
                ]}>
                  {marca}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearFilters}
          >
            <MaterialIcons name="clear-all" size={24} color="#fff" />
            <Text style={styles.clearButtonText}>Limpar Filtros</Text>
          </TouchableOpacity>
        </View>
      )}

      {filteredVendas.length > 0 && (
        <View style={styles.totalBar}>
          <Text style={styles.totalBarLabel}>Total do Período:</Text>
          <Text style={styles.totalBarValue}>{formatCurrency(totalPeriodo)}</Text>
        </View>
      )}

      <FlatList
        data={filteredVendas}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="receipt-long" size={48} color="#666" />
            <Text style={styles.emptyText}>
              {searchTerm || selectedDate || selectedMarca 
                ? 'Nenhuma venda encontrada para esta busca'
                : 'Nenhuma venda registrada'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

// E aqui os estilos atualizados:

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
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
  },
  exportButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f55d7',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  filterButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 10,
    width: 100,
    justifyContent: 'center',
  },
  clearHistoryButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  dateButtonText: {
    color: '#1f55d7',
    marginLeft: 8,
    fontSize: 16,
  },
  marcaContainer: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  marcaButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  marcaButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1f55d7',
  },
  marcaButtonSelected: {
    backgroundColor: '#1f55d7',
  },
  marcaButtonText: {
    color: '#1f55d7',
  },
  marcaButtonTextSelected: {
    color: '#fff',
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
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
    flex: 1,
  },
  dataVenda: {
    fontSize: 14,
    color: '#666',
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
  precoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  precoProduto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f55d7',
  },
  totalVenda: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#20C20E',
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
  totalBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  totalBarLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalBarValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#20C20E',
  },
});
export default HistoricoVendas;