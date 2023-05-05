import { StyleSheet, Text, View, Button, Image, TouchableOpacity,SafeAreaView, ImageBackground} from 'react-native';
import React from 'react';
import { TextInput } from 'react-native-paper';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export default function Register({navigation}){
  const [email, onChangeText] = React.useState('');
  const [password, onChangeNumber] = React.useState('');
  const auth = getAuth();

  const handleRegister = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User registered successfully:', userCredential.user.uid);
      () => navigation.navigate("Login");
      // Navigate to the home screen or show a success message
    } catch (error) {
      console.log('Error registering user:', error);
      // Show an error message to the user
    }
  };    
  
  return(
    <SafeAreaView style={{flex: 1, justifyContent: 'center' , alignItems: 'center'}}>
      <ImageBackground
        style={styles.background}
        source={require('../assets/grey.jpg')}>
      <Image
            style={styles.homeLogo}
            source={require('../assets/logo.png')}
            />
      <Text style={styles.text}> Register </Text>

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
        onPress={ handleRegister}>
        <Text style={styles.textLog}> Create account </Text>
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
   textLog: {
    fontSize: 28,
    fontWeight: '500',
    color: '#333',
    marginBottom: 0,
    marginLeft: 100,
   },
   textReg: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 0,
    marginLeft: 300,
   },
});

