import * as Location from 'expo-location';

export async function sendLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Location permission denied');

  const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return coords
}
