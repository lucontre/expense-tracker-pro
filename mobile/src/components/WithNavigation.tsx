import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NavigationMenu } from './NavigationMenu';

export function withNavigation<T extends {}>(Component: React.ComponentType<T>) {
  return function WrappedComponent(props: T) {
    return (
      <View style={styles.container}>
        <NavigationMenu />
        <View style={styles.content}>
          <Component {...props} />
        </View>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    width: '100%',
  },
});

