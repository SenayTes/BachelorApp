import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View, TouchableOpacity, Image, ImageBackground} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'

export default function Home({navigation}) {
  return (
    <ImageBackground
      style={styles.background}
      source={require('../assets/wh.jpg')}>
    <View style={styles.container}>
        <Image
            style={styles.homeLogo}
            source={require('../assets/logo.png')}
            />
        <View style={styles.buttonContainer}>
            <TouchableOpacity
            style={styles.button}
              onPress={() => navigation.navigate("Camera")}>
              <Icon name="camera" size={50} color="blue"/>
            </TouchableOpacity> 

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Gallery")}>
              <Icon name="image" size={50} color="blue"/>
            </TouchableOpacity>  
        </View>
      <StatusBar style="auto" />
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
      },   
    homeLogo: {
       flex: 1,
       resizeMode: 'contain',
       paddingTop: 58
      },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    }, 
    button: {
      borderRadius: 10,
      padding: 10,
    }, 
});