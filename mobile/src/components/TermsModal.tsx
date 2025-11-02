import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';

interface TermsModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
  language?: 'en' | 'es';
}

export function TermsModal({ visible, onAccept, onDecline, language = 'en' }: TermsModalProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canAccept, setCanAccept] = useState(false);

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollPercent = contentOffset.y / (contentSize.height - layoutMeasurement.height);
    setScrollPosition(scrollPercent);
    
    // Enable accept button when user scrolls to 80% of content
    if (scrollPercent >= 0.8) {
      setCanAccept(true);
    }
  };

  const handleAccept = () => {
    if (canAccept) {
      onAccept();
    } else {
      Alert.alert(
        language === 'es' ? 'Términos y Condiciones' : 'Terms and Conditions',
        language === 'es' 
          ? 'Por favor, lee completamente los términos y condiciones antes de aceptar.'
          : 'Please read the complete terms and conditions before accepting.'
      );
    }
  };

  const termsContent = {
    en: {
      title: 'Terms and Conditions',
      subtitle: 'Please read and accept our terms to continue',
      content: `
Welcome to Expense Tracker Pro. By using our service, you agree to the following terms:

1. SERVICE DESCRIPTION
Expense Tracker Pro is a personal finance management application that helps you track your income, expenses, budgets, and savings goals.

2. USER ACCOUNT
- You are responsible for maintaining the confidentiality of your account
- You must provide accurate and complete information
- You are responsible for all activities under your account

3. DATA PRIVACY
- We collect and store your financial data securely
- Your data is encrypted and protected
- We do not share your personal information with third parties
- You can delete your account and data at any time

4. ACCEPTABLE USE
- Use the service only for lawful purposes
- Do not attempt to hack or compromise the system
- Do not share your account with others
- Respect other users' privacy

5. PAYMENT TERMS
- Free plan includes basic features
- Pro plan requires subscription payment
- Payments are processed securely through Stripe
- You can cancel your subscription at any time

6. LIMITATION OF LIABILITY
- We provide the service "as is"
- We are not liable for any financial losses
- We do not provide financial advice
- Use the service at your own risk

7. TERMINATION
- We may terminate your account for violations
- You may terminate your account at any time
- Upon termination, your data will be deleted

8. CHANGES TO TERMS
- We may update these terms from time to time
- Continued use constitutes acceptance of changes
- We will notify you of significant changes

By accepting these terms, you acknowledge that you have read, understood, and agree to be bound by them.
      `,
      accept: 'I Accept',
      decline: 'Decline',
      readMore: 'Please scroll to read the complete terms',
    },
    es: {
      title: 'Términos y Condiciones',
      subtitle: 'Por favor lee y acepta nuestros términos para continuar',
      content: `
Bienvenido a Expense Tracker Pro. Al usar nuestro servicio, aceptas los siguientes términos:

1. DESCRIPCIÓN DEL SERVICIO
Expense Tracker Pro es una aplicación de gestión financiera personal que te ayuda a rastrear tus ingresos, gastos, presupuestos y metas de ahorro.

2. CUENTA DE USUARIO
- Eres responsable de mantener la confidencialidad de tu cuenta
- Debes proporcionar información precisa y completa
- Eres responsable de todas las actividades bajo tu cuenta

3. PRIVACIDAD DE DATOS
- Recopilamos y almacenamos tus datos financieros de forma segura
- Tus datos están encriptados y protegidos
- No compartimos tu información personal con terceros
- Puedes eliminar tu cuenta y datos en cualquier momento

4. USO ACEPTABLE
- Usa el servicio solo para propósitos legales
- No intentes hackear o comprometer el sistema
- No compartas tu cuenta con otros
- Respeta la privacidad de otros usuarios

5. TÉRMINOS DE PAGO
- El plan gratuito incluye funciones básicas
- El plan Pro requiere pago de suscripción
- Los pagos se procesan de forma segura a través de Stripe
- Puedes cancelar tu suscripción en cualquier momento

6. LIMITACIÓN DE RESPONSABILIDAD
- Proporcionamos el servicio "tal como está"
- No somos responsables de pérdidas financieras
- No proporcionamos consejos financieros
- Usa el servicio bajo tu propio riesgo

7. TERMINACIÓN
- Podemos terminar tu cuenta por violaciones
- Puedes terminar tu cuenta en cualquier momento
- Al terminar, tus datos serán eliminados

8. CAMBIOS A LOS TÉRMINOS
- Podemos actualizar estos términos de vez en cuando
- El uso continuado constituye aceptación de cambios
- Te notificaremos de cambios significativos

Al aceptar estos términos, reconoces que has leído, entendido y aceptas estar sujeto a ellos.
      `,
      accept: 'Acepto',
      decline: 'Rechazar',
      readMore: 'Por favor desplázate para leer los términos completos',
    },
  };

  const t = termsContent[language];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator
        >
          <Text style={styles.content}>{t.content}</Text>
          
          {!canAccept && (
            <View style={styles.scrollPrompt}>
              <Text style={styles.scrollPromptText}>{t.readMore}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.declineButton]}
            onPress={onDecline}
          >
            <Text style={styles.declineButtonText}>{t.decline}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.button,
              styles.acceptButton,
              !canAccept && styles.disabledButton,
            ]}
            onPress={handleAccept}
            disabled={!canAccept}
          >
            <Text style={[
              styles.acceptButtonText,
              !canAccept && styles.disabledButtonText,
            ]}>
              {t.accept}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(scrollPosition * 100, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(Math.min(scrollPosition * 100, 100))}% {language === 'es' ? 'leído' : 'read'}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  content: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 20,
  },
  scrollPrompt: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  scrollPromptText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#f3f4f6',
  },
  declineButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  acceptButton: {
    backgroundColor: '#3b82f6',
  },
  acceptButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
