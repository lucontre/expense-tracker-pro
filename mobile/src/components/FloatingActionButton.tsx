import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  size?: number;
  style?: ViewStyle;
}

export function FloatingActionButton({ 
  onPress, 
  icon = '+',
  size = 60,
  style 
}: FloatingActionButtonProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primary,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text 
        style={[
          styles.fabIcon, 
          { 
            fontSize: size * 0.5,
            lineHeight: size * 0.5,
            includeFontPadding: false,
            textAlignVertical: 'center',
          }
        ]}
      >
        {icon}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 9999,
    pointerEvents: 'auto',
  },
  fabIcon: {
    color: '#ffffff',
    fontWeight: '300',
    textAlign: 'center',
    includeFontPadding: false,
  },
});

