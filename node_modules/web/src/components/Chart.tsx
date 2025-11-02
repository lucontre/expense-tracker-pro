import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { ChartData } from '@expense-tracker-pro/shared';
import { useCurrency } from '@/hooks/useCurrency';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  data: ChartData;
  type: 'bar' | 'line' | 'doughnut';
  title?: string;
  height?: number;
  className?: string;
  showLegend?: boolean;
}

export function Chart({ data, type, title, height = 300, className = '', showLegend = true }: ChartProps) {
  const { formatCurrency } = useCurrency();
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
        labels: {
          color: '#64748b', // slate-500
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: !!title,
        text: title,
        color: '#1e293b', // slate-800
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: type !== 'doughnut' ? {
      x: {
        grid: {
          color: '#e2e8f0', // slate-200
        },
        ticks: {
          color: '#64748b', // slate-500
        },
      },
      y: {
        grid: {
          color: '#e2e8f0', // slate-200
        },
        ticks: {
          color: '#64748b', // slate-500
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
      },
    } : undefined,
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data} options={options} />;
      case 'line':
        return <Line data={data} options={options} />;
      case 'doughnut':
        return <Doughnut data={data} options={options} />;
      default:
        return <Bar data={data} options={options} />;
    }
  };

  return (
    <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
      {renderChart()}
    </div>
  );
}

// Predefined chart configurations for common use cases
export const chartConfigs = {
  // Expense by category bar chart
  expenseByCategory: (data: { category: string; amount: number }[], label: string = 'Expenses'): ChartData => ({
    labels: data.map(item => item.category),
    datasets: [
      {
        label: label,
        data: data.map(item => item.amount),
        backgroundColor: [
          '#ef4444', // red-500
          '#f97316', // orange-500
          '#eab308', // yellow-500
          '#22c55e', // green-500
          '#06b6d4', // cyan-500
          '#3b82f6', // blue-500
          '#8b5cf6', // violet-500
          '#ec4899', // pink-500
        ],
        borderColor: [
          '#dc2626', // red-600
          '#ea580c', // orange-600
          '#ca8a04', // yellow-600
          '#16a34a', // green-600
          '#0891b2', // cyan-600
          '#2563eb', // blue-600
          '#7c3aed', // violet-600
          '#db2777', // pink-600
        ],
        borderWidth: 1,
      },
    ],
  }),

  // Monthly trend line chart
  monthlyTrend: (data: { month: string; income: number; expenses: number }[], incomeLabel: string = 'Income', expensesLabel: string = 'Expenses'): ChartData => ({
    labels: data.map(item => item.month),
    datasets: [
      {
        label: incomeLabel,
        data: data.map(item => item.income),
        borderColor: '#22c55e', // green-500
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: expensesLabel,
        data: data.map(item => item.expenses),
        borderColor: '#ef4444', // red-500
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  }),

  // Income vs Expenses doughnut chart
  incomeVsExpenses: (income: number, expenses: number, incomeLabel: string = 'Income', expensesLabel: string = 'Expenses'): ChartData => ({
    labels: [incomeLabel, expensesLabel],
    datasets: [
      {
        label: 'Amount',
        data: [income, expenses],
        backgroundColor: [
          '#22c55e', // green-500
          '#ef4444', // red-500
        ],
        borderColor: [
          '#16a34a', // green-600
          '#dc2626', // red-600
        ],
        borderWidth: 2,
      },
    ],
  }),

  // Budget vs Actual spending
  budgetVsActual: (data: { category: string; budget: number; actual: number }[]): ChartData => ({
    labels: data.map(item => item.category),
    datasets: [
      {
        label: 'Budget',
        data: data.map(item => item.budget),
        backgroundColor: '#3b82f6', // blue-500
        borderColor: '#2563eb', // blue-600
        borderWidth: 1,
      },
      {
        label: 'Actual',
        data: data.map(item => item.actual),
        backgroundColor: '#ef4444', // red-500
        borderColor: '#dc2626', // red-600
        borderWidth: 1,
      },
    ],
  }),
};
