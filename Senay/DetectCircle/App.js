
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useEffect,useRef, useState } from 'react';
import {Camera} from 'expo-camera';
import {shareAsync} from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Circle } from 'react-native-svg';
import { Gyroscope } from 'expo-sensors';

export default function App() {
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [firstCircleRef, setFirstCircleRef] = useState(null);
  const [secondCircleRef, setSecondCircleRef] = useState(null);
  const[photo, setPhoto] = useState();

  const [{x, y, z }, setData] = useState({
    x: 0,
    y:0,
    z:0,
  });

  const [subsciption, setSubsciption] = useState(null);

  const _slow = () => Gyroscope.setUpdateInterval(1000);
  const _fast = () => Gyroscope.setUpdateInterval(16);

  const _subscribe = () => {
    setSubsciption(
      Gyroscope.addListener(GyroscopeData => {
        setData(GyroscopeData);
      })
    );
  };
  const _unsubscribe = () => {
    subsciption && subsciption.remove();
    setSubsciption(null);
  };
  
  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);
  
  useEffect(() => {
    (async () => {
        const cameraPermission = await Camera.requestCameraPermissionsAsync();
        const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
        setHasCameraPermission(cameraPermission.status === "granted");
        setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);

  if (hasCameraPermission === undefined){
    return <Text>Requesting permissions...</Text>
  } else if(!hasCameraPermission){
    return <Text>Permission not granted</Text>
  }
  
  let takePic = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: false
      
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
  };

  if(photo) {
    let sharePic = () => {
      shareAsync(photo.uri).then(() => {
        setPhoto(undefined);
      });
    };

    let savePhoto = async () => {
      if (hasMediaLibraryPermission) {
        const asset = await MediaLibrary.createAssetAsync(photo.uri);
        await MediaLibrary.createAlbumAsync('IMG', asset, false);
        setPhoto(undefined);
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        <Image style={styles.preview} source={{uri: "data:image/jpg;base64," + photo.base64 }} />
        <View style={styles.btnContainer}>
        <TouchableOpacity  
          onPress={sharePic}> 
          <Icon name="share" size={50} color="grey"/>
        </TouchableOpacity>

        {hasMediaLibraryPermission &&
        <TouchableOpacity onPress={savePhoto}>
          <Icon name="download" size={50} color="gray"/>
        </TouchableOpacity>
        }
        <TouchableOpacity onPress={() => setPhoto(undefined)}>
          <Icon name="trash" size={50} color={"grey"}/>
        </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
        <Text style={styles.textGy}>x: {x}</Text>
        <Text style={styles.textGy}>y: {y}</Text>
        <Text style={styles.textGy}>z: {z}</Text>
        <Camera style={{aspectRatio: '3/4'}} ref={cameraRef}>
          <Svg height="100%" width="100%">
          <Circle
            cx="50%"
            cy="50%"
            r="100"
            fill="none"
            stroke="blue"
            strokeWidth="4"
            ref={setFirstCircleRef}
          />
          <Circle
            cx="50%"
            cy="50%"
            r="200"
            fill="none"
            stroke="red"
            strokeWidth="4"
            ref={setSecondCircleRef}
          />
          </Svg>
          <View style={styles.buttonContainer}>
              <TouchableOpacity
              onPress={subsciption ? _unsubscribe : _subscribe}
              style={styles.button}>
              <Text>{subsciption ? 'On' : 'off'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
              onPress={_slow}
              style={[styles.button, styles.middleButton]}>
              <Text>{subsciption ? 'On' : 'off'}</Text>
              </TouchableOpacity>
              <Text style={styles.textGy}>Gyroscope</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={takePic}>
                <Icon name="camera" size={50} color="white"/>
              </TouchableOpacity> 
          </View>
          <StatusBar style="auto"/>
        </Camera>
    </SafeAreaView>
    );
  }
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -150,

  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 600,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  preview: {
    alignSelf: 'stretch',
    flex: 1
  },
  imageContainer: {
    flex: 1,
    paddingTop: 50,
  },
  cameraContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 0,
  },
  textGy: {
    textAlign: 'center'
  },
});
