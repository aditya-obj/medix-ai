import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getBPStatus(systolic) {
  if (systolic < 90) return "Low";
  if (systolic <= 120) return "Normal";
  if (systolic <= 130) return "Elevated";
  return "High";
}

function getSugarStatus(value) {
  if (value < 70) return "Low";
  if (value <= 100) return "Normal";
  if (value <= 125) return "Pre-diabetic";
  return "High";
}

function getHeartRateStatus(value) {
  if (value < 60) return "Low";
  if (value <= 100) return "Normal";
  return "High";
}

function getPerformanceStatus(value) {
  if (value >= 85) return "Excellent";
  if (value >= 70) return "Good";
  if (value >= 60) return "Fair";
  return "Needs Improvement";
}

const AnalyticsChart = ({ selectedMetric, chartData }) => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: 1024,
  });

  // Move metricData to the top of the component
  const metricData = {
    "Blood Pressure": {
      activeData: chartData.bp || [],
      inactiveData: [125, 130, 128, 135, 132],
      label: "mmHg",
      gradient: ["rgba(255, 99, 132, 0.3)", "rgba(255, 99, 132, 0.02)"],
      borderColor: "rgb(255, 99, 132)",
      yAxisConfig: {
        min: 90,
        max: 140,
        stepSize: 10,
      },
    },
    "Sugar Level": {
      activeData: chartData.sugar || [],
      inactiveData: [88, 90, 87, 89, 86],
      label: "mg/dL",
      gradient: ["rgba(75, 192, 192, 0.3)", "rgba(75, 192, 192, 0.02)"],
      borderColor: "rgb(75, 192, 192)",
      yAxisConfig: {
        min: 60,
        max: 120,
        stepSize: 10,
      },
    },
    "Heart Rate": {
      activeData: chartData.hr || [],
      inactiveData: [73, 74, 71, 76, 73],
      label: "BPM",
      gradient: ["rgba(54, 162, 235, 0.3)", "rgba(54, 162, 235, 0.02)"],
      borderColor: "rgb(54, 162, 235)",
      yAxisConfig: {
        min: 50,
        max: 100,
        stepSize: 10,
      },
    },
    Performance: {
      activeData: chartData.performance || [],
      inactiveData: [78, 80, 77, 81, 79],
      label: "%",
      gradient: ["rgba(153, 102, 255, 0.3)", "rgba(153, 102, 255, 0.02)"],
      borderColor: "rgb(153, 102, 255)",
      yAxisConfig: {
        min: 50,
        max: 100,
        stepSize: 10,
      },
    },
  };

  useEffect(() => {
    setWindowDimensions({
      width: window.innerWidth,
    });

    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getResponsiveValue = (mobile, tablet, desktop) => {
    const width = windowDimensions.width;
    if (width < 480) return mobile;
    if (width < 768) return tablet;
    return desktop;
  };

  const getSelectedData = () => {
    switch (selectedMetric) {
      case "Blood Pressure":
        return chartData.bp;
      case "Heart Rate":
        return chartData.hr;
      case "Sugar Level":
        return chartData.sugar;
      case "Performance":
        return chartData.performance;
      default:
        return [];
    }
  };

  // Move baseOptions after metricData definition
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: getResponsiveValue(6, 8, 12),
        displayColors: false,
        titleFont: {
          size: getResponsiveValue(11, 12, 14),
          weight: "600",
          family: "'Space Grotesk', sans-serif",
        },
        bodyFont: {
          size: getResponsiveValue(10, 11, 13),
          family: "'Space Grotesk', sans-serif",
        },
        borderColor: "rgba(255, 255, 255, 0.15)",
        borderWidth: getResponsiveValue(0.5, 1, 1),
        cornerRadius: getResponsiveValue(4, 6, 6),
        caretSize: getResponsiveValue(4, 6, 6),
        caretPadding: getResponsiveValue(4, 6, 6),
        boxPadding: getResponsiveValue(2, 3, 3),
        callbacks: {
          label: function (context) {
            // Check if this is from the inactive dataset
            if (context.datasetIndex === 1) {
              return "Inactive day";
            }

            const metric = context.dataset.metric;
            const value = Math.round(context.parsed.y);

            switch (metric) {
              case "Blood Pressure":
                const diastolic = Math.round(value * 0.65);
                const bpStatus = getBPStatus(value);
                return `${value}/${diastolic} mmHg (${bpStatus})`;

              case "Sugar Level":
                const sugarStatus = getSugarStatus(value);
                return `${value} mg/dL (${sugarStatus})`;

              case "Heart Rate":
                const hrStatus = getHeartRateStatus(value);
                return `${value} BPM (${hrStatus})`;

              case "Performance":
                const perfStatus = getPerformanceStatus(value);
                return `${value}% (${perfStatus})`;

              default:
                return `${value} ${metricData[metric].label}`;
            }
          },
          title: function (tooltipItems) {
            return tooltipItems[0].label;
          },
        },
      },
    },
    scales: {
      y: {
        min: metricData[selectedMetric].yAxisConfig.min,
        max: metricData[selectedMetric].yAxisConfig.max,
        position: "left",
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.04)",
          drawBorder: false,
          lineWidth: 1,
        },
        border: {
          display: false,
        },
        ticks: {
          padding: getResponsiveValue(2, 3, 4),
          color: "#666",
          font: {
            size: getResponsiveValue(9, 10, 12),
            weight: "500",
            family: "'Space Grotesk', sans-serif",
          },
          maxTicksLimit: 7,
          align: "end",
          labelOffset: 0,
          stepSize: metricData[selectedMetric].yAxisConfig.stepSize,
          callback: function (value) {
            // Round the value to remove decimals
            value = Math.round(value);
            if (selectedMetric === "Blood Pressure") {
              const diastolic = Math.round(value * 0.65);
              if (windowDimensions.width < 480) {
                return value;
              }
              return `${value}/${diastolic}`;
            }
            return value;
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          padding: getResponsiveValue(2, 4, 8),
          color: "#666",
          font: {
            size: getResponsiveValue(9, 10, 12),
            weight: "500",
            family: "'Space Grotesk', sans-serif",
          },
          maxRotation: 0,
          minRotation: 0,
          autoSkipPadding: getResponsiveValue(8, 15, 40),
          maxTicksLimit: 7,
        },
        offset: false,
        bounds: "data",
      },
    },
    elements: {
      line: {
        tension: 0.3,
        borderWidth: getResponsiveValue(1.5, 2, 2.5),
        capBezierPoints: true,
      },
      point: {
        radius: getResponsiveValue(2.5, 3, 3.5),
        hoverRadius: getResponsiveValue(4, 5, 6),
        hitRadius: getResponsiveValue(5, 6, 8),
        borderWidth: getResponsiveValue(1, 1.5, 2),
        hoverBorderWidth: getResponsiveValue(1, 1.5, 1.5),
        backgroundColor: "#fff",
      },
    },
    layout: {
      padding: {
        top: getResponsiveValue(15, 20, 35),
        right: getResponsiveValue(5, 8, 15),
        bottom: getResponsiveValue(5, 8, 15),
        left: getResponsiveValue(2, 4, 8),
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    hover: {
      mode: "index",
      intersect: false,
    },
  };

  // Create arrays with null padding for proper positioning
  const activeDataArray = [
    ...metricData[selectedMetric].activeData,
    ...Array(5).fill(null),
  ];
  const inactiveDataArray = [
    ...Array(2).fill(null),
    ...metricData[selectedMetric].inactiveData,
  ];

  const chartConfig = {
    labels: days,
    datasets: [
      {
        fill: true,
        data: activeDataArray,
        borderColor: metricData[selectedMetric].borderColor,
        metric: selectedMetric,
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return null;
          }

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top
          );
          gradient.addColorStop(0, metricData[selectedMetric].gradient[1]);
          gradient.addColorStop(0.5, metricData[selectedMetric].gradient[0]);
          gradient.addColorStop(1, metricData[selectedMetric].gradient[0]);

          return gradient;
        },
        pointBackgroundColor: "#fff",
        pointBorderColor: metricData[selectedMetric].borderColor,
        pointBorderWidth: 2,
        tension: 0.3,
        clip: false,
      },
      {
        fill: true,
        data: inactiveDataArray,
        borderColor: "rgba(200, 200, 200, 0.6)",
        metric: selectedMetric,
        backgroundColor: function (context) {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return null;
          }

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top
          );
          gradient.addColorStop(0, "rgba(200, 200, 200, 0.02)");
          gradient.addColorStop(0.5, "rgba(200, 200, 200, 0.1)");
          gradient.addColorStop(1, "rgba(200, 200, 200, 0.1)");

          return gradient;
        },
        pointBackgroundColor: "#f5f5f5",
        pointBorderColor: "rgba(200, 200, 200, 0.6)",
        pointBorderWidth: 1,
        tension: 0.3,
        clip: false,
      },
    ],
  };

  return (
    <div className="analytics-chart-container">
      <Line options={baseOptions} data={chartConfig} />
    </div>
  );
};

export default AnalyticsChart;
