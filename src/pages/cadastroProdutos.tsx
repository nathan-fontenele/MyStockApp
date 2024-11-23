import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useProdutos } from '../context/ProductContext';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    Index: undefined;
    CadastroProduto: undefined;
  };
  
  // Tipo para as propriedades da navegação
  type CadastroProdutoScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'CadastroProduto'
  >;  

interface CadastroProdutoProps {
    navigation: CadastroProdutoScreenNavigationProp;
  }

// Interface para os dados do formulário
interface FormData {
  nome: string;
  tamanho: string;
  cor: string;
  marca: string;
  precoCompra: string;
  precoVenda: string;
  quantidade: string;
}

// Interface para os erros do formulário
interface FormErrors {
  nome?: string;
  tamanho?: string;
  cor?: string;
  marca?: string;
  precoCompra?: string;
  precoVenda?: string;
  quantidade?: string;
}

const CadastroProduto: React.FC<CadastroProdutoProps> = ({ navigation }) => {
  const { adicionarProduto } = useProdutos();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    tamanho: '',
    cor: '',
    marca: '',
    precoCompra: '',
    precoVenda: '',
    quantidade: ''
  });

  const updateFormField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do produto é obrigatório';
    }

    if (!formData.precoCompra || parseFloat(formData.precoCompra.replace(/\D/g, '')) <= 0) {
      newErrors.precoCompra = 'Preço de compra deve ser maior que zero';
    }

    if (!formData.precoVenda || parseFloat(formData.precoVenda.replace(/\D/g, '')) <= 0) {
      newErrors.precoVenda = 'Preço de venda deve ser maior que zero';
    }

    if (!formData.quantidade || parseInt(formData.quantidade) <= 0) {
      newErrors.quantidade = 'Quantidade deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handlePriceInput = (field: keyof Pick<FormData, 'precoCompra' | 'precoVenda'>, value: string) => {
    const formattedValue = formatCurrency(value);
    updateFormField(field, formattedValue);
  };

  const handleCadastro = async () => {
    if (!validateForm()) {
      Alert.alert('Erro', 'Por favor, corrija os campos marcados em vermelho');
      return;
    }

    setLoading(true);
    try {
      const produto = {
        nome: formData.nome,
        tamanho: formData.tamanho,
        cor: formData.cor,
        marca: formData.marca,
        precoCompra: parseFloat(formData.precoCompra.replace(/\D/g, '')) / 100,
        precoVenda: parseFloat(formData.precoVenda.replace(/\D/g, '')) / 100,
        quantidade: parseInt(formData.quantidade),
      };

      await adicionarProduto(produto);
      
      Alert.alert(
        'Sucesso',
        'Produto cadastrado com sucesso!',
        [
          {
            text: 'Cadastrar outro',
            onPress: () => {
              setFormData({
                nome: '',
                tamanho: '',
                cor: '',
                marca: '',
                precoCompra: '',
                precoVenda: '',
                quantidade: ''
              });
            },
            style: 'cancel'
          },
          {
            text: 'Voltar para início',
            onPress: () => navigation.navigate('Index')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao cadastrar o produto');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof FormData,
    placeholder: string,
    keyboardType: 'default' | 'numeric' = 'default',
    customOnChangeText?: (value: string) => void
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          errors[field] && styles.inputError,
          (field === 'precoCompra' || field === 'precoVenda') ? styles.currencyInput : {}
        ]}
        value={formData[field]}
        onChangeText={customOnChangeText || ((value) => updateFormField(field, value))}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor="#999"
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
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
          <Text style={styles.headerText}>Registrar Produto</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.formContainer}>
        {renderInput('Nome do Produto', 'nome', 'Ex: Camiseta Básica')}
        {renderInput('Tamanho', 'tamanho', 'Ex: M, G, 42')}
        {renderInput('Cor', 'cor', 'Ex: Azul, Vermelho')}
        {renderInput('Marca', 'marca', 'Ex: Nike, Adidas')}
        {renderInput(
          'Preço de compra (R$)',
          'precoCompra',
          'R$ 0,00',
          'numeric',
          (value) => handlePriceInput('precoCompra', value)
        )}
        {renderInput(
          'Preço de venda (R$)',
          'precoVenda',
          'R$ 0,00',
          'numeric',
          (value) => handlePriceInput('precoVenda', value)
        )}
        {renderInput('Quantidade', 'quantidade', '0', 'numeric')}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCadastro}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Cadastrar Produto</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#97A5FF',
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  currencyInput: {
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#1f55d7',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#97A5FF',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CadastroProduto;