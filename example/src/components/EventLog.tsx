import { View, StyleSheet, Text } from 'react-native';

interface EventLogProps {
  events: string[];
  cameraInfo: string;
}

export const EventLog = ({ events, cameraInfo }: EventLogProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.cameraInfo} numberOfLines={1}>
        📍 {cameraInfo || 'Move map to see camera position'}
      </Text>
      <View style={styles.divider} />
      {events.length === 0 ? (
        <Text style={styles.placeholder}>
          Tap or move the map to see events
        </Text>
      ) : (
        events.map((event, i) => (
          <Text
            key={`event-${i}`}
            style={[styles.event, i === 0 && styles.eventLatest]}
            numberOfLines={1}
          >
            {event}
          </Text>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0d0d1a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 2,
  },
  cameraInfo: {
    color: '#88ffcc',
    fontSize: 12,
    fontFamily: 'Courier New',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#222244',
    marginVertical: 2,
  },
  event: {
    color: '#8888aa',
    fontSize: 11,
    fontFamily: 'Courier New',
  },
  eventLatest: {
    color: '#ccddff',
  },
  placeholder: {
    color: '#444466',
    fontSize: 11,
    fontStyle: 'italic',
  },
});
