
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useEffect,useRef, useState } from 'react';
import {Camera} from 'expo-camera';
import {shareAsync} from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Circle } from 'react-native-svg';
import { Accelerometer, Gyroscope } from 'expo-sensors';

const ANGLE_RANGE = 5; // Allow a 5-degree range around 90 degrees
const Z_THRESHOLD = 0.8; // Require the z-axis value to be above 0.8 for the gyroscope
const MIN_ANGLE = 85; // degrees
const MAX_ANGLE = 95; // degrees
const alpha = 0.98; // Weighting factor for gyroscope data
const beta = 1 - alpha; // Weighting factor for accelerometer dat

export default function App() {
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [firstCircleRef, setFirstCircleRef] = useState(null);
  const [secondCircleRef, setSecondCircleRef] = useState(null);
  const[photo, setPhoto] = useState();
  const [isAt90Degrees, setIsAt90Degrees] = useState(false);
  const [adjustment, setAdjustment] = useState(0);
  const [{x, y, z }, setData] = useState({
    x: 0,
    y:0,
    z:0,
  });

  
  useEffect(() => {
    let prevAngle = 0;
    let prevTimestamp = 0;
    let gyroAngle = 0;
  
    const accelerometerSubscription = Accelerometer.addListener(({ x, y, z, timestamp }) => {
      const accAngle = Math.atan2(y, x) * (180 / Math.PI) - adjustment;
      const dt = (timestamp - prevTimestamp) / 1000; // Convert to seconds
      prevTimestamp = timestamp;
  
      // Low-pass filter on accelerometer data
      const accAngleFiltered = beta * accAngle + alpha * gyroAngle;
  
      const isAt90Degrees = Math.abs(accAngleFiltered - 90) <= ANGLE_RANGE
        && Math.abs(z) >= Z_THRESHOLD
        && accAngleFiltered >= MIN_ANGLE
        && accAngleFiltered <= MAX_ANGLE;
  
      setIsAt90Degrees(isAt90Degrees);
      console.log('Angle:', accAngleFiltered);
  
      prevAngle = accAngleFiltered;
    });
  
    const gyroscopeSubscription = Gyroscope.addListener(({ x, y, z, timestamp }) => {
      const dt = (timestamp - prevTimestamp) / 1000; // Convert to seconds
      prevTimestamp = timestamp;
  
      // High-pass filter on gyroscope data
      const rateOfChange = (y / 131) * (Math.PI / 180); // Convert to radians per second
      gyroAngle += rateOfChange * dt;
  
      prevAngle = beta * prevAngle + alpha * gyroAngle;
    });
  
    return () => {
      accelerometerSubscription.remove();
      gyroscopeSubscription.remove();
    };
  }, []);

  // If the device is at 90 degrees in both x and y axes, change the line colors to green, otherwise to red
  const lineStyles = {
    horizontalLine: {
      backgroundColor: isAt90Degrees ? 'green' : 'red',
    },
    verticalLine: {
      backgroundColor: isAt90Degrees ? 'green' : 'red',
    },
  };

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
           <View style={[styles.line, styles.horizontalLine, lineStyles.horizontalLine]} />
           <View style={[styles.line, styles.verticalLine, lineStyles.verticalLine]} />
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
    marginTop: -100,

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

  line: {
    position: 'absolute',
  },
  horizontalLine: {
    height: 1,
    width: '10%',
    top: '50%',
    transformOrigin: 'center center',
    marginLeft: 520,
  },
  verticalLine: {
    height: '7%',
    width: 1,
    left: '50%',
    transformOrigin: 'center center',
    marginTop: 720,
  },
  adjustment: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
