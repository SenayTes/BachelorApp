import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [isAt90Degrees, setIsAt90Degrees] = useState(false);
  const [adjustment, setAdjustment] = useState(0);
 
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const angle = Math.atan2(y, x) * (180 / Math.PI);
      setIsAt90Degrees(angle >= 85 - adjustment && angle <= 95 + adjustment);
      console.log('Angle:', angle);
    });

    return () => {
      subscription && subscription.remove();
    };
  }, [adjustment]);

  // If the device is at 90 degrees in both x and y axes, change the line colors to green, otherwise to red
  const lineStyles = {
    horizontalLine: {
      backgroundColor: isAt90Degrees ? 'green' : 'red',
    },
    verticalLine: {
      backgroundColor: isAt90Degrees ? 'green' : 'red',
    },
  };

  // Function to handle calibration button press
  const handleCalibratePress = () => {
    setAdjustment(0);
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera}>
        <View style={[styles.line, styles.horizontalLine, lineStyles.horizontalLine]} />
        <View style={[styles.line, styles.verticalLine, lineStyles.verticalLine]} />
      </Camera>
      <View style={styles.adjustment}>
        <Text>Adjustment: {adjustment}</Text>
        <TouchableOpacity onPress={handleCalibratePress}>
          <Text>Calibrate</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    position: 'absolute',
  },
  horizontalLine: {
    height: 1,
    width: '50%',
    top: '50%',
    transformOrigin: 'center center',
  },
  verticalLine: {
    height: '25%',
    width: 1,
    left: '50%',
    transformOrigin: 'center center',
  },
  adjustment: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
