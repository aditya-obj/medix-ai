import React from "react";
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

const options = {
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
      padding: window?.innerWidth < 480 ? 6 : window?.innerWidth < 768 ? 8 : 12,
      displayColors: false,
      titleFont: {
        size:
          window?.innerWidth < 480 ? 11 : window?.innerWidth < 768 ? 12 : 14,
        weight: "600",
        family: "'Space Grotesk', sans-serif",
      },
      bodyFont: {
        size:
          window?.innerWidth < 480 ? 10 : window?.innerWidth < 768 ? 11 : 13,
        family: "'Space Grotesk', sans-serif",
      },
      borderColor: "rgba(255, 255, 255, 0.15)",
      borderWidth: window?.innerWidth < 480 ? 0.5 : 1,
      cornerRadius: window?.innerWidth < 480 ? 4 : 6,
      caretSize: window?.innerWidth < 480 ? 4 : 6,
      caretPadding: window?.innerWidth < 480 ? 4 : 6,
      boxPadding: window?.innerWidth < 480 ? 2 : 3,
      callbacks: {
        label: function (context) {
          const metric = context.dataset.metric;
          const value = context.parsed.y;

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
      min: 90,
      max: 140,
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
        padding:
          window?.innerWidth < 480 ? 1 : window?.innerWidth < 768 ? 2 : 4,
        color: "#666",
        font: {
          size:
            window?.innerWidth < 480 ? 9 : window?.innerWidth < 768 ? 10 : 11,
          weight: "500",
          family: "'Space Grotesk', sans-serif",
        },
        maxTicksLimit:
          window?.innerWidth < 480 ? 4 : window?.innerWidth < 768 ? 5 : 6,
        align: "end",
        labelOffset: -2,
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
        padding:
          window?.innerWidth < 480 ? 1 : window?.innerWidth < 768 ? 2 : 4,
        color: "#666",
        font: {
          size:
            window?.innerWidth < 480 ? 9 : window?.innerWidth < 768 ? 10 : 11,
          weight: "500",
          family: "'Space Grotesk', sans-serif",
        },
        maxRotation: 0,
        minRotation: 0,
        autoSkipPadding: window?.innerWidth < 480 ? 1 : 2,
        maxTicksLimit:
          window?.innerWidth < 480 ? 4 : window?.innerWidth < 768 ? 5 : 7,
      },
      offset: false,
      bounds: "data",
    },
  },
  elements: {
    line: {
      tension: 0.3,
      borderWidth:
        window?.innerWidth < 480 ? 1.5 : window?.innerWidth < 768 ? 2 : 2.5,
      capBezierPoints: true,
    },
    point: {
      radius:
        window?.innerWidth < 480 ? 2.5 : window?.innerWidth < 768 ? 3 : 3.5,
      hoverRadius:
        window?.innerWidth < 480 ? 4 : window?.innerWidth < 768 ? 5 : 6,
      hitRadius:
        window?.innerWidth < 480 ? 5 : window?.innerWidth < 768 ? 6 : 8,
      borderWidth:
        window?.innerWidth < 480 ? 1 : window?.innerWidth < 768 ? 1.5 : 2,
      hoverBorderWidth: window?.innerWidth < 480 ? 1 : 1.5,
      backgroundColor: "#fff",
    },
  },
  layout: {
    padding: {
      top: window?.innerWidth < 480 ? 25 : window?.innerWidth < 768 ? 30 : 35,
      right: window?.innerWidth < 480 ? 5 : window?.innerWidth < 768 ? 8 : 10,
      bottom: window?.innerWidth < 480 ? 5 : window?.innerWidth < 768 ? 8 : 10,
      left: window?.innerWidth < 480 ? 5 : window?.innerWidth < 768 ? 8 : 10,
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
  plugins: {
    legend: {
      display: false,
    },
  },
  clip: false,
};

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const metricData = {
  "Blood Pressure": {
    data: [120, 122, 128, 125, 118, 124, 121],
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
    data: [85, 92, 88, 95, 87, 90, 86],
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
    data: [72, 75, 78, 73, 70, 74, 71],
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
    data: [75, 82, 88, 78, 85, 80, 83],
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

const AnalyticsChart = ({ selectedMetric }) => {
  const chartData = {
    labels: days,
    datasets: [
      {
        fill: true,
        data: metricData[selectedMetric].data,
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
        tension: 0.3,
        clip: {
          top: false,
          bottom: false,
          left: false,
          right: false,
        },
      },
    ],
  };

  const customOptions = {
    ...options,
    maintainAspectRatio: false,
    responsive: true,
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
        padding:
          window?.innerWidth < 480 ? 6 : window?.innerWidth < 768 ? 8 : 12,
        displayColors: false,
        titleFont: {
          size:
            window?.innerWidth < 480 ? 11 : window?.innerWidth < 768 ? 12 : 14,
          weight: "600",
          family: "'Space Grotesk', sans-serif",
        },
        bodyFont: {
          size:
            window?.innerWidth < 480 ? 10 : window?.innerWidth < 768 ? 11 : 13,
          family: "'Space Grotesk', sans-serif",
        },
        borderColor: "rgba(255, 255, 255, 0.15)",
        borderWidth: window?.innerWidth < 480 ? 0.5 : 1,
        cornerRadius: window?.innerWidth < 480 ? 4 : 6,
        caretSize: window?.innerWidth < 480 ? 4 : 6,
        caretPadding: window?.innerWidth < 480 ? 4 : 6,
        boxPadding: window?.innerWidth < 480 ? 2 : 3,
        callbacks: {
          label: function (context) {
            const metric = context.dataset.metric;
            const value = context.parsed.y;

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
      ...options.scales,
      y: {
        ...options.scales.y,
        min: metricData[selectedMetric].yAxisConfig.min,
        max: metricData[selectedMetric].yAxisConfig.max,
        ticks: {
          ...options.scales.y.ticks,
          stepSize: metricData[selectedMetric].yAxisConfig.stepSize,
          callback: function (value) {
            if (selectedMetric === "Blood Pressure") {
              const diastolic = Math.round(value * 0.65);
              return `${value}/${diastolic}`;
            }
            return value;
          },
        },
      },
    },
  };

  return (
    <div className="analytics-chart-container">
      <Line options={customOptions} data={chartData} />
    </div>
  );
};

export default AnalyticsChart;
