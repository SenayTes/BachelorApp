import { useEffect, useRef, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, Animated } from 'react-native';
import { Camera } from 'expo-camera';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Circle } from 'react-native-svg';
import { Accelerometer } from 'expo-sensors';
import _ from 'lodash';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function Cameraa() {
  // State variables
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [photo, setPhoto] = useState();
  const [firstCircleRef, setFirstCircleRef] = useState(null);
  const [isAt90Degrees, setIsAt90Degrees] = useState(false);
  const [adjustment, setAdjustment] = useState(0);
  const [roll, setRoll] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [smoothedRoll, setSmoothedRoll] = useState(0);
  const [smoothedPitch, setSmoothedPitch] = useState(0);
  const [rollBuffer, setRollBuffer] = useState([]);
  const [pitchBuffer, setPitchBuffer] = useState([]);

  const BUFFER_SIZE = 8; // Use last 8 readings for smoothing

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
        // Calculate averages for smoothing
        const avgRoll = newRollBuffer.reduce((a, b) => a + b) / newRollBuffer.length;
        const avgPitch = newPitchBuffer.reduce((a, b) => a + b) / newPitchBuffer.length;
        // Set the new state
        setRollBuffer(newRollBuffer);
        setPitchBuffer(newPitchBuffer);
        setSmoothedRoll(avgRoll);
        setSmoothedPitch(avgPitch);

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
  }, [adjustment, rollBuffer, pitchBuffer]);

  // If the device is at 90 degrees in both x and y axes, change the line colors to green, otherwise to red
  const lineStyles = {
    horizontalLine: {
      backgroundColor: isAt90Degrees ? 'green' : 'red',
    },
    verticalLine: {
      backgroundColor: isAt90Degrees ? 'green' : 'red',
    },
  };

  let takePic = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: false,
      width: 500
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
  };

  if (hasCameraPermission === undefined) {
    return <Text>Requesting permissions...</Text>
  } else if (!hasCameraPermission) {
    return <Text>Permission not granted</Text>
  }

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
        <View style={styles.btnContainer2}>
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
      <Camera
        style={{ aspectRatio: '3/4' }}
        ref={cameraRef}
      >
        <View style={styles.circlContainer}>
          <Svg height="80%" width="80%">
            <Circle
              cx="50%"
              cy="50%"
              r="60"
              fill="none"
              stroke="blue"
              strokeWidth="4"
              ref={setFirstCircleRef}
            />
          </Svg>
          <View style={[styles.line, styles.horizontalLine, lineStyles.horizontalLine]} />
          <View style={[styles.line, styles.verticalLine, lineStyles.verticalLine]} />
        </View>
        <View style={styles.overlayContainer}>
          <View style={styles.overlayTextContainer}>
            <Text style={styles.overlayText}>
              Roll: {roll.toFixed(2)}°
            </Text>
            <Text style={styles.overlayText}>
              Pitch: {pitch.toFixed(2)}°
            </Text>
          </View>
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={takePic}>
            <Icon name="camera" size={50} color="white" />
          </TouchableOpacity>
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
    marginBottom: 200,
  },
  btnContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  btnContainer2: {
    borderRadius: 10,
    padding: 5,
    flexDirection: 'row'
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    borderRadius: 0,
    padding: 0,
    marginBottom: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circlContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    top: 55,
    marginLeft: 0,
    marginBottom: 0,
  },
  horizontalLine: {
    height: 1,
    width: '25%',
    top: '50%',
  },
  verticalLine: {
    height: '25%',
    width: 1,
    left: '50%',
  },
  overlayContainer: {
    marginLeft: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  overlayTextContainer: {
    padding: 10,
    borderRadius: 5,
  },
  overlayText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
});

