import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProdutosProvider } from './src/context/ProductContext';
import { VendasProvider } from './src/context/VendasContext';
import { StatusBar, View } from 'react-native';
import Index from './src/pages/index';
import CadastroProduto from './src/pages/cadastroProdutos';
import ListaProdutos from './src/pages/listarProdutos';
import CadastroVenda from './src/pages/cadastroVendas';
import HistoricoVendas from './src/pages/historicoVendas';

// Definição dos tipos para as rotas
export type RootStackParamList = {
  Index: undefined;
  CadastroProduto: undefined;
  ListaProdutos: undefined;
  CadastroVendas: undefined;
  HistoricoVendas: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor="#209bf2" barStyle="light-content" />
      <NavigationContainer>
        <ProdutosProvider>
          <VendasProvider>
          <Stack.Navigator
            initialRouteName="Index"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#fff' },
            }}
          >
            <Stack.Screen 
              name="Index" 
              component={Index}
            />
            <Stack.Screen 
              name="CadastroProduto" 
              component={CadastroProduto}
            />
            <Stack.Screen 
              name="ListaProdutos" 
              component={ListaProdutos}
            />

            <Stack.Screen 
              name="CadastroVendas"
              component={CadastroVenda}
            />

            <Stack.Screen 
              name="HistoricoVendas"
              component={HistoricoVendas}
            />
          </Stack.Navigator>
          </VendasProvider>
        </ProdutosProvider>
      </NavigationContainer>
    </View>
  );
};

export default App;