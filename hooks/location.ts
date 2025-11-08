import * as Location from 'expo-location';
import { Alert } from 'react-native';

export async function getLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Location permission is needed to get your position. Please enable it in settings.',
      [{ text: 'OK' }]
    );
    return null;
  }

  try {
    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return coords;
  } catch (err) {
    Alert.alert('Location Error', 'Unable to retrieve your location.');
    return null;
  }
}
