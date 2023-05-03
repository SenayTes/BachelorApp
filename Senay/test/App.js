import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gyroscope } from 'expo-sensors';
import {Camera} from 'expo-camera';

export default function App() {
  const [{ x, y, z, data }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
    data: {},
  });
  
  const [subscription, setSubscription] = useState(null);
  const [is90Deg, setIs90Deg] = useState(false);
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();

  const _slow = () => Gyroscope.setUpdateInterval(1000);
  const _fast = () => Gyroscope.setUpdateInterval(16);

  const _subscribe = () => {
    setSubscription(
      Gyroscope.addListener(gyroscopeData => {
        setData(gyroscopeData);
        const { x, y, z } = gyroscopeData;
        setIs90Deg(Math.abs(x) < 0.1 && Math.abs(y) < 0.1 && Math.abs(z - 9.81) < 0.1);
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  console.log('x:', x, 'y:', y, 'z:', z, 'is90Deg:', is90Deg);

  if (hasCameraPermission === undefined){
    return <Text>Requesting permissions...</Text>
  } else if(!hasCameraPermission){
    return <Text>Permission not granted</Text>
  }
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
      <Camera style={{aspectRatio: '3/4'}} ref={cameraRef}>
        <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
          <Text>{subscription ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
          <Text>Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_fast} style={styles.button}>
          <Text>Fast</Text>
        </TouchableOpacity>
        </Camera>
      </View>
      <View style={styles.axisContainer}>
        <View style={[styles.axis, { backgroundColor: is90Deg ? 'green' : 'red' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  axisContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  axis: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
