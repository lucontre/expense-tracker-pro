import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { createClient } from '../lib/supabase';

interface AvatarProps {
  user: any;
  size?: number;
  onAvatarChange?: (avatarUrl: string) => void;
}

export function Avatar({ user, size = 80, onAvatarChange }: AvatarProps) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const uploadAvatar = async (imageUri: string) => {
    try {
      setUploading(true);

      // Resize and compress image
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 300, height: 300 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Convert to blob
      const response = await fetch(manipulatedImage.uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const fileExt = manipulatedImage.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      if (onAvatarChange) {
        onAvatarChange(publicUrl);
      }

      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', error.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a profile photo',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Camera',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Required', 'Camera permission is required to take photos');
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              await uploadAvatar(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Photo Library',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Required', 'Photo library permission is required');
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              await uploadAvatar(result.assets[0].uri);
            }
          },
        },
      ]
    );
  };

  const removeAvatar = async () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('users')
                .update({ avatar_url: null })
                .eq('id', user.id);

              if (error) throw error;

              if (onAvatarChange) {
                onAvatarChange('');
              }

              Alert.alert('Success', 'Profile photo removed successfully!');
            } catch (error: any) {
              Alert.alert('Error', 'Failed to remove photo');
            }
          },
        },
      ]
    );
  };

  const getInitials = () => {
    if (user?.full_name) {
      return user.full_name
        .split(' ')
        .map((name: string) => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.avatarContainer, { width: size, height: size }]}
        onPress={pickImage}
        disabled={uploading}
      >
        {user?.avatar_url ? (
          <Image
            source={{ uri: user.avatar_url }}
            style={[styles.avatarImage, { width: size, height: size }]}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.avatarPlaceholder, { width: size, height: size }]}>
            <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>
              {getInitials()}
            </Text>
          </View>
        )}
        
        {uploading && (
          <View style={[styles.uploadingOverlay, { width: size, height: size }]}>
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.avatarActions}>
        <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
          <Text style={styles.actionButtonText}>
            {user?.avatar_url ? 'Change Photo' : 'Add Photo'}
          </Text>
        </TouchableOpacity>
        
        {user?.avatar_url && (
          <TouchableOpacity style={styles.removeButton} onPress={removeAvatar}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarContainer: {
    borderRadius: 50,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  avatarImage: {
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: '#3b82f6',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  uploadingOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  avatarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});
