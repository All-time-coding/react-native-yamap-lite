import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { MapMode, MapType } from '../hooks/useMapSettings';

interface SettingsBarProps {
  mapMode: MapMode;
  mapType: MapType;
  nightMode: boolean;
  showCircle: boolean;
  showPolygon: boolean;
  showPolyline: boolean;
  scrollGesturesEnabled: boolean;
  zoomGesturesEnabled: boolean;
  onToggleMapMode: () => void;
  onCycleMapType: () => void;
  onToggleNightMode: () => void;
  onToggleCircle: () => void;
  onTogglePolygon: () => void;
  onTogglePolyline: () => void;
  onToggleScroll: () => void;
  onToggleZoom: () => void;
}

const Chip = ({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, active && styles.chipActive]}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const SettingsBar = ({
  mapMode,
  mapType,
  nightMode,
  showCircle,
  showPolygon,
  showPolyline,
  scrollGesturesEnabled,
  zoomGesturesEnabled,
  onToggleMapMode,
  onCycleMapType,
  onToggleNightMode,
  onToggleCircle,
  onTogglePolygon,
  onTogglePolyline,
  onToggleScroll,
  onToggleZoom,
}: SettingsBarProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Chip
          label={mapMode === 'clustered' ? 'Cluster' : 'Plain'}
          active={mapMode === 'clustered'}
          onPress={onToggleMapMode}
        />
        <Chip label={mapType.toUpperCase()} active onPress={onCycleMapType} />
        <Chip label="Night" active={nightMode} onPress={onToggleNightMode} />
        <Chip
          label="Scroll"
          active={scrollGesturesEnabled}
          onPress={onToggleScroll}
        />
        <Chip
          label="Zoom"
          active={zoomGesturesEnabled}
          onPress={onToggleZoom}
        />
      </View>
      <View style={styles.row}>
        <Chip label="● Circle" active={showCircle} onPress={onToggleCircle} />
        <Chip
          label="◆ Polygon"
          active={showPolygon}
          onPress={onTogglePolygon}
        />
        <Chip
          label="— Polyline"
          active={showPolyline}
          onPress={onTogglePolyline}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#333355',
    borderWidth: 1,
    borderColor: '#555577',
  },
  chipActive: {
    backgroundColor: '#4455ff',
    borderColor: '#8899ff',
  },
  chipText: {
    color: '#aaaacc',
    fontSize: 11,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
});
