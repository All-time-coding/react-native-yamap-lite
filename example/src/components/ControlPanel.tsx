import { View, StyleSheet } from 'react-native';
import { Button } from './Button';

interface ControlPanelProps {
  handleIncreaseZoom: () => void;
  handleDecreaseZoom: () => void;
  handleGetCameraPosition: () => void;
  handleCenterMap: () => void;
  handleFitAllMarkers: () => void;
}

export const ControlPanel = ({
  handleIncreaseZoom,
  handleDecreaseZoom,
  handleGetCameraPosition,
  handleCenterMap,
  handleFitAllMarkers,
}: ControlPanelProps) => {
  return (
    <View style={styles.buttonsContainer}>
      <Button title="+" onPress={handleIncreaseZoom} boldText />
      <Button title="-" onPress={handleDecreaseZoom} boldText />
      <Button title="Cam" onPress={handleGetCameraPosition} />
      <Button title="Center" onPress={handleCenterMap} />
      <Button title="Fit All" onPress={handleFitAllMarkers} />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonsContainer: {
    gap: 10,
    position: 'absolute',
    right: 20,
  },
});
