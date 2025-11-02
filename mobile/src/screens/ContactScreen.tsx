import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function ContactScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general' as 'general' | 'bug' | 'feature' | 'billing' | 'technical',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');

  const translations = {
    en: {
      title: 'Contact Us',
      subtitle: 'We\'d love to hear from you',
      name: 'Full Name',
      email: 'Email Address',
      subject: 'Subject',
      message: 'Message',
      type: 'Inquiry Type',
      submit: 'Send Message',
      submitting: 'Sending...',
      success: 'Message sent successfully!',
      error: 'Failed to send message',
      general: 'General Inquiry',
      bug: 'Bug Report',
      feature: 'Feature Request',
      billing: 'Billing Support',
      technical: 'Technical Support',
      contactInfo: 'Contact Information',
      emailUs: 'Email Us',
      emailAddress: 'support@expensetrackerpro.com',
      responseTime: 'Response Time',
      responseTimeValue: 'Within 24 hours',
      supportHours: 'Support Hours',
      supportHoursValue: 'Mon-Fri, 9AM-6PM EST',
      faq: 'Frequently Asked Questions',
      faq1: 'How do I reset my password?',
      faq1Answer: 'Click "Forgot Password" on login page',
      faq2: 'Can I export my data?',
      faq2Answer: 'Yes! Go to Reports section',
      faq3: 'How do I upgrade to Pro?',
      faq3Answer: 'Visit Pricing page and click "Upgrade"',
      sendEmail: 'Send Email',
      required: 'Required',
    },
    es: {
      title: 'Contáctanos',
      subtitle: 'Nos encantaría saber de ti',
      name: 'Nombre Completo',
      email: 'Correo Electrónico',
      subject: 'Asunto',
      message: 'Mensaje',
      type: 'Tipo de Consulta',
      submit: 'Enviar Mensaje',
      submitting: 'Enviando...',
      success: '¡Mensaje enviado exitosamente!',
      error: 'Error al enviar mensaje',
      general: 'Consulta General',
      bug: 'Reporte de Error',
      feature: 'Solicitud de Función',
      billing: 'Soporte de Facturación',
      technical: 'Soporte Técnico',
      contactInfo: 'Información de Contacto',
      emailUs: 'Escríbenos',
      emailAddress: 'support@expensetrackerpro.com',
      responseTime: 'Tiempo de Respuesta',
      responseTimeValue: 'Dentro de 24 horas',
      supportHours: 'Horario de Soporte',
      supportHoursValue: 'Lun-Vie, 9AM-6PM EST',
      faq: 'Preguntas Frecuentes',
      faq1: '¿Cómo restablezco mi contraseña?',
      faq1Answer: 'Haz clic en "Olvidé mi contraseña"',
      faq2: '¿Puedo exportar mis datos?',
      faq2Answer: '¡Sí! Ve a la sección Reportes',
      faq3: '¿Cómo actualizo a Pro?',
      faq3Answer: 'Ve a Precios y haz clic en "Actualizar"',
      sendEmail: 'Enviar Correo',
      required: 'Requerido',
    },
  };

  const t = translations[language];

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      Alert.alert('Error', `${t.required} fields missing`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert('Success', t.success);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'general',
      });
    } catch (error) {
      Alert.alert('Error', t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailPress = () => {
    const emailUrl = `mailto:${t.emailAddress}?subject=Support Request&body=Hello, I need help with...`;
    Linking.openURL(emailUrl).catch(() => {
      Alert.alert('Error', 'Could not open email client');
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>

        {/* Language Toggle */}
        <View style={styles.languageToggle}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === 'en' && styles.languageButtonActive,
            ]}
            onPress={() => setLanguage('en')}
          >
            <Text
              style={[
                styles.languageButtonText,
                language === 'en' && styles.languageButtonTextActive,
              ]}
            >
              English
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === 'es' && styles.languageButtonActive,
            ]}
            onPress={() => setLanguage('es')}
          >
            <Text
              style={[
                styles.languageButtonText,
                language === 'es' && styles.languageButtonTextActive,
              ]}
            >
              Español
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact Form */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Send us a message</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {t.name} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="John Doe"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {t.email} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {t.type} <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.typeButtons}>
              {[
                { value: 'general', label: t.general },
                { value: 'bug', label: t.bug },
                { value: 'feature', label: t.feature },
                { value: 'billing', label: t.billing },
                { value: 'technical', label: t.technical },
              ].map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    formData.type === type.value && styles.typeButtonActive,
                  ]}
                  onPress={() => handleInputChange('type', type.value)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.type === type.value && styles.typeButtonTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {t.subject} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.subject}
              onChangeText={(text) => handleInputChange('subject', text)}
              placeholder="Brief description of your inquiry"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {t.message} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.message}
              onChangeText={(text) => handleInputChange('message', text)}
              placeholder="Please provide details about your inquiry..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? t.submitting : t.submit}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contact Information */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t.contactInfo}</Text>

          <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
            <View style={styles.contactIcon}>
              <Text style={styles.contactIconText}>📧</Text>
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>{t.emailUs}</Text>
              <Text style={styles.contactValue}>{t.emailAddress}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Text style={styles.contactIconText}>⏰</Text>
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>{t.responseTime}</Text>
              <Text style={styles.contactValue}>{t.responseTimeValue}</Text>
            </View>
          </View>

          <View style={styles.contactItem}>
            <View style={styles.contactIcon}>
              <Text style={styles.contactIconText}>🕒</Text>
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>{t.supportHours}</Text>
              <Text style={styles.contactValue}>{t.supportHoursValue}</Text>
            </View>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqCard}>
          <Text style={styles.cardTitle}>{t.faq}</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{t.faq1}</Text>
            <Text style={styles.faqAnswer}>{t.faq1Answer}</Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{t.faq2}</Text>
            <Text style={styles.faqAnswer}>{t.faq2Answer}</Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>{t.faq3}</Text>
            <Text style={styles.faqAnswer}>{t.faq3Answer}</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  languageToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 12,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  languageButtonActive: {
    backgroundColor: '#3b82f6',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  languageButtonTextActive: {
    color: '#ffffff',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1f2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  typeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactIconText: {
    fontSize: 20,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  faqCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
