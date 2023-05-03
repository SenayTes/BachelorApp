import Home from './screens/Home';
import Camera from './screens/Cameraa';
import Gallery from './screens/Gallery';
import Login from './screens/login';
import Register from './screens/register';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          options={{headerShown: false}}
          component={Login}
          />
          <Stack.Screen
          name="Register"
          options={{headerShown: false}}
          component={Register}
          />
        <Stack.Screen
          name="Home"
          options={{headerShown: false}}
          component={Home}
          />
        <Stack.Screen
          name="Camera"
          options={{headerShown: false}}
          component={Camera}
          />
        <Stack.Screen
          name="Gallery"
          options={{headerShown: false}}
          component={Gallery}
          />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
