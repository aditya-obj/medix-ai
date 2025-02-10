"use client";
import { React, useState, useRef, useEffect } from "react";
import "@/app/styles/statistic.css";
import PerformanceMeter from "./PerformanceMeter";
import AnalyticsChart from "./AnalyticsChart";
import Image from "next/image";
import { getAuth } from "firebase/auth";
import { ref, get, set } from "firebase/database";
import { db } from "@/components/firebase.config";

const Statistic = () => {
  const leftArrow = useRef(undefined);
  const rightArrow = useRef(undefined);
  const [leftArrowStatus, setLeftArrowStatus] = useState(false);
  const [rightArrowStatus, setRightArrowStatus] = useState(true);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState("Blood Pressure");
  const maxScore = 500;
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    location: "",
    weight: "",
    height: "",
    age: "",
    waterIntake: "",
    cigarettesPerDay: "",
    drinksPerWeek: "",
    physicalPerWeek: "",
    sleepHours: "",
    diet: "",
    disease: "",
    medication: "",
    allergies: "",
  });

  const [details, setDetails] = useState({
    bp: [],
    hr: [],
    sugar: [],
    performance: [],
    healthPercentile: [],
  });

  const [performanceIncrease, setPerformanceIncrease] = useState(null);
  const [lastCheckupTime, setLastCheckupTime] = useState("");
  const [healthPercentile, setHealthPercentile] = useState(null);
  const [dietInfo, setDietInfo] = useState({
    protein: 0,
    fat: 0,
    carbs: 0,
  });

  const [dateDisplay, setDateDisplay] = useState({
    date: "",
    time: "",
  });
  const [isHovered, setIsHovered] = useState(false);
  const [metrics, setMetrics] = useState({
    heartRate: {
      change: 0,
      showChange: false,
    },
    bloodPressure: {
      change: 0,
      showChange: false,
    },
    sugarLevel: {
      change: 0,
      showChange: false,
    },
  });

  // Normal values for each metric
  const normalValues = {
    bloodPressure: 120, // Normal systolic blood pressure
    heartRate: 80, // Normal heart rate
    sugarLevel: 100, // Normal blood sugar level
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.error("User not authenticated");
          return;
        }

        const uid = user.uid;

        // Fetch timestamps first to get the last checkup time
        const timestampsRef = ref(db, `users/${uid}/timestamps`);
        const timestampsSnapshot = await get(timestampsRef);

        if (timestampsSnapshot.exists()) {
          const timestamps = timestampsSnapshot.val();
          const lastTimestamp = timestamps[timestamps.length - 1];

          // Convert timestamp to formatted date and time
          const date = new Date(lastTimestamp);
          const formattedDate = date.toLocaleDateString("en-GB");
          const formattedTime = date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          });

          setDateDisplay({
            date: formattedDate,
            time: formattedTime,
          });
        }

        // Fetch name and personal data (unchanged)
        const nameRef = ref(db, `users/${uid}/name`);
        const nameSnapshot = await get(nameRef);
        const personalRef = ref(db, `users/${uid}/personal`);
        const personalSnapshot = await get(personalRef);

        if (personalSnapshot.exists() || nameSnapshot.exists()) {
          const personalData = personalSnapshot.val() || {};
          const name = nameSnapshot.val();
          setFormData((prevData) => ({
            ...prevData,
            ...personalData,
            name: name || user.displayName || "User",
          }));
        }

        // Fetch and process details data with timestamp handling
        const detailsRef = ref(db, `users/${uid}/details`);
        const detailsSnapshot = await get(detailsRef);

        if (detailsSnapshot.exists()) {
          const detailsData = detailsSnapshot.val();

          // Helper function to process daily data
          const processDailyData = (data) => {
            if (!data) return [];

            // Convert timestamps to dates and group by date
            const dailyGroups = Object.entries(data).reduce(
              (acc, [timestamp, value]) => {
                const date = new Date(parseInt(timestamp)).toLocaleDateString(
                  "en-GB"
                );
                if (!acc[date]) {
                  acc[date] = { timestamp: parseInt(timestamp), value };
                } else if (parseInt(timestamp) > acc[date].timestamp) {
                  // Update only if current timestamp is more recent
                  acc[date] = { timestamp: parseInt(timestamp), value };
                }
                return acc;
              },
              {}
            );

            // Convert to array and sort by date
            return Object.values(dailyGroups)
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((item) => item.value)
              .slice(-7); // Get last 7 days of data
          };

          // Process each metric
          const processedDetails = {
            bp: processDailyData(detailsData.bloodPressure),
            hr: processDailyData(detailsData.heartRate),
            sugar: processDailyData(detailsData.sugarLevel),
            performance: processDailyData(detailsData.performance),
            healthPercentile: processDailyData(detailsData.healthPercentile),
          };

          setDetails(processedDetails);

          // Set health percentile
          if (processedDetails.healthPercentile.length > 0) {
            setHealthPercentile(
              processedDetails.healthPercentile[
                processedDetails.healthPercentile.length - 1
              ]
            );
          }

          // Calculate performance increase percentage
          if (processedDetails.performance.length >= 2) {
            const currentPerformance =
              processedDetails.performance[
                processedDetails.performance.length - 1
              ];
            const previousPerformance =
              processedDetails.performance[
                processedDetails.performance.length - 2
              ];

            if (currentPerformance > previousPerformance) {
              const increase =
                ((currentPerformance - previousPerformance) /
                  previousPerformance) *
                100;
              setPerformanceIncrease(Math.round(increase));
            } else {
              setPerformanceIncrease(null);
            }
          }

          // Set the latest performance score
          if (processedDetails.performance.length > 0) {
            setPerformanceScore(
              processedDetails.performance[
                processedDetails.performance.length - 1
              ]
            );
          }

          // Set the latest values and calculate metrics changes
          const setLatestValueAndChange = (metric, values, normalValue) => {
            if (values.length > 0) {
              const currentValue = values[values.length - 1];
              setFormData((prev) => ({ ...prev, [metric]: currentValue }));

              // Extract systolic value if it's blood pressure
              const currentNumericValue =
                metric === "bloodPressure" && typeof currentValue === "string"
                  ? parseInt(currentValue.split("/")[0])
                  : currentValue;

              if (currentNumericValue) {
                const percentDiff =
                  ((currentNumericValue - normalValue) / normalValue) * 100;
                setMetrics((prev) => ({
                  ...prev,
                  [metric]: {
                    change: Math.round(percentDiff),
                    showChange: true,
                  },
                }));
              }
            }
          };

          setLatestValueAndChange(
            "bloodPressure",
            processedDetails.bp,
            normalValues.bloodPressure
          );
          setLatestValueAndChange(
            "heartRate",
            processedDetails.hr,
            normalValues.heartRate
          );
          setLatestValueAndChange(
            "sugarLevel",
            processedDetails.sugar,
            normalValues.sugarLevel
          );
        }

        // Fetch diet info for the latest timestamp
        if (timestampsSnapshot.exists()) {
          const timestamps = timestampsSnapshot.val();
          const lastTimestamp = timestamps[timestamps.length - 1];

          const proteinRef = ref(
            db,
            `users/${uid}/details/protien/${lastTimestamp}`
          );
          const fatRef = ref(db, `users/${uid}/details/fat/${lastTimestamp}`);
          const carbsRef = ref(
            db,
            `users/${uid}/details/carbs/${lastTimestamp}`
          );

          const [proteinSnapshot, fatSnapshot, carbsSnapshot] =
            await Promise.all([get(proteinRef), get(fatRef), get(carbsRef)]);

          setDietInfo({
            protein: proteinSnapshot.exists() ? proteinSnapshot.val() : 0,
            fat: fatSnapshot.exists() ? fatSnapshot.val() : 0,
            carbs: carbsSnapshot.exists() ? carbsSnapshot.val() : 0,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleLeftArrowClick = () => {
    if (leftArrowStatus) {
      setLeftArrowStatus(false);
      setRightArrowStatus(true);
    }
  };

  // Handle right arrow click
  const handleRightArrowClick = () => {
    if (rightArrowStatus) {
      setLeftArrowStatus(true);
      setRightArrowStatus(false);
    }
  };

  const handleTagClick = (e) => {
    const tags = document.querySelectorAll(".statistic-analytics-tag");
    tags.forEach((tag) => tag.classList.remove("active-tag"));

    e.currentTarget.classList.add("active-tag");

    setSelectedMetric(e.currentTarget.textContent.trim());
  };

  const handleSaveReport = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not authenticated");
      }

      const uid = user.uid;

      // Get the latest timestamp
      const timestampsRef = ref(db, `users/${uid}/timestamps`);
      const timestampsSnapshot = await get(timestampsRef);

      if (!timestampsSnapshot.exists()) {
        throw new Error("No timestamps found");
      }

      const timestamps = timestampsSnapshot.val();
      const latestTimestamp = timestamps[timestamps.length - 1];

      // Get the current health report
      const healthReportRef = ref(db, `users/${uid}/healthReport`);
      const healthReportSnapshot = await get(healthReportRef);

      if (!healthReportSnapshot.exists()) {
        throw new Error("No health report found");
      }

      const healthReport = healthReportSnapshot.val();

      // Save the report to the reports collection with the timestamp
      await set(ref(db, `users/${uid}/reports/${latestTimestamp}`), {
        report: healthReport.report,
        timestamp: latestTimestamp,
      });

      // Visual feedback for successful save
      const saveBtn = document.querySelector(".save-btn");
      saveBtn.classList.add("active");
      setTimeout(() => {
        saveBtn.classList.remove("active");
      }, 2000);
    } catch (error) {
      console.error("Error saving report:", error);
      // Add error handling UI feedback here if needed
    }
  };

  // Function to get last N elements from array
  const getLastNElements = (arr, n) => {
    if (arr.length <= n) return arr;
    return arr.slice(arr.length - n);
  };

  // Get last 7 entries for each metric
  const getChartData = () => {
    return {
      bp: getLastNElements(details.bp, 7),
      hr: getLastNElements(details.hr, 7),
      sugar: getLastNElements(details.sugar, 7),
      performance: getLastNElements(details.performance, 7),
    };
  };

  return (
    <div className="statistic-container">
      <div className="statistic-title-container">
        <div className="statistic-title">Your Statistic</div>
        <div className="statistic-title-content">
          <div
            className={`statistic-bloodPressure ${
              metrics.bloodPressure.showChange ? "show-change" : ""
            }`}
            data-change={
              metrics.bloodPressure.change > 0
                ? `+${metrics.bloodPressure.change}%`
                : `${metrics.bloodPressure.change}%`
            }
          >
            <div className="statistic-title-icon">
              <Image
                src="/svg/bloodPressure.svg"
                alt="bloodPressure"
                width={24}
                height={24}
              />
            </div>
            <div className="statistic-title-content-text">
              <div className="statistic-title-content-heading">
                {formData.bloodPressure || "N/A"}
              </div>
              <div className="statistic-title-content-subHeading">
                Blood Pressure (mmHg)
              </div>
            </div>
          </div>
          <div
            className={`statistic-heartRate ${
              metrics.heartRate.showChange ? "show-change" : ""
            }`}
            data-change={
              metrics.heartRate.change > 0
                ? `+${metrics.heartRate.change}%`
                : `${metrics.heartRate.change}%`
            }
          >
            <div className="statistic-title-icon">
              <Image
                src="/svg/heartRate.svg"
                alt="heartRate"
                width={24}
                height={24}
              />
            </div>
            <div className="statistic-title-content-text">
              <div className="statistic-title-content-heading">
                {formData.heartRate || "N/A"}
              </div>
              <div className="statistic-title-content-subHeading">
                Heart Rate (Bpm)
              </div>
            </div>
          </div>
          <div
            className={`statistic-Sugar ${
              metrics.sugarLevel.showChange ? "show-change" : ""
            }`}
            data-change={
              metrics.sugarLevel.change > 0
                ? `+${metrics.sugarLevel.change}%`
                : `${metrics.sugarLevel.change}%`
            }
          >
            <div className="statistic-title-icon">
              <Image
                src="/svg/sugarLevel.svg"
                alt="sugarLevel"
                width={24}
                height={24}
              />
            </div>
            <div className="statistic-title-content-text">
              <div className="statistic-title-content-heading">
                {formData.sugarLevel || "N/A"}
              </div>
              <div className="statistic-title-content-subHeading">
                Sugar Level (mg/dL)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="statistic-content">
        <div className="statistic-personalInfo">
          <div className="statistic-personalInfo-header">
            <div className="statistic-personalInfo-title">
              Personal Information
            </div>
            <div className="statistic-personalInfo-header-content">
              <div className="statistic-personalInfo-image">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      opacity="0.4"
                      d="M12 22.01C17.5228 22.01 22 17.5329 22 12.01C22 6.48716 17.5228 2.01001 12 2.01001C6.47715 2.01001 2 6.48716 2 12.01C2 17.5329 6.47715 22.01 12 22.01Z"
                      fill="#292D32"
                    ></path>{" "}
                    <path
                      d="M12 6.93994C9.93 6.93994 8.25 8.61994 8.25 10.6899C8.25 12.7199 9.84 14.3699 11.95 14.4299C11.98 14.4299 12.02 14.4299 12.04 14.4299C12.06 14.4299 12.09 14.4299 12.11 14.4299C12.12 14.4299 12.13 14.4299 12.13 14.4299C14.15 14.3599 15.74 12.7199 15.75 10.6899C15.75 8.61994 14.07 6.93994 12 6.93994Z"
                      fill="#292D32"
                    ></path>{" "}
                    <path
                      d="M18.7807 19.36C17.0007 21 14.6207 22.01 12.0007 22.01C9.3807 22.01 7.0007 21 5.2207 19.36C5.4607 18.45 6.1107 17.62 7.0607 16.98C9.7907 15.16 14.2307 15.16 16.9407 16.98C17.9007 17.62 18.5407 18.45 18.7807 19.36Z"
                      fill="#292D32"
                    ></path>{" "}
                  </g>
                </svg>
              </div>
              <div className="statistic-personalInfo-text">
                <div className="statistic-personalInfo-name">
                  {formData.name}
                </div>
                <div className="statistic-personalInfo-status">Patient</div>
              </div>
            </div>
          </div>

          <div className="statistic-personalInfo-slider">
            <div className="statistic-personalInfo-slider-text">
              Detail Information
            </div>
            <div className="statistic-arrow-container">
              <div
                className={`statistic-arrow ${
                  leftArrowStatus
                    ? "active-arrow cursor-pointer"
                    : "cursor-disabled"
                }`}
                ref={leftArrow}
                onClick={handleLeftArrowClick}
              >
                <svg
                  className="left"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M11.7071 4.29289C12.0976 4.68342 12.0976 5.31658 11.7071 5.70711L6.41421 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H6.41421L11.7071 18.2929C12.0976 18.6834 12.0976 19.3166 11.7071 19.7071C11.3166 20.0976 10.6834 20.0976 10.2929 19.7071L3.29289 12.7071C3.10536 12.5196 3 12.2652 3 12C3 11.7348 3.10536 11.4804 3.29289 11.2929L10.2929 4.29289C10.6834 3.90237 11.3166 3.90237 11.7071 4.29289Z"
                      fill="#0f0f0f"
                    ></path>{" "}
                  </g>
                </svg>
                <svg
                  className="active-left"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M11.7071 4.29289C12.0976 4.68342 12.0976 5.31658 11.7071 5.70711L6.41421 11H20C20.5523 11 21 11.4477 21 12C21 12.5523 20.5523 13 20 13H6.41421L11.7071 18.2929C12.0976 18.6834 12.0976 19.3166 11.7071 19.7071C11.3166 20.0976 10.6834 20.0976 10.2929 19.7071L3.29289 12.7071C3.10536 12.5196 3 12.2652 3 12C3 11.7348 3.10536 11.4804 3.29289 11.2929L10.2929 4.29289C10.6834 3.90237 11.3166 3.90237 11.7071 4.29289Z"
                      fill="#e5e5e5"
                    ></path>{" "}
                  </g>
                </svg>
              </div>
              <div
                className={`statistic-arrow ${
                  rightArrowStatus
                    ? "active-arrow cursor-pointer"
                    : "cursor-disabled"
                }`}
                ref={rightArrow}
                onClick={handleRightArrowClick}
              >
                <svg
                  className="right"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z"
                      fill="#0f0f0f"
                    ></path>{" "}
                  </g>
                </svg>
                <svg
                  className="active-right"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z"
                      fill="#e5e5e5"
                    ></path>{" "}
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <div
            className="statistic-personalInfo-content-left"
            style={{ display: rightArrowStatus ? "block" : "none" }}
          >
            <div className="statistic-personalInfo-contents">
              <div className="statistic-personalInfo-titles">
                <div className="statistic-personalInfo-title-icon">
                  <svg
                    viewBox="0 0 1024 1024"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#6b6b6b"
                    stroke="#6b6b6b"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      <path
                        fill="#6b6b6b"
                        d="M512 512a192 192 0 1 0 0-384 192 192 0 0 0 0 384zm0 64a256 256 0 1 1 0-512 256 256 0 0 1 0 512z"
                      ></path>
                      <path
                        fill="#6b6b6b"
                        d="M512 512a32 32 0 0 1 32 32v256a32 32 0 1 1-64 0V544a32 32 0 0 1 32-32z"
                      ></path>
                      <path
                        fill="#6b6b6b"
                        d="M384 649.088v64.96C269.76 732.352 192 771.904 192 800c0 37.696 139.904 96 320 96s320-58.304 320-96c0-28.16-77.76-67.648-192-85.952v-64.96C789.12 671.04 896 730.368 896 800c0 88.32-171.904 160-384 160s-384-71.68-384-160c0-69.696 106.88-128.96 256-150.912z"
                      ></path>
                    </g>
                  </svg>
                </div>
                Place
              </div>
              <div className="statistic-personalInfo-content">
                {formData.location}
              </div>
            </div>
            <div className="statistic-personalInfo-contents">
              <div className="statistic-personalInfo-titles">
                <div className="statistic-personalInfo-title-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        d="M7 10H17M7 14H12M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"
                        stroke="#6b6b6b"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                    </g>
                  </svg>
                </div>
                Age
              </div>
              <div className="statistic-personalInfo-content">
                {formData.age}
              </div>
            </div>
            <div className="statistic-personalInfo-contents">
              <div className="statistic-personalInfo-titles">
                <div className="statistic-personalInfo-title-icon">
                  <svg
                    fill="#6b6b6b"
                    viewBox="0 0 256 256"
                    id="Flat"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="#6b6b6b"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path d="M219.9978,23.95557q-.00219-.56984-.05749-1.13819c-.018-.18408-.05237-.36279-.07849-.54443-.02979-.20557-.05371-.41211-.09424-.61621-.04029-.20362-.09607-.40088-.14649-.60059-.04541-.18017-.08484-.36084-.13867-.53906-.05884-.19434-.13159-.38135-.19971-.57129-.06445-.17969-.12353-.36084-.19677-.5376-.07349-.17724-.15967-.34668-.24109-.51953-.08582-.18213-.16687-.36621-.26257-.54492-.088-.16455-.18824-.32031-.2837-.48047-.10534-.17627-.2052-.355-.32031-.52685-.11572-.17334-.24475-.33545-.369-.502-.11-.14746-.21252-.29834-.3302-.4414-.23462-.28614-.4834-.55957-.74316-.82227-.01782-.01807-.03247-.03809-.05054-.05615-.01831-.01856-.03857-.0332-.05688-.05127q-.39441-.38966-.82227-.74317c-.13965-.11474-.28686-.21435-.43042-.32177-.16992-.127-.33606-.25879-.51269-.377-.16883-.11328-.34424-.21093-.51734-.31445-.16333-.09765-.32324-.20019-.49145-.29-.1731-.09277-.3512-.1709-.52759-.25439-.17871-.08448-.35462-.17383-.538-.24951-.16932-.07032-.34229-.12647-.514-.18848-.19751-.07129-.39307-.14649-.59534-.208-.16882-.05078-.34045-.08789-.51086-.13135-.20874-.05322-.41529-.11132-.62818-.15332-.19055-.03759-.383-.05957-.57507-.08789-.19544-.02881-.38831-.06494-.58679-.08447-.33252-.03271-.666-.04541-.99988-.05078C208.11853,12.0083,208.0603,12,208,12H172a12,12,0,0,0,0,24h7.0293l-15.051,15.05127A71.97526,71.97526,0,1,0,108,178.981V192H88a12,12,0,0,0,0,24h20v16a12,12,0,0,0,24,0V216h20a12,12,0,0,0,0-24H132V178.981A71.928,71.928,0,0,0,180.27783,68.69287L196,52.9707V60a12,12,0,0,0,24,0V24C220,23.98486,219.9978,23.97021,219.9978,23.95557ZM120,156a48,48,0,1,1,48-48A48.05468,48.05468,0,0,1,120,156Z"></path>{" "}
                    </g>
                  </svg>
                </div>
                Gender
              </div>
              <div className="statistic-personalInfo-content">
                {formData.gender}
              </div>
            </div>
            <div className="statistic-personalInfo-contents">
              <div className="statistic-personalInfo-titles">
                <div className="statistic-personalInfo-title-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        d="M12.0002 6L11.0064 9M16.5 6C17.8978 6 18.5967 6 19.1481 6.22836C19.8831 6.53284 20.4672 7.11687 20.7716 7.85195C21 8.40326 21 9.10218 21 10.5V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V10.5C3 9.10218 3 8.40326 3.22836 7.85195C3.53284 7.11687 4.11687 6.53284 4.85195 6.22836C5.40326 6 6.10218 6 7.5 6M10 17H14M10.5415 3H13.4588C14.5397 3 15.0802 3 15.4802 3.18541C16.0136 3.43262 16.4112 3.90199 16.5674 4.46878C16.6845 4.89387 16.5957 5.42698 16.418 6.4932C16.2862 7.28376 16.2203 7.67904 16.0449 7.98778C15.8111 8.39944 15.4388 8.71481 14.9943 8.87778C14.661 9 14.2602 9 13.4588 9H10.5415C9.74006 9 9.33933 9 9.00596 8.87778C8.56146 8.71481 8.18918 8.39944 7.95536 7.98778C7.77999 7.67904 7.71411 7.28376 7.58235 6.4932C7.40465 5.42698 7.3158 4.89387 7.43291 4.46878C7.58906 3.90199 7.98669 3.43262 8.52009 3.18541C8.92014 3 9.46061 3 10.5415 3Z"
                        stroke="#6b6b6b"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                    </g>
                  </svg>
                </div>
                Weight
              </div>
              <div className="statistic-personalInfo-content">
                {formData.weight} kg
              </div>
            </div>
            <div className="statistic-personalInfo-contents">
              <div className="statistic-personalInfo-titles">
                <div className="statistic-personalInfo-title-icon"></div>
                Height
              </div>
              <div className="statistic-personalInfo-content">
                {formData.height} cm
              </div>
            </div>
            <div className="statistic-personalInfo-contents">
              <div className="statistic-personalInfo-titles">
                <div className="statistic-personalInfo-title-icon"></div>
                Allergies
              </div>
              <div className="statistic-personalInfo-content">
                {formData.allergies}
              </div>
            </div>
            <div className="statistic-personalInfo-contents">
              <div className="statistic-personalInfo-titles">
                <div className="statistic-personalInfo-title-icon"></div>
                Desease
              </div>
              <div className="statistic-personalInfo-content">
                {formData.disease}
              </div>
            </div>
          </div>

          <div
            className="statistic-personalInfo-content-right"
            style={{ display: leftArrowStatus ? "block" : "none" }}
          >
            <div className="statistic-personalInfo-contents">
              <div className="statistic-personalInfo-titles">
                <div className="statistic-personalInfo-title-icon">
                  <svg
                    fill="#6b6b6b"
                    viewBox="0 0 32 32"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="#6b6b6b"
                    strokeWidth="0.00032"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <title>pill</title>{" "}
                      <path d="M28.987 7.898c-1.618-2.803-5.215-3.779-8.010-2.146-9.273 5.417-6.35 3.666-15.822 9.135v0c-2.803 1.618-3.764 5.207-2.146 8.010s5.214 3.777 8.010 2.146c9.447-5.512 6.518-3.772 15.822-9.135 2.804-1.616 3.765-5.207 2.146-8.010zM26.544 15.141l-7.751 4.475c0.424-0.245 0.679-0.623 0.796-1.089 1.068-0.623 2.463-1.428 5.298-3.054 0.834-0.478 1.459-1.163 1.851-1.969l-0-0c0.654-1.343 0.644-2.99-0.153-4.376-0.115-0.2-0.262-0.262-0.368-0.544 0.679 2.050-0.15 4.373-2.097 5.489-2.236 1.282-3.578 2.057-4.571 2.636-0.417-1.701-1.638-3.688-2.945-4.926-1.888 1.115-2.616 1.559-7.348 4.271-1.921 1.101-2.752 3.377-2.122 5.407-0.023-0.012-0.046-0.024-0.069-0.036-0.109-0.135-0.217-0.27-0.306-0.426-0.797-1.387-0.807-3.033-0.153-4.376l-0-0c0.392-0.806 1.017-1.49 1.851-1.969 4.175-2.393 5.228-3.010 6.71-3.88-0.534-0.23-1.037-0.262-1.455-0.017l7.751-4.475c5.215-3.011 10.413 5.8 5.115 8.859z"></path>{" "}
                    </g>
                  </svg>
                </div>
                Medication
              </div>
              <div className="statistic-personalInfo-content">
                {formData.medication}
              </div>
            </div>
            <div className="statistic-personalInfo-contents">
              <div className="statistic-personalInfo-titles">
                <div className="statistic-personalInfo-title-icon"></div>
                Smoke
              </div>
              <div className="statistic-personalInfo-content">
                {formData.cigarettesPerDay} Cigarettes/Day
              </div>
            </div>
            <div className="statistic-personalInfo-contents">
              <div className="statistic-personalInfo-titles">
                <div className="statistic-personalInfo-title-icon"></div>
                Alcohol
              </div>
              <div className="statistic-personalInfo-content">
                {formData.drinksPerWeek} Drinks/Week
              </div>
            </div>
            <div className="statistic-personalInfo-contents">
              <div className="statistic-personalInfo-titles">
                <div className="statistic-personalInfo-title-icon"></div>
                Physical Acitivity
              </div>
              <div className="statistic-personalInfo-content">
                {formData.physicalPerWeek} Hrs/Week
              </div>
            </div>
            <div className="statistic-personalInfo-contents">
              <div className="statistic-personalInfo-titles">
                <div className="statistic-personalInfo-title-icon">
                  <svg
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#6b6b6b"
                    stroke="#6b6b6b"
                    strokeWidth="0.00024000000000000003"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <title>tomato</title>{" "}
                      <path d="M13,2a11.32,11.32,0,0,0-1,2c-.12.33-.22.66-.31,1C11.07,3.26,8.19,3.54,7,3c0,3.38,3.52,2.21,4.25,2.72C8.42,5.48,7.39,7.39,6,8c3.1,1.57,5,.06,5.72-1.84-.11.74-.65,4.92,2.28,4.84a8.14,8.14,0,0,0-1.31-4.91h.06C14,7.59,15.94,9.3,18,8a7.19,7.19,0,0,0-3.75-2.06C15.84,6,16.91,6.13,18,4a8.42,8.42,0,0,0-4.69,1c.47-.8,1.18-2,1.69-3ZM7,5c-3.91.89-5,4.23-5,8C2,18,6.47,22,12,22c4.89,0,10-2.84,10-10,0-3-1.17-6-4-7a1.88,1.88,0,0,1-1,1c.54.19,1.42,1.39,2,2-.31.81-1.8,1.52-4.34,1a9.86,9.86,0,0,1,0,3,4.07,4.07,0,0,1-4-3C8.25,10.5,4.93,8.68,5,8c.88-.61,2-1.83,3-2A2.82,2.82,0,0,1,7,5Z"></path>{" "}
                      <rect width="24" height="24" fill="none"></rect>{" "}
                    </g>
                  </svg>
                </div>
                Diet
              </div>
              <div className="statistic-personalInfo-content">
                {formData.diet}
              </div>
            </div>
            <div className="statistic-personalInfo-contents">
              <div className="statistic-personalInfo-titles">
                <div className="statistic-personalInfo-title-icon">
                  <svg
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        d="M7 6H24.1429L7 24H25"
                        stroke="#6b6b6b"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                      <path
                        d="M29 15H41L29 29H41"
                        stroke="#6b6b6b"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                      <path
                        d="M15 32H24.0476L15 42H25"
                        stroke="#6b6b6b"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                    </g>
                  </svg>
                </div>
                Sleep
              </div>
              <div className="statistic-personalInfo-content">
                {formData.sleepHours} Hrs
              </div>
            </div>
          </div>
        </div>

        <div className="statistic-performance">
          <div className="statistic-performance-container">
            <div className="statistic-performance-header">
              <div className="statistic-performance-title">Performance</div>
              {performanceIncrease && (
                <div className="statistic-performance-tag">
                  +{performanceIncrease}%
                  <div className="statistic-performance-button cursor-pointer">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        {" "}
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z"
                          fill="#e5e5e5"
                        ></path>{" "}
                      </g>
                    </svg>
                  </div>
                </div>
              )}
            </div>

            <div className="statistic-performance-mid">
              <div className="performance-graph">
                <PerformanceMeter
                  score={performanceScore}
                  maxScore={maxScore}
                />
              </div>
            </div>

            <div className="statistic-performance-footer flex items-center justify-center gap-2 whitespace-nowrap">
              <svg
                className="w-6 h-6"
                fill="#6b6b6b"
                viewBox="-8 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
                stroke="#6b6b6b"
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm80 168c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm-160 0c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm194.8 170.2C334.3 380.4 292.5 400 248 400s-86.3-19.6-114.8-53.8c-13.6-16.3 11-36.7 24.6-20.5 22.4 26.9 55.2 42.2 90.2 42.2s67.8-15.4 90.2-42.2c13.4-16.2 38.1 4.2 24.6 20.5z"></path>
                </g>
              </svg>
              <span>
                You're healthier than {healthPercentile || "0"}% people
              </span>
            </div>
          </div>

          <div className="statistic-report-container">
            <div className="statistic-report-header">
              <div className="statistic-report-title">Your Report</div>
              <div
                className="statistic-report-tag"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {isHovered
                  ? dateDisplay.time
                  : dateDisplay.date || "No Checkup"}
              </div>
            </div>

            <div className="statistic-report-footer">
              <div className="statistic-report-buttons">
                <div
                  className="statistic-report-button save-btn"
                  onClick={handleSaveReport}
                >
                  <svg
                    className="save"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        d="M4 12H20M12 4V20"
                        stroke="#0f0f0f"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                    </g>
                  </svg>
                  <svg
                    className="active-save"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        d="M4 12H20M12 4V20"
                        stroke="#e5e5e5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>{" "}
                    </g>
                  </svg>
                </div>
                <div className="statistic-report-button link-btn">
                  <svg
                    className="link"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z"
                        fill="#0f0f0f"
                      ></path>{" "}
                    </g>
                  </svg>
                  <svg
                    className="active-link"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g
                      id="SVGRepo_tracerCarrier"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></g>
                    <g id="SVGRepo_iconCarrier">
                      {" "}
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12.2929 4.29289C12.6834 3.90237 13.3166 3.90237 13.7071 4.29289L20.7071 11.2929C21.0976 11.6834 21.0976 12.3166 20.7071 12.7071L13.7071 19.7071C13.3166 20.0976 12.6834 20.0976 12.2929 19.7071C11.9024 19.3166 11.9024 18.6834 12.2929 18.2929L17.5858 13H4C3.44772 13 3 12.5523 3 12C3 11.4477 3.44772 11 4 11H17.5858L12.2929 5.70711C11.9024 5.31658 11.9024 4.68342 12.2929 4.29289Z"
                        fill="#e5e5e5"
                      ></path>{" "}
                    </g>
                  </svg>
                </div>
              </div>
              <div className="statistic-report-text">
                Recommended Diet at Last Section
              </div>
            </div>
          </div>
        </div>

        <div className="statistic-analytics">
          <div className="statistic-analytics-title">Analytics</div>

          <div className="statistic-analytics-tags">
            <div
              className="statistic-analytics-tag bp-tag active-tag"
              onClick={handleTagClick}
            >
              Blood Pressure
            </div>
            <div
              className="statistic-analytics-tag sugar-tag"
              onClick={handleTagClick}
            >
              Sugar Level
            </div>
            <div
              className="statistic-analytics-tag heart-tag"
              onClick={handleTagClick}
            >
              Heart Rate
            </div>
            <div
              className="statistic-analytics-tag performance-tag"
              onClick={handleTagClick}
            >
              Performance
            </div>
          </div>

          <div className="statistic-analytics-chart">
            <AnalyticsChart
              selectedMetric={selectedMetric}
              chartData={getChartData()}
            />
          </div>

          <div className="statistic-analytics-diet-container">
            <div className="statistic-analytics-diet protein-diet">
              <div className="statistic-analytics-diet-icon">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <rect
                      width="48"
                      height="48"
                      fill="white"
                      fillOpacity="0.01"
                    ></rect>{" "}
                    <path
                      d="M6 14H42V8H38L36 4H12L10 8H6V14Z"
                      fill="#0f0f0f"
                      stroke="#0f0f0f"
                      strokeWidth="4"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M36 44L38 14H10L12 44H36Z"
                      stroke="#0f0f0f"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                  </g>
                </svg>
              </div>
              <div className="statistic-analytics-diet-content">
                <div className="statistic-analytics-diet-title">Protein</div>
                <div className="statistic-analytics-diet-text">
                  {dietInfo.protein}
                  <span> gram</span>
                </div>
              </div>
            </div>
            <div className="statistic-analytics-diet fat-diet">
              <div className="statistic-analytics-diet-icon">
                <svg
                  viewBox="0 0 192 192"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      stroke="#0f0f0f"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="12"
                      d="M22 108a62 62 0 0 1 62-62m86 38a62.012 62.012 0 0 1-18.159 43.841A62.01 62.01 0 0 1 108 146M84 22a61.997 61.997 0 0 1 57.281 38.274A62.014 62.014 0 0 1 146 84m-38 86a62.007 62.007 0 0 1-57.28-38.274A61.999 61.999 0 0 1 46 108"
                    ></path>
                  </g>
                </svg>
              </div>
              <div className="statistic-analytics-diet-content">
                <div className="statistic-analytics-diet-title">Fat</div>
                <div className="statistic-analytics-diet-text">
                  {dietInfo.fat}
                  <span> gram</span>
                </div>
              </div>
            </div>
            <div className="statistic-analytics-diet carbs-diet">
              <div className="statistic-analytics-diet-icon">
                <svg
                  fill="#000000"
                  viewBox="0 -11 120 120"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      id="_0201-pancakes"
                      data-name="0201-pancakes"
                      d="M139.46,404.442c.039-.278-.052-.425-.239-.478a2.765,2.765,0,0,1,1.908-3.338c.788-.88,2.486-.851,3.577-1.429,2.1-.039,3.525-.381,5.246.238a5.5,5.5,0,0,1,1.193,2.383c-.789,2.948-3.984,3.489-7.393,3.815C142.27,405.288,140.343,405.387,139.46,404.442Zm-28.615-4.77v-1.43c.243-2.3,1.874-3.212,3.577-4.054a11.412,11.412,0,0,1,3.577-1.43.7.7,0,0,1,.237,0,.718.718,0,0,0,.24,0c.151-.04.229-.238.239-.239a2.169,2.169,0,0,1,.568.013,1.172,1.172,0,0,0,1.1-.251c5.153-.148,10.205-.19,10.968,4.054.019,3.834-2.856,4.776-5.485,5.961a48.3,48.3,0,0,1-9.776,1.43C113.729,402.989,111.588,402.03,110.846,399.672ZM124.061,398a5.5,5.5,0,0,0,1.57.243c.744-.449,1.776-.608,1.907-1.669a16.959,16.959,0,0,0-7.393-.239c.2,1,1.573.811,2.146,1.43q.137-.008.265-.008A5.56,5.56,0,0,1,124.061,398Zm-26.093-3.334c-1.945-.438-4.015-.753-5.246-1.907a5.612,5.612,0,0,1-3.336-3.578,5.175,5.175,0,0,1,.953-3.815c.1-1.41,1.337-1.681,1.669-2.862,1.066-.365,1.614-1.247,2.862-1.429.753-.6,1.643-1.06,1.908-2.147a4.353,4.353,0,0,0-.716-3.1c-.59-.682-1.866-.678-2.623-1.193-1.851-.693-4.053-1.035-5.246-2.385A9.521,9.521,0,0,1,87.954,367a10.725,10.725,0,0,1,3.576-3.814c1.575-.812,3.393-1.378,5.008-2.146,5.156-1.283,12.162-.716,16.692-2.624a8.623,8.623,0,0,0,4.532-5.483c.081-2.626-1.043-4.045-1.193-6.44a40.539,40.539,0,0,0-.715-6.675c.119-2.346-.342-5.27.477-6.917-.083-.871-.816-1.09-1.431-1.429-.158-.8-.742-1.166-.954-1.908a19.616,19.616,0,0,1-.239-4.531,13.884,13.884,0,0,0,1.193-2.624c.731-.46,1.078-1.3,1.669-1.908,1.248-1.215,2.845-2.083,4.054-3.338,1.71-.754,2.99-1.94,4.769-2.624,1.4-1.064,3.387-1.543,5.008-2.383a62.488,62.488,0,0,1,25.276-4.291c.385.066.41-.227.715-.239,13.916.154,25.265,2.872,34.575,7.631.382.288.689.1,1.13-.091a2.482,2.482,0,0,1,1.731-.148,19.209,19.209,0,0,1,6.678,7.63c.059,1.056.489,1.738.476,2.863.334.937.928,1.615,1.193,2.621-.187.984.365,1.226.238,2.147a9.108,9.108,0,0,1-.954,4.531c.967,1.658,2.66,2.588,2.862,5.008.027,2.173-1.045,3.247-1.908,4.529.695,1.69,1.973,2.8,2.385,4.771-.067,1.284.245,2.947-.477,3.577.085.789.715,1.033,1.192,1.429a4.557,4.557,0,0,0,.954,1.433,9.341,9.341,0,0,1,1.192,3.576,5.818,5.818,0,0,1-1.192,4.293c.173,1.336.987,2.031.715,3.816a11.135,11.135,0,0,1-3.338,6.437c-1.763.622-3.1,1.666-4.769,2.384a37.209,37.209,0,0,1-5.008,1.908,59.291,59.291,0,0,1-11.923,1.907,54.04,54.04,0,0,1-7.112.24c-1.055-.008-2.11-.017-3.141,0a6.093,6.093,0,0,0-1.269,0c-.741.05-1.481.1-1.832-.24-2.491.187-4.092-.516-6.2-.714-1.9-.4-4.315-.3-5.962-.956a13.862,13.862,0,0,1,0,5.486c-.292,1.377-1.175,2.163-1.669,3.339a30.11,30.11,0,0,1-4.293,3.337c-2.465.794-4.766,1.75-8.347,1.431a20.408,20.408,0,0,1-2.86-.716,42.057,42.057,0,0,1-9.778-5.722c-2.551-.581-5.664-1.041-8.346-.238-7.007,2.292-10.638,7.961-18.361,9.538Zm-2.861-8.824a10.535,10.535,0,0,1-.952,1.194c.477,3.1,3.7,3.448,7.392,3.337,1.354-.415,3.129-.84,4.292-1.192.084-.024.365-.422.477-.477,1.416-.7,3.322-1.459,2.622-3.577-.059-.554-.708-.517-1.357-.479a4.606,4.606,0,0,1-.787,0,32.347,32.347,0,0,1-5.963,2.146H97.968c-.955-.16-1.225-1.008-2.343-1.008A2.752,2.752,0,0,0,95.107,385.841Zm44.354-.952c-.358,2.742,2.055,2.714,3.577,3.577h3.815c.033-.269.35-.256.666-.243.1,0,.2.009.288,0,2.417-1.741,6.041-3.462,5.007-7.869a2.659,2.659,0,0,0-1.907-.478,12.425,12.425,0,0,1-5.247,5.009,1.208,1.208,0,0,0-.771.13,1.215,1.215,0,0,1-.9.108c-1.22-.032-2.328-.852-3.31-.852A1.52,1.52,0,0,0,139.46,384.889Zm-26.708-.955c-.042.838.806.786.954,1.432,2.174-.37,5.107.02,5.008-2.623a2.753,2.753,0,0,0-2.373-1C114.685,381.741,112.85,382.6,112.753,383.934Zm55.083-7.631c11.777.173,22.416-.793,31.477-3.336a20.648,20.648,0,0,1,3.1-2.386c.355-1.392,1.259-2.238,1.193-4.053-.053-.186-.2-.279-.476-.239,0,.316-.419.218-.477.478-5.747,2.758-13.024,3.986-21.461,4.054a52.082,52.082,0,0,1-11,.618c-2.363-.028-4.7-.057-6.881.1a23.845,23.845,0,0,0-4.77-.238,55.793,55.793,0,0,0-6.676-1.669c-.522.162.451.793.715.953a10.6,10.6,0,0,0,.954,1.193c.727.783.661,2.358,2.146,2.384.731.158.875-.274,1.018-.7.134-.4.268-.809.889-.726.621.414.1,1.968,1.193,1.908C161.647,375.339,164.732,375.832,167.836,376.3ZM93.2,367a5.522,5.522,0,0,0,0,3.1,2.2,2.2,0,0,0,3.816.954c.51-1.029-.376-1.687,0-2.385,1.068-1.23,3.55-2.073,2.623-4.531a5.142,5.142,0,0,0-1.5-.234C95.843,363.908,94.341,365.662,93.2,367ZM141.845,346.5c-.035,3.292,1.3,5.221.952,8.825a6.161,6.161,0,0,1-.952,1.907c-.227.727-1.161.747-1.192,1.669a3.232,3.232,0,0,1,2.384,2.861c.234,1.9-1.665,1.674-1.431,3.577,2.418.682,4.652,1.547,6.915,2.384.881-.152.867-1.2,2.146-.953a30.726,30.726,0,0,0,6.213.4,41.6,41.6,0,0,1,6.188.311h16.214c8.548-.355,16.39-1.415,23.13-3.578.852-1.054,1.829-1.986,1.908-3.816a5.105,5.105,0,0,0-1.192-3.1c-.241-.476-.413-1.02-.954-1.193.013-.182-.187-.131-.414-.081-.353.078-.77.157-.54-.635-1.244.506-1.8,1.7-3.339,1.91-.988.839-2.561,1.094-3.815,1.669a65.158,65.158,0,0,1-8.823,2.146c-5.893,1.418-12.639,1.986-19.314,2.624H155.675a1.209,1.209,0,0,1-.77-.132,1.216,1.216,0,0,0-.9-.106h-4.055c-.905-.366-2.026-.518-2.862-.955-.795-.554-2.235-.465-2.145-1.908.722-1.315,2.241-1.165,3.956-1.014a13.559,13.559,0,0,0,2.481.061q3.667.387,7.153.953c14.768-.652,28.081-2.759,39.345-6.914a10.964,10.964,0,0,1,3.577-.477,11.423,11.423,0,0,0-2.146-5.723c-2.677.661-4.766,1.912-7.631,2.385-1,.671-2.537.8-3.815,1.192a6.1,6.1,0,0,1-1.907.478c-.348.525-1.56.188-1.908.714a135.122,135.122,0,0,1-17.167,2.862h-9.062c-2.622-.4-5.445-.6-8.107-.954a4.521,4.521,0,0,0-1.908.238c-.053-.345-.5-.292-.955-.238s-.9.106-.953-.237c-1.439-.072-2.856-.165-2.861-1.67.66-2.284,3.272-.887,5.246-.714.28.036.677-.041.715.238,5.588-.454,11.919-.165,17.646-.477,3.083-.334,5.995-.841,9.061-1.193.418-.377,1.271-.32,1.908-.476a15.5,15.5,0,0,1,2.146-.478c1.221-.527,2.965-.531,4.055-1.192,2.988-.428,5.408-1.427,8.345-1.908,2.442-.977,6.079-.756,8.347-1.908a5.426,5.426,0,0,0,.239-3.1,3.388,3.388,0,0,0-.954-1.907c-.3-.358-.49-.657-.954-.478a1.209,1.209,0,0,0-.715.715c-1.29.856-2.992,1.3-4.054,2.386-.911.122-1.283.783-2.146.952-.688.425-1.8.428-2.385.955-3.714.576-6.66,1.923-10.491,2.384-6.928,1.736-15.024,2.3-23.846,2.147-3.37-.365-7.13-.343-10.492-.716-1-.08-1.412-.741-2.488-.741A2.949,2.949,0,0,0,141.845,346.5Zm-23.369,2.863c.284.987.469,2.074.715,3.1v3.816a26.956,26.956,0,0,1-1.669,4.292c-.143,1.451-1.671,3.231-.477,4.531,2.015.187,2.117-1.541,2.385-3.1,1.6-1.422,2.332-3.707,2.861-6.2v-1.908c-.318-1.112-.369-2.492-.954-3.338-.426-1.084-.414-2.6-1.193-3.338l-.109,0C118.8,347.21,118.792,348.44,118.476,349.359Zm26.23-7.393c-.36.437-1.029.563-1.431.954-.173.524-1.119.792-.477,1.43a4.215,4.215,0,0,0,2.479-.031,7.325,7.325,0,0,1,1.814-.206c9.455-.323,19.529-.024,27.9-1.43a88.047,88.047,0,0,0,12.163-2.624c2.131-.329,3.458-1.469,5.245-2.145a41.051,41.051,0,0,1,4.769-2.624,8.928,8.928,0,0,0,1.669-4.531c-.239,0-.284-.193-.477-.239a1.714,1.714,0,0,0-.715.477c-1.417.491-2.15,1.668-3.577,2.147-3.323.73-5.929,2.179-9.061,3.1a8.177,8.177,0,0,0-2.385.716,5.281,5.281,0,0,0-2.384.716c-1.11-.077-1.592.476-2.623.476-.591.445-1.822.247-2.385.716-3.568.487-6.775,1.333-10.492,1.669-4.911.878-11.137.374-16.453.238A21.858,21.858,0,0,0,144.706,341.966Zm-23.368-8.584c-.053.185-.006.471-.239.477.42,1.805,1.861,2.591,2.861,3.816,1.062.368,1.655,1.206,2.862,1.43.77.742,2.228.793,3.1,1.431a25.852,25.852,0,0,1,3.338.955c1.525.014,3.219.2,3.338-1.193-.051-1.7-1.6-1.9-2.624-2.623-1.334-.5-3.048-.608-4.053-1.432-.817.085-1.251-.454-1.67-.477-.248-.012-.137-.2-.238-.237a10.982,10.982,0,0,1-2.384-.954,5.7,5.7,0,0,0-3.578-1.431h-.04A1.131,1.131,0,0,0,121.337,333.382Zm51.506-13.116a10.4,10.4,0,0,1,.239,6.917c-2.132,3.591-8.766,2.68-12.638,4.531-.268,1.083-.377,2.325-.715,3.338-.293.5-.66.93-.953,1.431-.319.426-1.473.645-.954,1.193a141.3,141.3,0,0,0,21.222-3.34c.587-.445,1.633-.432,2.384-.714a11.991,11.991,0,0,1,2.386-.716,27.476,27.476,0,0,0,4.53-1.668c3.2-.934,6.184-2.083,8.346-4.055.262-2.488-.73-3.721-1.43-5.246-3.369-.924-4.816-3.77-8.107-4.769-.562.2.657.587.238,1.431.1.891-.19,1.4-.954,1.431-1.252.138-1.6-.626-1.669-1.67-.041-1.027,1.768-1.1,1.193-1.907a7.974,7.974,0,0,1-2.623-.954,7.427,7.427,0,0,1-2.862-.715c-2.133-.251-4.158-.612-6.2-.954-4.168-.6-8.746-.791-13.115-1.193H151.144c-.3.014-.33.307-.715.238a55.9,55.9,0,0,0-20.984,4.293,38.917,38.917,0,0,0-4.055,2.147c-1.54.607-2.5,1.789-4.054,2.385-1.8,2-5.459,3.911-3.815,7.869,1.071-.282,1.155-1.548,2.146-1.907.438-.995,1.676-1.188,2.146-2.147,1.054-.378,1.675-1.187,2.623-1.669.822-.61,1.849-1.013,2.623-1.67a34.389,34.389,0,0,1,13.829-3.338H145.9a5.992,5.992,0,0,0,3.577.716c3.661-1.585,6.687-3.806,11.446-4.292C166.461,315.363,170.8,316.67,172.843,320.266ZM150.483,336.86c.2.144.931.288.9-.14h-.477c-.056,0-.106,0-.151,0C150.42,336.716,150.384,336.788,150.483,336.86Zm-6.254-2.764v.479c.49,1.658,2.86,1.432,4.531,1.907h2.146c2.341-.839,4.652-1.706,4.531-5.007-.186-.053-.277-.2-.239-.479a4.912,4.912,0,0,0-1.431-.715c-.052.186-.2.277-.477.238-1.047.464-1.18,1.842-2.384,2.146a1.133,1.133,0,0,0-.715.238,10.172,10.172,0,0,1-2.362-.083,14.625,14.625,0,0,0-1.573-.124C145.237,332.7,144.446,332.972,144.229,334.1Zm18.123-12.16c1.53.536,1.475,2.658,4.055,2.146.489-.464,1.163-.744,1.191-1.669-.466-2.077-2.169-2.917-3.814-3.815-.292,0-.589,0-.886-.005a12.98,12.98,0,0,0-3.407.243c-1.12.47-2.394.785-2.146,2.624.185.053.276.2.238.477.815.685,1.778.453,2.823.22a7.484,7.484,0,0,1,1.628-.234C162.139,321.923,162.245,321.927,162.352,321.936Zm-9.3-.238c-.346.145.026.287,0,0a.653.653,0,0,0,.715-.478h-.033A.645.645,0,0,0,153.051,321.7Zm23.369,7.392c.629-2.1,4.7-1.015,4.769.952a1.561,1.561,0,0,1-1.606,1.145A3.581,3.581,0,0,1,176.421,329.09Zm8.584-3.1c.02-.339.041-.675-.238-.715.4-1.939,4.8-3.643,5.245-.716-.157,1.34-1.646,2.03-3.048,2.03A3.107,3.107,0,0,1,185,325.99Zm-6.915-5.007c-.1-.817.714-.717.953-1.193a1.828,1.828,0,0,1,2.146,1.669c.1.815-.715.716-.954,1.192C178.973,322.641,178.158,322.186,178.09,320.983Zm-36.722-5.723c.277-1.733,3.227-1.359,3.1.477.017.811-.7.886-1.193,1.191h-.088A1.643,1.643,0,0,1,141.368,315.26Z"
                      transform="translate(-87.707 -307.629)"
                    ></path>{" "}
                  </g>
                </svg>
              </div>
              <div className="statistic-analytics-diet-content">
                <div className="statistic-analytics-diet-title">Carbs</div>
                <div className="statistic-analytics-diet-text">
                  {dietInfo.carbs}
                  <span> gram</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistic;
