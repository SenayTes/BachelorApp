import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Button, Image } from 'react-native';
import {useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

export default function Gallery() {
  const [image, setImage] = useState(null);

  // Uses the ImagePicker component from the corresponding library to access the image library in the phone
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
      album: "IMG",
    });
    
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
      <View style={styles.buttonContainer} >
        <Button 
        title="Pictures" 
        onPress={pickImage} 
        />
        {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
      <StatusBar style="auto" />
      </View>
  ); 
 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flex: 1 / 3,
    alignItems: 'center',
    paddingTop: 400,
  },
  preview: {
    alignSelf: 'stretch',
    flex: 1
  },
  imageContainer: {
    flex: 1,
    paddingTop: 50,
  },
});