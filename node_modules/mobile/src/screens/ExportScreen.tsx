import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { createClient } from '../lib/supabase';
import { ProRestriction } from '../components/ProRestriction';
import { useRoute } from '@react-navigation/native';

export default function ExportScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'pdf' | 'excel' | 'json'>('pdf');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const supabase = createClient();
  const route = useRoute<any>();

  const translations = {
    en: {
      title: 'Export Data',
      subtitle: 'Download your financial data',
      proFeature: 'Pro Feature',
      upgradeRequired: 'This feature is available for Pro users only',
      upgradeNow: 'Upgrade to Pro',
      dateRange: 'Date Range',
      startDate: 'Start Date',
      endDate: 'End Date',
      exportFormat: 'Export Format',
      pdfReport: 'PDF Report',
      pdfDescription: 'Professional report with charts',
      excelData: 'Excel Spreadsheet',
      excelDescription: 'Raw data in spreadsheet format',
      jsonBackup: 'JSON Backup',
      jsonDescription: 'Complete data backup',
      exportData: 'Export Data',
      exporting: 'Exporting...',
      dataSummary: 'Data Summary',
      totalTransactions: 'Transactions',
      totalBudgets: 'Budgets',
      totalSavingsGoals: 'Savings Goals',
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      balance: 'Balance',
      noData: 'No data found for selected period',
      selectPeriod: 'Select date range to export',
      exportHint: 'Exports are generated as downloadable files you can share or store.',
      comingSoon: 'Coming soon',
      mobileExport: 'Mobile exports are under development.',
      webExport: 'Open Web Export',
    },
    es: {
      title: 'Exportar Datos',
      subtitle: 'Descarga tus datos financieros',
      proFeature: 'Función Pro',
      upgradeRequired: 'Esta función está disponible solo para usuarios Pro',
      upgradeNow: 'Actualizar a Pro',
      dateRange: 'Rango de Fechas',
      startDate: 'Fecha de Inicio',
      endDate: 'Fecha de Fin',
      exportFormat: 'Formato de Exportación',
      pdfReport: 'Reporte PDF',
      pdfDescription: 'Reporte profesional con gráficos',
      excelData: 'Hoja de Cálculo Excel',
      excelDescription: 'Datos sin procesar en formato de hoja',
      jsonBackup: 'Respaldo JSON',
      jsonDescription: 'Respaldo completo de datos',
      exportData: 'Exportar Datos',
      exporting: 'Exportando...',
      dataSummary: 'Resumen de Datos',
      totalTransactions: 'Transacciones',
      totalBudgets: 'Presupuestos',
      totalSavingsGoals: 'Metas de Ahorro',
      totalIncome: 'Total de Ingresos',
      totalExpenses: 'Total de Gastos',
      balance: 'Balance',
      noData: 'No se encontraron datos para el período seleccionado',
      selectPeriod: 'Selecciona rango de fechas para exportar',
      exportHint: 'Los archivos se generan para que puedas descargarlos o compartirlos.',
      comingSoon: 'Próximamente',
      mobileExport: 'Las exportaciones en móvil están en desarrollo.',
      webExport: 'Abrir Exportación Web',
    }
  };

  const t = translations[language];

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (route?.params?.defaultType) {
      setExportType(route.params.defaultType);
    }
  }, [route?.params?.defaultType]);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userData?.language && (userData.language === 'en' || userData.language === 'es')) {
        setLanguage(userData.language);
      }

      setUser({
        ...user,
        ...userData
      });
    }
    setLoading(false);
  };

  const handleExport = async () => {
    setExporting(true);
    
    try {
      // For now, show coming soon message
      Alert.alert(
        t.comingSoon,
        t.mobileExport,
        [
          { text: 'OK', style: 'default' },
          { 
            text: t.webExport, 
            onPress: () => {
              // In a real app, you would open the web version
              Alert.alert('Info', 'Please visit the web version for full export functionality');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const shareData = async () => {
    try {
      const shareContent = {
        message: `Check out my financial summary from ${dateRange.start} to ${dateRange.end}`,
        title: 'Financial Summary'
      };
      
      await Share.share(shareContent);
    } catch (error) {
      Alert.alert('Error', 'Failed to share data');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Check if user is Pro
  if (!user || user.subscription_plan !== 'pro') {
    return <ProRestriction feature="export" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Export Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Export Settings</Text>

          {/* Date Range */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.dateRange}</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>{t.startDate}</Text>
                <Text style={styles.dateValue}>{dateRange.start}</Text>
              </View>
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>{t.endDate}</Text>
                <Text style={styles.dateValue}>{dateRange.end}</Text>
              </View>
            </View>
          </View>

          {/* Export Format */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.exportFormat}</Text>
            <View style={styles.formatOptions}>
              {[
                { value: 'pdf', label: t.pdfReport, description: t.pdfDescription, icon: '📄' },
                { value: 'excel', label: t.excelData, description: t.excelDescription, icon: '📊' },
                { value: 'json', label: t.jsonBackup, description: t.jsonDescription, icon: '💾' }
              ].map((format) => (
                <TouchableOpacity
                  key={format.value}
                  style={[
                    styles.formatOption,
                    exportType === format.value && styles.formatOptionActive,
                  ]}
                  onPress={() => setExportType(format.value as 'pdf' | 'excel' | 'json')}
                >
                  <View style={styles.formatHeader}>
                    <Text style={styles.formatIcon}>{format.icon}</Text>
                    <Text style={[
                      styles.formatLabel,
                      exportType === format.value && styles.formatLabelActive,
                    ]}>
                      {format.label}
                    </Text>
                  </View>
                  <Text style={styles.formatDescription}>{format.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Export Button */}
          <TouchableOpacity
            style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
            onPress={handleExport}
            disabled={exporting}
          >
            <Text style={styles.exportButtonText}>
              {exporting ? t.exporting : t.exportData}
            </Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={shareData}
          >
            <Text style={styles.shareButtonText}>📤 Share Summary</Text>
          </TouchableOpacity>
        </View>

        {/* Data Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>{t.dataSummary}</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>0</Text>
              <Text style={styles.summaryLabel}>{t.totalTransactions}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>0</Text>
              <Text style={styles.summaryLabel}>{t.totalBudgets}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>0</Text>
              <Text style={styles.summaryLabel}>{t.totalSavingsGoals}</Text>
            </View>
          </View>
          <View style={styles.summaryFooter}>
            <Text style={styles.summaryNote}>{t.exportHint}</Text>
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
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
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
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 14,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 6,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  formatOptions: {
    gap: 12,
  },
  formatOption: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  formatOptionActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  formatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  formatIcon: {
    fontSize: 20,
  },
  formatLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  formatLabelActive: {
    color: '#1d4ed8',
  },
  formatDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  exportButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  exportButtonDisabled: {
    opacity: 0.75,
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  summaryFooter: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
  },
  summaryNote: {
    fontSize: 13,
    color: '#1d4ed8',
    textAlign: 'center',
  },
});
