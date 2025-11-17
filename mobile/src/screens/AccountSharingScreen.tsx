import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { createClient } from '../lib/supabase';

type SharingStatus = 'active' | 'pending' | 'revoked';
type SharingPermission = 'read_only' | 'read_write';

interface AccountSharingRelationship {
  id: string;
  primary_user_id: string;
  shared_user_id: string | null;
  sharing_code: string;
  permissions: SharingPermission;
  status: SharingStatus;
  created_at: string;
}

export default function AccountSharingScreen() {
  const [relationships, setRelationships] = useState<AccountSharingRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [joining, setJoining] = useState(false);
  const [sharingCode, setSharingCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadRelationships();
  }, []);

  const loadRelationships = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    try {
      const { data: relationshipsData, error } = await supabase
        .from('account_sharing')
        .select('*')
        .or(`primary_user_id.eq.${user.id},shared_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading shared accounts:', error);
        setError('Failed to load shared accounts.');
        setRelationships([]);
        return;
      }

      setRelationships(relationshipsData || []);
      setError('');
    } catch (error: any) {
      console.error('Unexpected error loading shared accounts:', error);
      setError('Failed to load shared accounts.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRelationships();
    setRefreshing(false);
  };

  const generateSharingCode = async () => {
    setGeneratingCode(true);
    setError('');
    setSuccess('');

    try {
      if (!currentUserId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.rpc('generate_sharing_code');

      if (error || !data) {
        throw error || new Error('Failed to generate sharing code');
      }

      const code = (data as string).toUpperCase();

      const { error: insertError } = await supabase
        .from('account_sharing')
        .insert({
          primary_user_id: currentUserId,
          sharing_code: code,
          permissions: 'read_write',
          status: 'pending',
        });

      if (insertError) {
        throw insertError;
      }

      setSharingCode(code);
      setSuccess('Sharing code generated successfully!');
      await loadRelationships();
    } catch (error: any) {
      console.error('Error generating sharing code:', error);
      setError(error.message || 'Failed to generate sharing code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const joinWithCode = async () => {
    if (!joinCode.trim()) {
      setError('Please enter a sharing code');
      return;
    }

    setJoining(true);
    setError('');
    setSuccess('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Find the sharing relationship by code
      const { data: sharingData, error: findError } = await supabase
        .from('account_sharing')
        .select('*')
        .eq('sharing_code', joinCode.trim().toUpperCase())
        .eq('status', 'pending')
        .single();

      if (findError || !sharingData) {
        throw new Error('Invalid sharing code');
      }

      // Check if user is already part of this relationship
      if (sharingData.primary_user_id === user.id) {
        throw new Error('You cannot join your own sharing code');
      }

      if (sharingData.shared_user_id === user.id) {
        throw new Error('You are already part of this shared account');
      }

      // Update the relationship to include the current user
      const { error: updateError } = await supabase
        .from('account_sharing')
        .update({ shared_user_id: user.id, status: 'active' })
        .eq('id', sharingData.id);

      if (updateError) throw updateError;

      setSuccess('Successfully joined the shared account!');
      setJoinCode('');
      await loadRelationships();
    } catch (error: any) {
      setError(error.message || 'Failed to join account');
    } finally {
      setJoining(false);
    }
  };

  const revokeAccess = async (relationshipId: string) => {
    Alert.alert(
      'Revoke Access',
      'Are you sure you want to revoke access to this shared account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('account_sharing')
                .update({ status: 'revoked' })
                .eq('id', relationshipId);

              if (error) throw error;

              setSuccess('Access revoked successfully!');
              await loadRelationships();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to revoke access');
            }
          },
        },
      ]
    );
  };

  const copyToClipboard = (text: string) => {
    // In a real app, you would use Clipboard API
    Alert.alert('Copied', 'Sharing code copied to clipboard');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Account Sharing</Text>
          <Text style={styles.subtitle}>Share your account with family or partners</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        {...(Platform.OS === 'web'
          ? {}
          : {
              refreshControl: (
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              ),
            })}
      >
        <View style={styles.contentInner}>
          {error ? (
            <View style={styles.messageContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          {success ? (
            <View style={styles.messageContainer}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Share Your Account</Text>
            <Text style={styles.cardDescription}>Generate a code to share your account with others</Text>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={generateSharingCode}
              disabled={generatingCode}
            >
              <Text style={styles.primaryButtonText}>
                {generatingCode ? 'Generating...' : 'Generate Sharing Code'}
              </Text>
            </TouchableOpacity>
            {sharingCode ? (
              <View style={styles.codeContainer}>
                <Text style={styles.codeLabel}>Your Sharing Code:</Text>
                <View style={styles.codeDisplay}>
                  <Text style={styles.codeText}>{sharingCode}</Text>
                  <TouchableOpacity style={styles.copyButton} onPress={() => copyToClipboard(sharingCode)}>
                    <Text style={styles.copyButtonText}>Copy</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.codeInstructions}>
                  Share this code with the person you want to give access to your account
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Join Shared Account</Text>
            <Text style={styles.cardDescription}>Enter a sharing code to join someone else's account</Text>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                value={joinCode}
                onChangeText={setJoinCode}
                placeholder="Enter sharing code"
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={joinWithCode}
              disabled={joining}
            >
              <Text style={styles.secondaryButtonText}>
                {joining ? 'Joining...' : 'Join Account'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Shared Accounts</Text>
            {relationships.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No shared accounts yet</Text>
                <Text style={styles.emptySubtext}>
                  Generate a code to share your account or join someone else's
                </Text>
              </View>
            ) : (
              relationships.map((relationship) => {
                const isOwner = relationship.primary_user_id === currentUserId;
                const isSharedUser = relationship.shared_user_id === currentUserId;

                let title = '';
                let subtitle = '';

                if (isOwner) {
                  title = relationship.shared_user_id
                    ? `Shared with user ${relationship.shared_user_id.slice(0, 8)}...`
                    : 'Waiting for someone to join';
                  subtitle = 'You are the owner';
                } else if (isSharedUser) {
                  title = 'Shared with you';
                  subtitle = `Owner: ${relationship.primary_user_id.slice(0, 8)}...`;
                } else {
                  title = 'Shared account';
                  subtitle = 'Pending membership';
                }

                const statusLabel = relationship.status
                  ? relationship.status.charAt(0).toUpperCase() + relationship.status.slice(1)
                  : 'Unknown';
                const permissionsLabel = relationship.permissions === 'read_only' ? 'Read Only' : 'Read & Write';

                return (
                  <View key={relationship.id} style={styles.relationshipCard}>
                    <View style={styles.relationshipHeader}>
                      <View>
                        <Text style={styles.relationshipTitle}>{title}</Text>
                        <Text style={styles.relationshipSubtitle}>{subtitle}</Text>
                      </View>
                      {isOwner && relationship.status === 'active' ? (
                        <TouchableOpacity style={styles.revokeButton} onPress={() => revokeAccess(relationship.id)}>
                          <Text style={styles.revokeButtonText}>Revoke</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                    <View style={styles.relationshipMetaRow}>
                      <Text style={styles.relationshipMetaLabel}>Status</Text>
                      <Text style={styles.relationshipMetaValue}>{statusLabel}</Text>
                    </View>
                    <View style={styles.relationshipMetaRow}>
                      <Text style={styles.relationshipMetaLabel}>Permissions</Text>
                      <Text style={styles.relationshipMetaValue}>{permissionsLabel}</Text>
                    </View>
                    <View style={styles.relationshipMetaRow}>
                      <Text style={styles.relationshipMetaLabel}>Code</Text>
                      <Text style={styles.relationshipMetaValue}>{relationship.sharing_code}</Text>
                    </View>
                    <View style={styles.relationshipMetaRow}>
                      <Text style={styles.relationshipMetaLabel}>Created</Text>
                      <Text style={styles.relationshipMetaValue}>
                        {new Date(relationship.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <View style={styles.proNotice}>
            <Text style={styles.proNoticeTitle}>Pro Feature</Text>
            <Text style={styles.proNoticeText}>
              Account sharing is available for Pro users only. Upgrade to Pro to share your account with family members or business partners.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  contentInner: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingLeft: 70,
    paddingVertical: 16,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  messageContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
  successText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  codeContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
  },
  codeLabel: {
    fontSize: 13,
    color: '#1d4ed8',
    marginBottom: 8,
  },
  codeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  copyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  codeInstructions: {
    marginTop: 12,
    fontSize: 13,
    color: '#6b7280',
  },
  inputGroup: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
  },
  secondaryButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  relationshipCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  relationshipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  relationshipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  relationshipSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
  },
  relationshipRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  relationshipMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  relationshipMetaLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  relationshipMetaValue: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
  },
  revokeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
  },
  revokeButtonText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6b7280',
  },
  proNotice: {
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    padding: 20,
  },
  proNoticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d4ed8',
    marginBottom: 8,
  },
  proNoticeText: {
    fontSize: 13,
    color: '#1f2937',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
