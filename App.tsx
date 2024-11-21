import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { ProdutosProvider } from './src/context/ProductContext';
import Index from './src/pages/index';

type RootStackParamList = {
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ProdutosProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='Home'
          screenOptions={{
            headerStyle: {
              backgroundColor: '#97A5FF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            }}>
            
            <Stack.Screen name='Home' component={Index} options={{ title: 'Home' }} />
          </Stack.Navigator>
        </NavigationContainer>
    </ProdutosProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
