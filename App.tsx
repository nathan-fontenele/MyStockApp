import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProdutosProvider } from './src/context/ProductContext';
import { StatusBar, View } from 'react-native';
import Index from './src/pages/index';
import CadastroProduto from './src/pages/cadastroProdutos';
import ListaProdutos from './src/pages/listarProdutos';

// Definição dos tipos para as rotas
export type RootStackParamList = {
  Index: undefined;
  CadastroProduto: undefined;
  ListaProdutos: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar backgroundColor="#209bf2" barStyle="light-content" />
      <NavigationContainer>
        <ProdutosProvider>
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
          </Stack.Navigator>
        </ProdutosProvider>
      </NavigationContainer>
    </View>
  );
};

export default App;