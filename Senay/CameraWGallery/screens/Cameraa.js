
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera } from 'expo-camera';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Circle } from 'react-native-svg';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import _ from 'lodash';
//import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export default function Cameraa() {
  // State variables
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [photo, setPhoto] = useState();
  const [firstCircleRef, setFirstCircleRef] = useState(null);
  const [secondCircleRef, setSecondCircleRef] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isAt90Degrees, setIsAt90Degrees] = useState(false);
  const [adjustment, setAdjustment] = useState(0);
  const [roll, setRoll] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [feedback, setFeedback] = useState('');
  const rollAnim = new Animated.Value(0);
  const [smoothedRoll, setSmoothedRoll] = useState(0);
  const [smoothedPitch, setSmoothedPitch] = useState(0);
  const [rollBuffer, setRollBuffer] = useState([]);
  const [pitchBuffer, setPitchBuffer] = useState([]);

  const BUFFER_SIZE = 5; // Use last 5 readings for smoothing

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);
  // Hook to read accelerometer data and update the state accordingly
  useEffect(() => {
    // Subscribe to accelerometer updates
    const subscription = Accelerometer.addListener(
      _.debounce(({ x, y, z }) => {
        // Calculate roll and pitch
        const roll = Math.atan2(y, z) * (180 / Math.PI);
        const pitch = Math.atan2(-x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);

        // For smoothing
        // Update the roll and pitch buffers
        let newRollBuffer = [...rollBuffer, roll];
        let newPitchBuffer = [...pitchBuffer, pitch];
        if (newRollBuffer.length > BUFFER_SIZE) newRollBuffer.shift();
        if (newPitchBuffer.length > BUFFER_SIZE) newPitchBuffer.shift();
        // Calculate averages for smoothing
        const avgRoll = newRollBuffer.reduce((a, b) => a + b) / newRollBuffer.length;
        const avgPitch = newPitchBuffer.reduce((a, b) => a + b) / newPitchBuffer.length;
        // length;
        // Set the new state
        setRollBuffer(newRollBuffer);
        setPitchBuffer(newPitchBuffer);
        setSmoothedRoll(avgRoll);
        setSmoothedPitch(avgPitch);

        // Animate roll movement
        Animated.timing(rollAnim, {
          toValue: avgRoll,
          duration: 500,
          useNativeDriver: false,
        }).start();

        // Update roll and pitch
        setRoll(avgRoll);
        setPitch(avgPitch);
        setIsAt90Degrees(
          avgRoll >= 85 - adjustment && avgRoll <= 95 + adjustment &&
          avgPitch >= -5 - adjustment && avgPitch <= 5 + adjustment
        );

        console.log('Smoothed Roll:', avgRoll.toFixed(2), 'Smoothed Pitch:', avgPitch.toFixed(2));

      }, 0) // Debounce time in ms
    );

    return () => {
      subscription && subscription.remove();
    };
  }, [adjustment, rollAnim, rollBuffer, pitchBuffer]);

  const handleCalibratePress = useCallback(() => {
    setAdjustment(0);
  }, []);

  const handleIncreaseAdjustment = useCallback(() => {
    setAdjustment(adjustment + 1);
  }, [adjustment]);

  const handleDecreaseAdjustment = useCallback(() => {
    setAdjustment(adjustment - 1);
  }, [adjustment]);

  if (hasCameraPermission === undefined) {
    return <Text>Requesting permissions...</Text>
  } else if (!hasCameraPermission) {
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

  if (photo) {
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
        <Image style={styles.preview} source={{ uri: "data:image/jpg;base64," + photo.base64 }} />
        <View style={styles.btnContainer}>
          <TouchableOpacity
            onPress={sharePic}>
            <Icon name="share" size={50} color="grey" />
          </TouchableOpacity>

          {hasMediaLibraryPermission &&
            <TouchableOpacity onPress={savePhoto}>
              <Icon name="download" size={50} color="gray" />
            </TouchableOpacity>
          }
          <TouchableOpacity onPress={() => setPhoto(undefined)}>
            <Icon name="trash" size={50} color={"grey"} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera style={{ aspectRatio: '3/4' }} ref={cameraRef}>

        <View style={styles.circlContainer}>
          <Svg height="100%" width="100%">
            <Circle
              cx="50%"
              cy="50%"
              r="70"
              fill="none"
              stroke="blue"
              strokeWidth="4"
              ref={setFirstCircleRef}
            />
            <Circle
              cx="50%"
              cy="50%"
              r="140"
              fill="none"
              stroke="none"
              strokeWidth="4"
              ref={setSecondCircleRef}
            />
          </Svg>
          <Animated.View
            style={[
              styles.line,
              styles.horizontalLine,
              { backgroundColor: isAt90Degrees ? 'green' : 'red' },
              {
                transform: [{
                  rotateZ: rollAnim.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  })
                }]
              }
            ]}
          />
          <View style={[styles.line, styles.verticalLine, { backgroundColor: isAt90Degrees ? 'green' : 'red' }]} />
          <Text style={[styles.feedback, isAt90Degrees ? styles.feedbackGood : styles.feedbackAdjust]}>{feedback}</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={takePic}>
            <Icon name="camera" size={50} color="white" />
          </TouchableOpacity>
          <View style={styles.adjustment}>
            <Text>Adjustment: {adjustment}</Text>
            <TouchableOpacity onPress={handleCalibratePress}>
              <Text>Calibrate</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleIncreaseAdjustment}>
              <Text>Increase Adjustment</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDecreaseAdjustment}>
              <Text>Decrease Adjustment</Text>
            </TouchableOpacity>
            </View>
          </View>
          <StatusBar style="auto" />
      </Camera>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  preview: {
    alignSelf: 'stretch',
    flex: 1
  },
  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    position: 'absolute',
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
  circlContainer: {
    marginTop: 0,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalLine: {
    height: 1,
    width: '50%',
    top: '50%',
  },
  verticalLine: {
    height: '25%',
    width: 1,
    left: '50%',
  },
  adjustment: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  feedback: {
    position: 'absolute',
    bottom: 20,
    color: 'white',
    fontSize: 20,
  },
  feedbackGood: {
    color: 'green',
  },
  feedbackAdjust: {
    color: 'red',
  },
});
