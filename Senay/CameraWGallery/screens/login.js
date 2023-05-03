import { StyleSheet, Text, View, Button, Image, TouchableOpacity,SafeAreaView, ImageBackground} from 'react-native';
import React from 'react';
import { TextInput } from 'react-native-paper';
//import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default function Login({navigation}){
  const [email, onChangeText] = React.useState('');
  const [password, onChangeNumber] = React.useState('');
  //const auth = getAuth(); 

   /* const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successfull:', userCredential.user.uid);
      navigation.navigate('Home');
    } catch (error) {
      console.log(' Login failed:', error);
    }
  };      */

  return(
    <SafeAreaView style={{flex: 1, justifyContent: 'center' , alignItems: 'center'}}>
      <ImageBackground
        style={styles.background}
        source={require('../assets/grey.jpg')}>
      <Image
            style={styles.homeLogo}
            source={require('../assets/logo.png')}
            />
      <Text style={styles.text}> Login </Text>

      <TouchableOpacity
      style={styles.buttonReg}
      onPress={() => navigation.navigate("Register")}>
      <Text style={styles.textReg}> Register </Text>
      </TouchableOpacity>

    <TextInput
        label="Email"
        style={styles.input}
        onChangeText={onChangeText}
        value={email}
        mode="outlined"
      />
      <TextInput
        label="Password"
        style={styles.input}
        onChangeText={onChangeNumber}
        value={password}
        mode="outlined"
        secureTextEntry
      />
        <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate("Home")}>
      <Text style={styles.textLog}> Continue </Text>
      </TouchableOpacity> 
      </ImageBackground>
    </SafeAreaView>
    )
};

const styles = StyleSheet.create({
  homeLogo: {
    flex: 1,
    resizeMode: 'contain',
   },
   text: {
    fontSize: 28,
    fontWeight: '500',
    color: '#333',
    marginBottom: 0,
    marginLeft: 10,
   },
   input: {
    height: 40,
    margin: 40,
    padding: 10,
   },
   button: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 40,
   },
   buttonReg: {
    borderRadius: 10,
    padding: 10,
    marginBottom: -40,
   },
   textLog: {
    fontSize: 28,
    fontWeight: '500',
    color: '#333',
    marginBottom: 0,
    marginLeft: 140,
   },
   textReg: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    marginBottom: 0,
    marginLeft: 285,
   },
});

