import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { Camera } from 'expo-camera';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import _ from 'lodash';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [isAt90Degrees, setIsAt90Degrees] = useState(false);
  const [adjustment, setAdjustment] = useState(0);
  const [roll, setRoll] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [yaw, setYaw] = useState(0);  // New yaw state
  const [feedback, setFeedback] = useState('');
  const rollAnim = new Animated.Value(0);
  const [smoothedRoll, setSmoothedRoll] = useState(0);
  const [smoothedPitch, setSmoothedPitch] = useState(0);
  const [rollBuffer, setRollBuffer] = useState([]);
  const [pitchBuffer, setPitchBuffer] = useState([]);

  const BUFFER_SIZE = 5; // Use last 5 readings for smoothing

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    // New subscription for gyroscope
    let gyroSubscription = null;
    let lastUpdate = Date.now();
    const updateInterval = 100;  // Adjust this to change the update frequency

    gyroSubscription = Gyroscope.addListener(({ x, y, z }) => {
      const currentTime = Date.now();
      const dt = (currentTime - lastUpdate) / 1000.0;  // Time since last update in seconds
      lastUpdate = currentTime;
      setYaw((yaw + z * dt) % 360);  // Add rotation speed to yaw, modulus to keep it within 0-360
    });

    Gyroscope.setUpdateInterval(updateInterval);

    return () => {
      gyroSubscription && gyroSubscription.remove();
    };
  }, [yaw]);
  useEffect(() => {
    const subscription = Accelerometer.addListener(
      _.debounce(({ x, y, z }) => {
        const roll = Math.atan2(y, z) * (180 / Math.PI);
        const pitch = Math.atan2(-x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);

        // For smoothing
        let newRollBuffer = [...rollBuffer, roll];
        let newPitchBuffer = [...pitchBuffer, pitch];
        if(newRollBuffer.length > BUFFER_SIZE) newRollBuffer.shift();
        if(newPitchBuffer.length > BUFFER_SIZE) newPitchBuffer.shift();
        const avgRoll = newRollBuffer.reduce((a, b) => a + b) / newRollBuffer.length;
        const avgPitch = newPitchBuffer.reduce((a, b) => a + b) / newPitchBuffer.length;

        setRollBuffer(newRollBuffer);
        setPitchBuffer(newPitchBuffer);
        setSmoothedRoll(avgRoll);
        setSmoothedPitch(avgPitch);

        Animated.timing(rollAnim, {
          toValue: avgRoll,
          duration: 500,
          useNativeDriver: false,
        }).start();

        setRoll(avgRoll);
        setPitch(avgPitch);
        setIsAt90Degrees(
          avgRoll >= 85 - adjustment && avgRoll <= 95 + adjustment &&
          avgPitch >= -5 - adjustment && avgPitch <= 5 + adjustment
        );

        if(avgRoll < 85 - adjustment) {
          setFeedback('Rotate Clockwise');
        } else if (avgRoll > 95 + adjustment) {
          setFeedback('Rotate Counter Clockwise');
        } else {
          setFeedback('Good! Hold this position');
        }
        setTimeout(() => {
          console.log('Smoothed Roll:', avgRoll.toFixed(2), 'Smoothed Pitch:', avgPitch.toFixed(2));
        }, 1000);        
       
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

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera}>
      <Animated.View 
        style={[
          styles.line, 
          styles.horizontalLine, 
          { backgroundColor: isAt90Degrees ? 'green' : 'red' },
          { transform: [{ rotateZ: rollAnim.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
              }) }] }
        ]} 
      />
        <View style={[styles.line, styles.verticalLine, { backgroundColor: isAt90Degrees ? 'green' : 'red' }]} />
        <Text style={[styles.feedback, isAt90Degrees ? styles.feedbackGood : styles.feedbackAdjust]}>{feedback}</Text>
      </Camera>
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
