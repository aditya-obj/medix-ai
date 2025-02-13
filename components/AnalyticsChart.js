import React, { useEffect, useState, useMemo } from "react";
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
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import PropTypes from "prop-types";

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

// Move status check functions outside component
const STATUS_RANGES = {
  BLOOD_PRESSURE: [
    { max: 90, status: "Low" },
    { max: 120, status: "Normal" },
    { max: 130, status: "Elevated" },
    { max: Infinity, status: "High" },
  ],
  SUGAR_LEVEL: [
    { max: 70, status: "Low" },
    { max: 100, status: "Normal" },
    { max: 140, status: "Normal-Post-Meal" },
    { max: 180, status: "Pre-diabetic" },
    { max: Infinity, status: "High" },
  ],
  HEART_RATE: [
    { max: 60, status: "Low" },
    { max: 100, status: "Normal" },
    { max: Infinity, status: "High" },
  ],
  PERFORMANCE: [
    { min: 400, status: "Excellent" },
    { min: 300, status: "Good" },
    { min: 200, status: "Fair" },
    { min: -Infinity, status: "Needs Improvement" },
  ],
};

function getStatus(value, ranges, isPerformance = false) {
  if (isPerformance) {
    return (
      ranges.find((range) => value >= range.min)?.status || "Needs Improvement"
    );
  }
  return ranges.find((range) => value <= range.max)?.status || "High";
}

function getBPStatus(systolic) {
  return getStatus(systolic, STATUS_RANGES.BLOOD_PRESSURE);
}

function getSugarStatus(value) {
  return getStatus(value, STATUS_RANGES.SUGAR_LEVEL);
}

function getHeartRateStatus(value) {
  return getStatus(value, STATUS_RANGES.HEART_RATE);
}

function getPerformanceStatus(value) {
  return getStatus(value, STATUS_RANGES.PERFORMANCE, true);
}

