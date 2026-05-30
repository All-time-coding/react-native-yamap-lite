import { View, StyleSheet } from 'react-native';
import { Button } from './Button';

interface ControlPanelProps {
  onIncreaseZoom: () => void;
  onDecreaseZoom: () => void;
  onGetCameraPosition: () => void;
  onCenterMap: () => void;
  onFitAllMarkers: () => void;
}

export const ControlPanel = ({
  onIncreaseZoom,
  onDecreaseZoom,
  onGetCameraPosition,
  onCenterMap,
  onFitAllMarkers,
}: ControlPanelProps) => {
  return (
    <View style={styles.container}>
      <Button title="+" onPress={onIncreaseZoom} boldText />
      <Button title="-" onPress={onDecreaseZoom} boldText />
      <Button title="Fit" onPress={onFitAllMarkers} />
      <Button title="Cam" onPress={onGetCameraPosition} />
      <Button title="Ctr" onPress={onCenterMap} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
    position: 'absolute',
    right: 10,
    top: '30%',
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
  },
});
