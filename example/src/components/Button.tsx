import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const Button = ({
  title,
  onPress,
  boldText = false,
}: {
  title: string;
  onPress: () => void;
  boldText?: boolean;
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Text style={[styles.buttonText, boldText && styles.buttonTextPlusMinus]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    width: 50,
    height: 50,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextPlusMinus: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonText: {
    fontSize: 16,
  },
});
