import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

interface ProRestrictionProps {
  feature: string;
  children?: React.ReactNode;
}

export function ProRestriction({ feature, children }: ProRestrictionProps) {
  const translations = {
    en: {
      proFeature: 'Pro Feature',
      upgradeRequired: 'Upgrade to Pro Required',
      description: 'This feature is available for Pro users only. Upgrade to Pro to unlock all premium features.',
      upgradeNow: 'Upgrade to Pro',
      learnMore: 'Learn More',
      features: {
        export: 'Data Export',
        sharing: 'Account Sharing',
        advancedReports: 'Advanced Reports',
        unlimitedTransactions: 'Unlimited Transactions',
        prioritySupport: 'Priority Support'
      }
    },
    es: {
      proFeature: 'Función Pro',
      upgradeRequired: 'Actualización a Pro Requerida',
      description: 'Esta función está disponible solo para usuarios Pro. Actualiza a Pro para desbloquear todas las funciones premium.',
      upgradeNow: 'Actualizar a Pro',
      learnMore: 'Saber Más',
      features: {
        export: 'Exportación de Datos',
        sharing: 'Compartir Cuenta',
        advancedReports: 'Reportes Avanzados',
        unlimitedTransactions: 'Transacciones Ilimitadas',
        prioritySupport: 'Soporte Prioritario'
      }
    }
  };

  const t = translations.en; // Default to English for now

  const handleUpgrade = () => {
    Alert.alert(
      t.upgradeNow,
      'Visit the pricing page to upgrade to Pro',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go to Pricing', onPress: () => {
          // Navigate to pricing or show upgrade modal
          Alert.alert('Info', 'Pricing page will be available soon');
        }}
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Pro Badge */}
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>💎 {t.proFeature}</Text>
        </View>

        {/* Feature Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>
            {feature === 'export' && '📊'}
            {feature === 'sharing' && '👥'}
            {feature === 'advancedReports' && '📈'}
            {feature === 'unlimitedTransactions' && '💰'}
            {feature === 'prioritySupport' && '🎧'}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{t.upgradeRequired}</Text>

        {/* Description */}
        <Text style={styles.description}>{t.description}</Text>

        {/* Feature Name */}
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>
            {t.features[feature as keyof typeof t.features]}
          </Text>
          <Text style={styles.featureDescription}>
            {feature === 'export' && 'Export your data in PDF, Excel, and JSON formats'}
            {feature === 'sharing' && 'Share your account with family and business partners'}
            {feature === 'advancedReports' && 'Detailed reports and advanced analytics'}
            {feature === 'unlimitedTransactions' && 'No limit on the number of transactions'}
            {feature === 'prioritySupport' && 'Priority technical support and fast response'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
            <Text style={styles.upgradeButtonText}>{t.upgradeNow}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.learnButton}>
            <Text style={styles.learnButtonText}>{t.learnMore}</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Try Pro free for 7 days</Text>
        </View>

        {/* Custom Content */}
        {children && (
          <View style={styles.customContent}>
            {children}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  proBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  proBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  upgradeButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  learnButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  learnButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    width: '100%',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  customContent: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    width: '100%',
  },
});
