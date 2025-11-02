import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Transaction, Budget, SavingsGoal, Category } from '@expense-tracker-pro/shared';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ExportData {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  categories: Category[];
  user: any;
  period: {
    start: string;
    end: string;
  };
}

export class DataExporter {
  private formatCurrency = (amount: number, currency: string = 'USD'): string => {
    const symbols = {
      USD: '$',
      MXN: '$',
      GTQ: 'Q',
      EUR: '€'
    };
    return `${symbols[currency as keyof typeof symbols] || '$'}${amount.toFixed(2)}`;
  };

  private formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  // PDF Export
  async exportToPDF(data: ExportData, language: 'en' | 'es' = 'en'): Promise<void> {
    const doc = new jsPDF();
    const translations = this.getTranslations(language);

    // Header
    doc.setFontSize(20);
    doc.text(translations.title, 20, 20);
    
    doc.setFontSize(12);
    doc.text(`${translations.period}: ${this.formatDate(data.period.start)} - ${this.formatDate(data.period.end)}`, 20, 30);
    doc.text(`${translations.generated}: ${new Date().toLocaleDateString()}`, 20, 35);

    // Summary Statistics
    const totalIncome = data.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = data.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    doc.setFontSize(16);
    doc.text(translations.summary, 20, 50);

    doc.setFontSize(12);
    doc.text(`${translations.totalIncome}: ${this.formatCurrency(totalIncome)}`, 20, 60);
    doc.text(`${translations.totalExpenses}: ${this.formatCurrency(totalExpenses)}`, 20, 65);
    doc.text(`${translations.balance}: ${this.formatCurrency(totalIncome - totalExpenses)}`, 20, 70);

    // Transactions Table
    if (data.transactions.length > 0) {
      doc.setFontSize(16);
      doc.text(translations.transactions, 20, 85);

      const transactionsData = data.transactions.map(t => {
        const category = data.categories.find(c => c.id === t.category_id);
        return [
          this.formatDate(t.date),
          t.description,
          category?.name || 'Unknown',
          t.type === 'income' ? translations.income : translations.expense,
          this.formatCurrency(t.amount)
        ];
      });

      doc.autoTable({
        head: [[translations.date, translations.description, translations.category, translations.type, translations.amount]],
        body: transactionsData,
        startY: 90,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246] }
      });
    }

    // Budgets Table
    if (data.budgets.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || 120;
      doc.setFontSize(16);
      doc.text(translations.budgets, 20, finalY + 10);

      const budgetsData = data.budgets.map(b => [
        b.category,
        this.formatCurrency(b.amount),
        b.period,
        this.formatDate(b.startDate),
        this.formatDate(b.endDate)
      ]);

      doc.autoTable({
        head: [[translations.category, translations.amount, translations.period, 'Start Date', 'End Date']],
        body: budgetsData,
        startY: finalY + 15,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [16, 185, 129] }
      });
    }

    // Savings Goals Table
    if (data.savingsGoals.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || 120;
      doc.setFontSize(16);
      doc.text(translations.savingsGoals, 20, finalY + 10);

      const savingsData = data.savingsGoals.map(s => [
        s.name,
        this.formatCurrency(s.targetAmount),
        this.formatCurrency(s.currentAmount),
        `${((s.currentAmount / s.targetAmount) * 100).toFixed(1)}%`,
        s.targetDate ? this.formatDate(s.targetDate) : 'N/A'
      ]);

      doc.autoTable({
        head: [[translations.goalName, translations.target, translations.current, translations.progress, translations.targetDate]],
        body: savingsData,
        startY: finalY + 15,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [139, 92, 246] }
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Expense Tracker Pro - ${translations.page} ${i} ${translations.of} ${pageCount}`, 20, doc.internal.pageSize.height - 10);
    }

    doc.save(`financial-report-${data.period.start}-${data.period.end}.pdf`);
  }

  // Excel Export
  async exportToExcel(data: ExportData, language: 'en' | 'es' = 'en'): Promise<void> {
    const translations = this.getTranslations(language);
    const workbook = XLSX.utils.book_new();

    // Transactions Sheet
    if (data.transactions.length > 0) {
      const transactionsData = data.transactions.map(t => {
        const category = data.categories.find(c => c.id === t.category_id);
        return {
          [translations.date]: this.formatDate(t.date),
          [translations.description]: t.description,
          [translations.category]: category?.name || 'Unknown',
          [translations.type]: t.type === 'income' ? translations.income : translations.expense,
          [translations.amount]: t.amount,
          [translations.currency]: (t as any).currency || 'USD'
        };
      });

      const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
      XLSX.utils.book_append_sheet(workbook, transactionsSheet, translations.transactions);
    }

    // Budgets Sheet
    if (data.budgets.length > 0) {
      const budgetsData = data.budgets.map(b => ({
        [translations.category]: b.category,
        [translations.amount]: b.amount,
        [translations.period]: b.period,
        'Start Date': this.formatDate(b.startDate),
        'End Date': this.formatDate(b.endDate)
      }));

      const budgetsSheet = XLSX.utils.json_to_sheet(budgetsData);
      XLSX.utils.book_append_sheet(workbook, budgetsSheet, translations.budgets);
    }

    // Savings Goals Sheet
    if (data.savingsGoals.length > 0) {
      const savingsData = data.savingsGoals.map(s => ({
        [translations.goalName]: s.name,
        [translations.target]: s.targetAmount,
        [translations.current]: s.currentAmount,
        [translations.progress]: `${((s.currentAmount / s.targetAmount) * 100).toFixed(1)}%`,
        [translations.targetDate]: s.targetDate ? this.formatDate(s.targetDate) : 'N/A',
        [translations.description]: s.description || ''
      }));

      const savingsSheet = XLSX.utils.json_to_sheet(savingsData);
      XLSX.utils.book_append_sheet(workbook, savingsSheet, translations.savingsGoals);
    }

    // Summary Sheet
    const totalIncome = data.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = data.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const summaryData = [
      { [translations.metric]: translations.totalIncome, [translations.value]: totalIncome },
      { [translations.metric]: translations.totalExpenses, [translations.value]: totalExpenses },
      { [translations.metric]: translations.balance, [translations.value]: totalIncome - totalExpenses },
      { [translations.metric]: translations.totalTransactions, [translations.value]: data.transactions.length },
      { [translations.metric]: translations.totalBudgets, [translations.value]: data.budgets.length },
      { [translations.metric]: translations.totalSavingsGoals, [translations.value]: data.savingsGoals.length }
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, translations.summary);

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `financial-data-${data.period.start}-${data.period.end}.xlsx`);
  }

  // JSON Export
  async exportToJSON(data: ExportData): Promise<void> {
    const exportData = {
      metadata: {
        version: '1.0',
        exportDate: new Date().toISOString(),
        period: data.period,
        user: {
          email: data.user.email,
          fullName: data.user.fullName
        }
      },
      data: {
        transactions: data.transactions,
        budgets: data.budgets,
        savingsGoals: data.savingsGoals,
        categories: data.categories
      }
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, `expense-tracker-backup-${data.period.start}-${data.period.end}.json`);
  }

  private getTranslations(language: 'en' | 'es') {
    return language === 'es' ? {
      title: 'Reporte Financiero',
      period: 'Período',
      generated: 'Generado',
      summary: 'Resumen',
      totalIncome: 'Ingresos Totales',
      totalExpenses: 'Gastos Totales',
      balance: 'Balance',
      transactions: 'Transacciones',
      budgets: 'Presupuestos',
      savingsGoals: 'Metas de Ahorro',
      date: 'Fecha',
      description: 'Descripción',
      category: 'Categoría',
      type: 'Tipo',
      amount: 'Monto',
      income: 'Ingreso',
      expense: 'Gasto',
      budgetName: 'Nombre del Presupuesto',
      limit: 'Límite',
      spent: 'Gastado',
      remaining: 'Restante',
      goalName: 'Nombre de la Meta',
      target: 'Objetivo',
      current: 'Actual',
      progress: 'Progreso',
      targetDate: 'Fecha Objetivo',
      metric: 'Métrica',
      value: 'Valor',
      totalTransactions: 'Total de Transacciones',
      totalBudgets: 'Total de Presupuestos',
      totalSavingsGoals: 'Total de Metas de Ahorro',
      page: 'Página',
      of: 'de',
      currency: 'Moneda'
    } : {
      title: 'Financial Report',
      period: 'Period',
      generated: 'Generated',
      summary: 'Summary',
      totalIncome: 'Total Income',
      totalExpenses: 'Total Expenses',
      balance: 'Balance',
      transactions: 'Transactions',
      budgets: 'Budgets',
      savingsGoals: 'Savings Goals',
      date: 'Date',
      description: 'Description',
      category: 'Category',
      type: 'Type',
      amount: 'Amount',
      income: 'Income',
      expense: 'Expense',
      budgetName: 'Budget Name',
      limit: 'Limit',
      spent: 'Spent',
      remaining: 'Remaining',
      goalName: 'Goal Name',
      target: 'Target',
      current: 'Current',
      progress: 'Progress',
      targetDate: 'Target Date',
      metric: 'Metric',
      value: 'Value',
      totalTransactions: 'Total Transactions',
      totalBudgets: 'Total Budgets',
      totalSavingsGoals: 'Total Savings Goals',
      page: 'Page',
      of: 'of',
      currency: 'Currency'
    };
  }
}
