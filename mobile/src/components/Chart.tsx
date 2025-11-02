import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import type { ChartData } from 'react-native-chart-kit/dist/HelperTypes';

const screenWidth = Dimensions.get('window').width;

type PieChartDatum = {
  name: string;
  value: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
};

type BaseChartProps = {
  title?: string;
  height?: number;
};

type LineChartProps = BaseChartProps & {
  type: 'line';
  data: ChartData;
};

type BarChartProps = BaseChartProps & {
  type: 'bar';
  data: ChartData;
};

type PieChartProps = BaseChartProps & {
  type: 'pie';
  data: PieChartDatum[];
};

type ChartProps = LineChartProps | BarChartProps | PieChartProps;

export function Chart({ type, data, title, height = 220 }: ChartProps) {
  // Validate data
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForDots: {
      r: 6,
      strokeWidth: 2,
      stroke: '#3b82f6',
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart
            data={data}
            width={screenWidth - 32}
            height={height}
            chartConfig={chartConfig}
            bezier={true}
            style={styles.chart}
          />
        );
      case 'pie':
        return (
          <PieChart
            data={data as PieChartDatum[]}
            width={screenWidth - 32}
            height={height}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        );
      case 'bar':
        return (
          <BarChart
            data={data as ChartData}
            width={screenWidth - 32}
            height={height}
            chartConfig={chartConfig}
            yAxisLabel=""
            yAxisSuffix=""
            style={styles.chart}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {renderChart()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#1f2937',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    padding: 20,
  },
});