const AnalyticsChart = ({ selectedMetric, chartData }) => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: 1024,
  });
  const [weekOffset, setWeekOffset] = useState(0);
  const [hasOlderData, setHasOlderData] = useState(false);

  // Move metricData to the top of the component
  const metricData = {
    "Blood Pressure": {
      activeData: chartData.bp || [],
      label: "mmHg",
      gradient: ["rgba(255, 99, 132, 0.3)", "rgba(255, 99, 132, 0.02)"],
      borderColor: "rgb(255, 99, 132)",
      yAxisConfig: {
        min: 90,
        max: 140,
        stepSize: 10,
        buffer: 20,
      },
    },
    "Sugar Level": {
      activeData: chartData.sugar || [],
      label: "mg/dL",
      gradient: ["rgba(75, 192, 192, 0.3)", "rgba(75, 192, 192, 0.02)"],
      borderColor: "rgb(75, 192, 192)",
      yAxisConfig: {
        min: 60,
        max: 120,
        stepSize: 10,
        buffer: 20,
      },
    },
    "Heart Rate": {
      activeData: chartData.hr || [],
      label: "BPM",
      gradient: ["rgba(54, 162, 235, 0.3)", "rgba(54, 162, 235, 0.02)"],
      borderColor: "rgb(54, 162, 235)",
      yAxisConfig: {
        min: 50,
        max: 100,
        stepSize: 10,
        buffer: 20,
      },
    },
    Performance: {
      activeData: chartData.performance || [],
      label: "Score",
      gradient: ["rgba(153, 102, 255, 0.3)", "rgba(153, 102, 255, 0.02)"],
      borderColor: "rgb(153, 102, 255)",
      yAxisConfig: {
        min: 50,
        max: 500,
        stepSize: 50,
        buffer: 50,
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

  // Get the dates for a specific week offset
  const getWeekDates = (offset = 0) => {
    const days = [];
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.

    // Calculate the most recent Monday
    const monday = new Date(today);
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    monday.setDate(today.getDate() - daysFromMonday - offset * 7);

    // Generate dates from Monday to Sunday
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push({
        date: date,
        label: date.toLocaleDateString("en-GB", { weekday: "short" }),
        isFuture: date > today,
      });
    }
    return days;
  };

  // Function to check if there's data for a specific week
  const checkWeekHasData = (weekData) => {
    return (
      weekData &&
      weekData.some(
        (value) => value !== null && value !== undefined && value !== ""
      )
    );
  };

  // Function to get data for a specific week
  const getWeekData = (data, offset) => {
    if (!data || data.length === 0) return Array(7).fill(null);

    const today = new Date();
    const currentDay = today.getDay();
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;

    // Calculate indices for the week
    const endIndex = data.length - offset * 7;
    const startIndex = Math.max(0, endIndex - 7);

    // Check if we have valid indices and enough data
    if (startIndex >= data.length || endIndex <= 0 || startIndex >= endIndex) {
      return Array(7).fill(null);
    }

    // Get the week's data
    let weekData = data.slice(startIndex, endIndex).map((value) => {
      if (!value) return null;
      // For blood pressure, keep the original string format
      return value;
    });

    // Check if we actually have any valid data in this week
    const hasValidData = weekData.some(
      (value) => value !== null && value !== undefined && value !== ""
    );
    if (!hasValidData) {
      return Array(7).fill(null);
    }

    // If we have less than 7 data points, pad with nulls at the start
    if (weekData.length < 7) {
      weekData = [...Array(7 - weekData.length).fill(null), ...weekData];
    }

    // Align data with Monday-Sunday format
    const alignedData = Array(7).fill(null);
    weekData.forEach((value, index) => {
      if (value !== null) {
        const dayOfWeek = (currentDay - (weekData.length - 1 - index) + 7) % 7;
        const alignedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        alignedData[alignedIndex] = value;
      }
    });

    return alignedData;
  };

  // Effect to check for older data
  useEffect(() => {
    const metricDataArray = metricData[selectedMetric].activeData;
    // Check if there's valid data in the next week
    const nextWeekData = getWeekData(metricDataArray, weekOffset + 1);
    const hasValidNextWeekData = nextWeekData.some(
      (value) => value !== null && value !== undefined && value !== ""
    );
    setHasOlderData(hasValidNextWeekData);
  }, [weekOffset, selectedMetric, metricData]);

  const handlePreviousWeek = () => {
    if (hasOlderData) {
      setWeekOffset((prev) => prev + 1);
    }
  };

  const handleNextWeek = () => {
    if (weekOffset > 0) {
      setWeekOffset((prev) => prev - 1);
    }
  };

  const getMetricStatus = (value, metric) => {
    switch (metric) {
      case "Blood Pressure": {
        if (typeof value === "string" && value.includes("/")) {
          const [systolic] = value.split("/").map(Number);
          return getBPStatus(systolic);
        }
        return getBPStatus(value);
      }
      case "Sugar Level":
        return getSugarStatus(value);
      case "Heart Rate":
        return getHeartRateStatus(value);
      case "Performance":
        return getPerformanceStatus(value);
      default:
        return "";
    }
  };

  // Function to get dynamic y-axis range
  const getDynamicYAxisRange = (data, defaultConfig) => {
    if (!data || data.length === 0) {
      return defaultConfig;
    }

    const values = data
      .map((value) => {
        if (typeof value === "string" && value.includes("/")) {
          return parseInt(value.split("/")[0]);
        }
        return value;
      })
      .filter((value) => value !== null && value !== undefined);

    if (values.length === 0) {
      return defaultConfig;
    }

    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const defaultMax = defaultConfig.max;
    const defaultMin = defaultConfig.min;
    const buffer = defaultConfig.buffer || 20;

    return {
      max: maxValue > defaultMax ? maxValue + buffer : defaultMax,
      min: minValue < defaultMin ? minValue - buffer : defaultMin,
      stepSize: defaultConfig.stepSize,
    };
  };

  // Add style element only once when component mounts
  useEffect(() => {
    const styleId = "analytics-chart-pulse";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.9; }
          100% { transform: scale(1); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      return () => {
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, []);

  // Memoize weekDates to prevent unnecessary recalculations
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  // Memoize chart data
  const currentWeekData = useMemo(
    () => getWeekData(metricData[selectedMetric].activeData, weekOffset),
    [selectedMetric, weekOffset, metricData]
  );

  const chartConfig = {
    labels: weekDates.map((day) => day.label),
    datasets: [
      {
        fill: false,
        data: currentWeekData.map((value) => {
          if (
            selectedMetric === "Blood Pressure" &&
            typeof value === "string" &&
            value.includes("/")
          ) {
            const [systolic] = value.split("/").map(Number);
            return systolic;
          }
          return value;
        }),
        borderColor: "transparent",
        metric: selectedMetric,
        pointBackgroundColor: (context) => {
          if (!context.raw) return "transparent";
          const days = weekDates;
          const day = days[context.dataIndex];
          const today = new Date();
          const isToday = day?.date.toDateString() === today.toDateString();

          const value = currentWeekData[context.dataIndex];
          const status = getMetricStatus(value, selectedMetric);
          let color;

          if (selectedMetric === "Sugar Level") {
            switch (status) {
              case "High": // > 180
                color = "rgba(255, 99, 132, 1)"; // Red
                break;
              case "Pre-diabetic": // 140-180
                color = "rgba(255, 206, 86, 1)"; // Yellow
                break;
              case "Normal-Post-Meal": // 100-140
              case "Normal": // 70-100
                color = "rgba(75, 192, 192, 1)"; // Green
                break;
              case "Low": // < 70
                color = "rgba(54, 162, 235, 1)"; // Blue
                break;
              default:
                color = "#fff";
            }
          } else {
            switch (status) {
              case "High":
              case "Elevated":
                color = "rgba(255, 99, 132, 1)";
                break;
              case "Normal":
                color = "rgba(75, 192, 192, 1)";
                break;
              case "Low":
                color = "rgba(54, 162, 235, 1)";
                break;
              case "Excellent":
                color = "rgba(75, 192, 192, 1)";
                break;
              case "Good":
                color = "rgba(54, 162, 235, 1)";
                break;
              case "Fair":
                color = "rgba(255, 206, 86, 1)";
                break;
              case "Needs Improvement":
                color = "rgba(255, 99, 132, 1)";
                break;
              default:
                color = "#fff";
            }
          }
          return isToday ? color : color.replace("1)", "0.7)");
        },
        pointBorderColor: (context) => {
          if (!context.raw) return "transparent";
          const days = weekDates;
          const day = days[context.dataIndex];
          const today = new Date();
          const isToday = day?.date.toDateString() === today.toDateString();

          const value = currentWeekData[context.dataIndex];
          const status = getMetricStatus(value, selectedMetric);
          let color;

          if (selectedMetric === "Sugar Level") {
            switch (status) {
              case "High": // > 180
                color = "rgba(255, 99, 132, 1)"; // Red
                break;
              case "Pre-diabetic": // 140-180
                color = "rgba(255, 206, 86, 1)"; // Yellow
                break;
              case "Normal-Post-Meal": // 100-140
              case "Normal": // 70-100
                color = "rgba(75, 192, 192, 1)"; // Green
                break;
              case "Low": // < 70
                color = "rgba(54, 162, 235, 1)"; // Blue
                break;
              default:
                color = "#fff";
            }
          } else {
            switch (status) {
              case "High":
              case "Elevated":
                color = "rgba(255, 99, 132, 1)";
                break;
              case "Normal":
                color = "rgba(75, 192, 192, 1)";
                break;
              case "Low":
                color = "rgba(54, 162, 235, 1)";
                break;
              case "Excellent":
                color = "rgba(75, 192, 192, 1)";
                break;
              case "Good":
                color = "rgba(54, 162, 235, 1)";
                break;
              case "Fair":
                color = "rgba(255, 206, 86, 1)";
                break;
              case "Needs Improvement":
                color = "rgba(255, 99, 132, 1)";
                break;
              default:
                color = "#fff";
            }
          }
          return isToday ? color : color.replace("1)", "0.7)");
        },
        borderWidth: 0,
        tension: 0,
        clip: false,
        spanGaps: false,
        pointStyle: (context) => {
          if (!context.raw) return "circle";
          return "circle";
        },
        pointRadius: (context) => {
          if (!context.raw) return 0;
          const days = weekDates;
          const day = days[context.dataIndex];
          const today = new Date();
          const isToday = day?.date.toDateString() === today.toDateString();
          return isToday ? 8 : 6;
        },
        pointHoverRadius: 10,
        pointBorderWidth: (context) => {
          if (!context.raw) return 0;
          const days = weekDates;
          const day = days[context.dataIndex];
          const today = new Date();
          const isToday = day?.date.toDateString() === today.toDateString();
          return isToday ? 2.5 : 2;
        },
        pointHoverBorderWidth: 3,
        pointHoverBackgroundColor: "#fff",
      },
    ],
  };

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
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#000",
        bodyColor: "#666",
        padding: getResponsiveValue(8, 12, 15),
        displayColors: false,
        titleFont: {
          size: getResponsiveValue(12, 13, 14),
          weight: "600",
          family: "'Space Grotesk', sans-serif",
        },
        bodyFont: {
          size: getResponsiveValue(11, 12, 13),
          family: "'Space Grotesk', sans-serif",
        },
        borderColor: "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
        cornerRadius: getResponsiveValue(6, 7, 8),
        caretSize: getResponsiveValue(6, 7, 8),
        caretPadding: getResponsiveValue(6, 7, 8),
        boxPadding: getResponsiveValue(4, 5, 6),
        callbacks: {
          label: function (context) {
            const value = currentWeekData[context.dataIndex];
            const status = getMetricStatus(value, selectedMetric);
            let label = "";

            switch (selectedMetric) {
              case "Blood Pressure": {
                if (value && typeof value === "string" && value.includes("/")) {
                  label = `${value} mmHg`;
                } else if (value) {
                  const systolic = Math.round(value);
                  const diastolic = Math.round(systolic * 0.65);
                  label = `${systolic}/${diastolic} mmHg`;
                }
                break;
              }
              case "Sugar Level":
                label = `${Math.round(value)} mg/dL`;
                break;
              case "Heart Rate":
                label = `${Math.round(value)} BPM`;
                break;
              case "Performance":
                label = `${Math.round(value)} Score`;
                break;
            }

            return [`Value: ${label}`, `Status: ${status}`];
          },
          title: function (tooltipItems) {
            const day = weekDates[tooltipItems[0].dataIndex];
            if (!day) return "";

            const date = day.date;
            return date.toLocaleDateString("en-GB", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          },
        },
      },
    },
    scales: {
      y: {
        ...getDynamicYAxisRange(
          metricData[selectedMetric].activeData,
          metricData[selectedMetric].yAxisConfig
        ),
        position: "left",
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.03)",
          drawBorder: false,
          lineWidth: 1,
        },
        ticks: {
          padding: getResponsiveValue(8, 10, 12),
          color: "#666",
          font: {
            size: getResponsiveValue(10, 11, 12),
            weight: "600",
            family: "'Space Grotesk', sans-serif",
          },
          maxTicksLimit: getResponsiveValue(6, 7, 8),
          align: "center",
          callback: function (value) {
            value = Math.round(value);
            if (selectedMetric === "Blood Pressure") {
              const diastolic = Math.round(value * 0.65);
              return windowDimensions.width < 480
                ? value
                : `${value}/${diastolic}`;
            }
            return value;
          },
        },
      },
      x: {
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.03)",
          drawBorder: false,
        },
        ticks: {
          padding: getResponsiveValue(6, 7, 8),
          color: (context) => {
            const days = weekDates;
            const day = days[context.index];
            if (!day) return "#666";

            const today = new Date();
            const isToday = day.date.toDateString() === today.toDateString();

            if (isToday) return metricData[selectedMetric].borderColor;
            return day.isFuture ? "#999" : "#666";
          },
          font: (context) => {
            const days = weekDates;
            const day = days[context.index];
            if (!day)
              return {
                size: getResponsiveValue(10, 11, 12),
                weight: "500",
                family: "'Space Grotesk', sans-serif",
              };

            const today = new Date();
            const isToday = day.date.toDateString() === today.toDateString();

            return {
              size: isToday
                ? getResponsiveValue(12, 13, 14)
                : getResponsiveValue(10, 11, 12),
              weight: isToday ? "700" : "500",
              family: "'Space Grotesk', sans-serif",
            };
          },
          maxRotation: 0,
          minRotation: 0,
          autoSkip: false,
        },
      },
    },
    elements: {
      point: {
        hoverBackgroundColor: "white",
        hoverBorderWidth: getResponsiveValue(2, 2.5, 3),
        radius: function (context) {
          if (!context.raw) return 0;
          const days = weekDates;
          const day = days[context.dataIndex];
          const today = new Date();
          const isToday = day?.date.toDateString() === today.toDateString();
          return isToday
            ? getResponsiveValue(6, 7, 8)
            : getResponsiveValue(4, 5, 6);
        },
      },
      line: {
        tension: 0,
        borderWidth: 0,
      },
    },
    animation: {
      duration: 750,
      easing: "easeInOutQuart",
      onProgress: function (animation) {
        const chart = animation.chart;
        const ctx = chart.ctx;
        const dataset = chart.data.datasets[0];
        const meta = chart.getDatasetMeta(0);

        meta.data.forEach((point, index) => {
          if (!dataset.data[index]) return;

          const days = weekDates;
          const day = days[index];
          const today = new Date();
          const isToday = day?.date.toDateString() === today.toDateString();

          if (isToday && point.active) {
            // Add subtle glow effect for today's point
            ctx.save();
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.options.radius + 4, 0, 2 * Math.PI);
            const gradient = ctx.createRadialGradient(
              point.x,
              point.y,
              point.options.radius,
              point.x,
              point.y,
              point.options.radius + 4
            );
            const color = dataset.pointBorderColor(point);
            gradient.addColorStop(0, color.replace("1)", "0.3)"));
            gradient.addColorStop(1, color.replace("1)", "0)"));
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.restore();
          }
        });
      },
    },
    layout: {
      padding: {
        top: getResponsiveValue(15, 20, 25),
        right: getResponsiveValue(15, 20, 25),
        bottom: getResponsiveValue(25, 30, 35),
        left: getResponsiveValue(10, 12, 15),
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

  return (
    <div
      className="analytics-chart-container"
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: getResponsiveValue("0 12px", "0 15px", "0 20px"),
          marginBottom: getResponsiveValue(8, 9, 10),
        }}
      >
        <button
          onClick={handlePreviousWeek}
          disabled={!hasOlderData}
          style={{
            background: hasOlderData
              ? metricData[selectedMetric].borderColor
              : "rgba(0, 0, 0, 0.1)",
            border: "none",
            borderRadius: "50%",
            width: getResponsiveValue(28, 30, 32),
            height: getResponsiveValue(28, 30, 32),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: hasOlderData ? "pointer" : "not-allowed",
            opacity: hasOlderData ? 1 : 0.5,
            transition: "all 0.2s ease",
            pointerEvents: hasOlderData ? "auto" : "none",
          }}
        >
          <IoChevronBack color="white" size={getResponsiveValue(16, 18, 20)} />
        </button>
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: getResponsiveValue(12, 13, 14),
            fontWeight: "600",
            color: "#666",
          }}
        >
          {weekOffset === 0
            ? "Current Week"
            : `${weekOffset} ${weekOffset === 1 ? "Week" : "Weeks"} Ago`}
        </span>
        <button
          onClick={handleNextWeek}
          disabled={weekOffset === 0}
          style={{
            background:
              weekOffset > 0
                ? metricData[selectedMetric].borderColor
                : "rgba(0, 0, 0, 0.1)",
            border: "none",
            borderRadius: "50%",
            width: getResponsiveValue(28, 30, 32),
            height: getResponsiveValue(28, 30, 32),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: weekOffset > 0 ? "pointer" : "not-allowed",
            opacity: weekOffset > 0 ? 1 : 0.5,
            transition: "all 0.2s ease",
            pointerEvents: weekOffset > 0 ? "auto" : "none",
          }}
        >
          <IoChevronForward
            color="white"
            size={getResponsiveValue(16, 18, 20)}
          />
        </button>
      </div>
      <Line options={baseOptions} data={chartConfig} />
    </div>
  );
};

AnalyticsChart.propTypes = {
  selectedMetric: PropTypes.oneOf([
    "Blood Pressure",
    "Sugar Level",
    "Heart Rate",
    "Performance",
  ]).isRequired,
  chartData: PropTypes.shape({
    bp: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.oneOf([null]),
      ])
    ),
    sugar: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])])
    ),
    hr: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])])
    ),
    performance: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])])
    ),
  }).isRequired,
};

export default AnalyticsChart;
