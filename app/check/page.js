"use client";
import React, { useState, useEffect, useCallback } from "react";
import "@/app/styles/check.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ref, get, set } from "firebase/database";
import { db } from "@/components/firebase.config";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/components/firebase.config";
import LoadingProgress from "@/components/LoadingProgress";

const GeminiPrompt = (formData) => {
  return `
    As a healthcare expert, please analyze the following patient data and provide a **comprehensive health assessment report** addressed directly to the patient.
    
    **Patient Profile:**
    - Name: ${formData.name}
    - Age: ${formData.age}
    - Gender: ${formData.gender}
    - Weight: ${formData.weight} kg
    - Height: ${formData.height} cm
    - Location: ${formData.location}
    
    **Lifestyle Factors:**
    - Smoking: ${formData.smoking} ${
    formData.smoking === "yes"
      ? `(${formData.cigarettesPerDay} cigarettes/day)`
      : ""
  }
    - Alcohol Consumption: ${formData.alcohol} ${
    formData.alcohol === "yes" ? `(${formData.drinksPerWeek} drinks/week)` : ""
  }
    - Physical Activity: ${formData.physicalActivity} ${
    formData.physicalActivity === "yes"
      ? `(${formData.hoursPerWeek} hours/week)`
      : ""
  }
    - Sleep Duration: ${formData.sleepHours} hours/day
    - Diet Type: ${formData.diet}
    - **Water Intake:** ${formData.waterIntake} liters/day
    
    **Medical Information:**
    - Blood Pressure: ${formData.bloodPressure}
    - Heart Rate: ${formData.heartRate} bpm
    - Blood Sugar Level: ${formData.sugarLevel}
    - Existing Conditions: ${formData.disease || "None"}
    - Current Medications: ${formData.medication || "None"}
    - Allergies: ${formData.allergies || "None"}
    
    **Family History:**
    - Diabetes: ${formData.familyDiabetes}
    - Hypertension: ${formData.familyHypertension}
    - Cardiovascular Disease: ${formData.familyCardio}
    - Genetic Conditions: ${formData.geneticCondition || "None"}
    
    **Please generate a patient health report with the following structure:**
    
    **[Patient Health Report]**
    - Start with a **personalized greeting**, addressing the patient by name.
    - Clearly **explain their current health status** based on their metrics.
    - Use **an easy-to-understand tone** that feels like a doctor or health coach is speaking to them directly.
    
    **Key Sections of the Report:**
    
    1. **Overall Health Score:** A score out of 500 based on health metrics (**Format:** 444)
    2. **Health Percentile Ranking:** How healthy the patient is compared to the general population (**Format:** 92%)
    3. **Health Overview:** A summary of their current health, highlighting strengths and areas of concern.
    4. **Personalized Health Tips:** Practical recommendations to improve their well-being.
    5. **Precautionary Measures:** Any necessary precautions based on their risk factors.
    6. **Ways to Improve:** A plan for enhancing health metrics.
    7. **Recommended Diet Plan:** A tailored nutrition guide based on their diet type and health conditions.
    8. **Exercise Plan:** A customized fitness routine including:
    - Frequency (days per week)
    - Duration (minutes per session)
    - Types of exercises (cardio, strength training, flexibility, etc.)
    - Intensity level (low, moderate, high)
    - Any modifications based on health conditions.
    9. **Protien Intake:** How much protein the patient should consume based on their weight and activity level in grams, don't give it in range give it in exact value (**Format:** 100)
    10. **Fat Intake:** How much fat the patient should consume based on their weight and activity level in grams, don't give it in range give it in exact value (**Format:** 100)
    11. **Carbs Intake:** How much carbs the patient should consume based on their weight and activity level in grams, don't give it in range give it in exact value (**Format:** 100)
    
    **Important:**
    - The report should be formatted **professionally and clearly**.
    - Use **simple, encouraging language** to keep the patient engaged.
    - End with a **positive note**, encouraging the patient to take actionable steps toward better health.
    `;
};

const numPrompt = (result) => {
  return `${result}

    Extract only the Health Score, Health Percentile Ranking, Protien Intake, Fat Intake, Carbs Intake from this report.
    Return the result strictly in this format: score,percentile,protien,fat,carbs (e.g., 444,92,100,100,100).
    
    Do NOT include any extra text, spaces, or line breaks. Only return the numeric values in the exact format.
    `;
};

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const DEBOUNCE_DELAY = 500; // 500ms delay

const Check = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [errors, setErrors] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readOnlyFields, setReadOnlyFields] = useState({
    name: false,
    gender: false,
    location: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    location: "",
    weight: "",
    height: "",
    age: "",
    smoking: "no",
    waterIntake: "",
    cigarettesPerDay: "",
    alcohol: "no",
    drinksPerWeek: "",
    physicalActivity: "no",
    hoursPerWeek: "",
    sleepHours: "",
    diet: "vegetarian",
    bloodPressure: "",
    heartRate: "",
    sugarLevel: "",
    disease: "",
    medication: "",
    allergies: "",
    familyDiabetes: "no",
    familyHypertension: "no",
    familyCardio: "no",
    geneticCondition: "",
  });

  const [validFields, setValidFields] = useState({});
  const [debouncedTimer, setDebouncedTimer] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.push("/");
          return;
        }

        const uid = user.uid;
        let hasExistingData = {
          name: false,
          gender: false,
          location: false,
        };

        // Initialize userData object
        let userData = {};

        // Fetch name
        const nameRef = ref(db, `users/${uid}/name`);
        const nameSnapshot = await get(nameRef);
        if (nameSnapshot.exists()) {
          userData.name = nameSnapshot.val();
          hasExistingData.name = true;
        }

        // Fetch personal data
        const personalRef = ref(db, `users/${uid}/personal`);
        const personalSnapshot = await get(personalRef);

        if (personalSnapshot.exists()) {
          const personalData = personalSnapshot.val();
          if (personalData.gender) {
            hasExistingData.gender = true;
          }
          if (personalData.location) {
            hasExistingData.location = true;
          }
          userData = {
            ...userData,
            gender: personalData.gender || "",
            location: personalData.location || "",
            weight: personalData.weight || "",
            height: personalData.height || "",
            age: personalData.age || "",
            smoking: personalData.smoking || "no",
            waterIntake: personalData.waterIntake || "",
            cigarettesPerDay: personalData.cigarettesPerDay || "",
            alcohol: personalData.alcohol || "no",
            drinksPerWeek: personalData.drinksPerWeek || "",
            physicalActivity: personalData.physicalActivity || "no",
            hoursPerWeek: personalData.hoursPerWeek || "",
            sleepHours: personalData.sleepHours || "",
            diet: personalData.diet || "vegetarian",
            disease: personalData.disease || "",
            medication: personalData.medication || "",
            allergies: personalData.allergies || "",
          };
        }

        // Fetch family data
        const familyRef = ref(db, `users/${uid}/family`);
        const familySnapshot = await get(familyRef);

        if (familySnapshot.exists()) {
          const familyData = familySnapshot.val();
          userData = {
            ...userData,
            familyDiabetes: familyData.familyDiabetes || "no",
            familyHypertension: familyData.familyHypertension || "no",
            familyCardio: familyData.familyCardio || "no",
            geneticCondition: familyData.geneticCondition || "",
          };
        }

        // Update form data with fetched values
        setFormData((prevData) => ({
          ...prevData,
          ...userData,
        }));

        // Validate pre-filled fields
        Object.keys(userData).forEach((field) => {
          const isValid = validateField(field, userData[field]);
          setValidFields((prev) => ({
            ...prev,
            [field]: isValid,
          }));
        });

        // Set which fields should be read-only
        setReadOnlyFields(hasExistingData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        // Redirect to home page if not authenticated
        router.push("/");
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        const step1Fields = [
          "name",
          "gender",
          "location",
          "waterIntake",
          "weight",
          "height",
          "age",
        ];
        return step1Fields.every((field) => {
          const isValid = validateField(field, formData[field]);
          if (!isValid) {
            newErrors[field] = `Please enter a valid ${field
              .replace(/([A-Z])/g, " $1")
              .toLowerCase()}`;
          }
          return isValid;
        });
      case 2:
        if (formData.smoking === "yes" && !formData.cigarettesPerDay) {
          newErrors.cigarettesPerDay = "Please specify number of cigarettes";
        }
        if (formData.alcohol === "yes" && !formData.drinksPerWeek) {
          newErrors.drinksPerWeek = "Please specify number of drinks";
        }
        if (formData.physicalActivity === "yes" && !formData.hoursPerWeek) {
          newErrors.hoursPerWeek = "Please specify hours of activity";
        }
        if (!formData.sleepHours) newErrors.sleepHours = "Sleep hours required";
        break;
      case 3:
        const isValidBP = validateField(
          "bloodPressure",
          formData.bloodPressure
        );
        const isValidHR = validateField("heartRate", formData.heartRate);
        const isValidSugar = validateField("sugarLevel", formData.sugarLevel);

        if (!isValidBP)
          newErrors.bloodPressure =
            "Blood pressure is required (format: systolic/diastolic)";
        if (!isValidHR) newErrors.heartRate = "Heart rate is required";
        if (!isValidSugar) newErrors.sugarLevel = "Sugar level is required";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim().length > 0;
      case "gender":
        return value.trim().length > 0;
      case "location":
        return value.trim().length > 0;
      case "waterIntake":
        return value > 0 && value <= 10;
      case "weight":
        return value > 0;
      case "height":
        return value > 0;
      case "age":
        return value > 0 && value < 150;
      case "sleepHours":
        return value >= 0 && value <= 24;
      case "bloodPressure":
        if (!value || !value.trim()) return false;
        if (!value.includes("/")) return false;
        const [systolic, diastolic] = value.split("/").map(Number);
        if (isNaN(systolic) || isNaN(diastolic)) return false;
        return (
          systolic >= 70 &&
          systolic <= 200 &&
          diastolic >= 40 &&
          diastolic <= 130
        );
      case "heartRate":
        const hr = Number(value);
        return hr >= 40 && hr <= 200;
      case "sugarLevel":
        const sugar = parseFloat(value);
        return sugar >= 50 && sugar <= 400;
      default:
        return true;
    }
  };

  // Add this function to handle textarea auto-resize
  const handleTextAreaInput = (e) => {
    const textarea = e.target;
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";
    // Set the height to scrollHeight to fit the content
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Add this function to handle blood pressure input formatting
  const handleBloodPressureChange = (e) => {
    let value = e.target.value;
    // Only allow numbers and forward slash
    value = value.replace(/[^\d/]/g, "");

    // Prevent multiple slashes
    if ((value.match(/\//g) || []).length > 1) {
      return;
    }

    // Limit the length of numbers before and after slash
    const parts = value.split("/");
    if (parts[0] && parts[0].length > 3) {
      parts[0] = parts[0].slice(0, 3);
    }
    if (parts[1] && parts[1].length > 3) {
      parts[1] = parts[1].slice(0, 3);
    }
    value = parts.join("/");

    setFormData((prev) => ({
      ...prev,
      bloodPressure: value,
    }));
  };

  // Update the handleChange function
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Always update the display value immediately
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear previous timer
    if (debouncedTimer) {
      clearTimeout(debouncedTimer);
    }

    // For empty values, just clear and validate
    if (!value || value === '') {
      setValidFields(prev => ({
        ...prev,
        [name]: false
      }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
      return;
    }

    // For number inputs, handle min/max after delay
    if (e.target.type === 'number') {
      const newTimer = setTimeout(() => {
        const min = parseFloat(e.target.min);
        const max = parseFloat(e.target.max);
        let newValue = parseFloat(value);

        if (!isNaN(newValue)) {
          if (newValue < min) newValue = min;
          if (newValue > max) newValue = max;

          setFormData(prev => ({
            ...prev,
            [name]: newValue.toString()
          }));

          const isValid = validateField(name, newValue);
          setValidFields(prev => ({
            ...prev,
            [name]: isValid
          }));
        }
      }, DEBOUNCE_DELAY);

      setDebouncedTimer(newTimer);
      return;
    }

    // For other inputs, validate after delay
    const newTimer = setTimeout(() => {
      const isValid = validateField(name, value);
      setValidFields(prev => ({
        ...prev,
        [name]: isValid
      }));
    }, DEBOUNCE_DELAY);

    setDebouncedTimer(newTimer);

    // Auto-resize if it's a textarea
    if (e.target.tagName.toLowerCase() === 'textarea') {
      handleTextAreaInput(e);
    }
  };

  // Add useEffect to initialize textarea heights
  useEffect(() => {
    // Get all textareas
    const textareas = document.querySelectorAll("textarea.form-input");
    textareas.forEach((textarea) => {
      // Set initial height
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  }, [formData]); // Re-run when formData changes

  // Update the preventMinus function to also prevent 'e'
  const preventMinus = (e) => {
    if (e.code === "Minus" || e.code === "KeyE") {
      e.preventDefault();
    }
  };

  // Add onKeyPress handler to prevent 'e' more reliably
  const preventE = (e) => {
    if (e.key === "e" || e.key === "E") {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setIsSubmitting(true);
      setLoadingProgress(0); // Initial loading state
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          throw new Error("User not authenticated");
        }

        const uid = user.uid;

        // Generate and process Gemini content first
        const prompt = GeminiPrompt(formData);
        const result = await model.generateContent(prompt);
        const report = result.response.text();
        const timestamp = Date.now();

        setLoadingProgress(33); // Starting AI analysis
        // Store the report in /healthReport with timestamp
        await set(ref(db, `users/${uid}/healthReport`), {
          timestamp: timestamp,
          report: report,
        });

        const numResult = await model.generateContent(numPrompt(report));
        const [performance, healthPercentile, protien, fat, carbs] =
          numResult.response.text().split(",");

        setLoadingProgress(66); // Processing report

        // Get current timestamp
        const currentTimestamp = Date.now();

        // Update timestamps array
        const timestampsRef = ref(db, `users/${uid}/timestamps`);
        const timestampsSnapshot = await get(timestampsRef);
        let timestamps = [];

        if (timestampsSnapshot.exists()) {
          timestamps = timestampsSnapshot.val();
        }
        timestamps.push(currentTimestamp);
        await set(timestampsRef, timestamps);

        // Store personal data
        const personalRef = ref(db, `users/${uid}/personal`);
        const personalSnapshot = await get(personalRef);
        const personalData = {
          gender: formData.gender,
          location: formData.location,
          weight: formData.weight,
          height: formData.height,
          age: formData.age,
          smoking: formData.smoking,
          waterIntake: formData.waterIntake,
          cigarettesPerDay: formData.cigarettesPerDay,
          alcohol: formData.alcohol,
          drinksPerWeek: formData.drinksPerWeek,
          physicalPerWeek: formData.hoursPerWeek,
          sleepHours: formData.sleepHours,
          diet: formData.diet,
          disease: formData.disease,
          medication: formData.medication,
          allergies: formData.allergies,
        };

        // Only update changed fields for personal data
        if (personalSnapshot.exists()) {
          const currentData = personalSnapshot.val();
          const updates = {};
          Object.entries(personalData).forEach(([key, value]) => {
            if (currentData[key] !== value) {
              updates[key] = value;
            }
          });
          if (Object.keys(updates).length > 0) {
            await set(personalRef, { ...currentData, ...updates });
          }
        } else {
          await set(personalRef, personalData);
        }

        // Store family data
        const familyRef = ref(db, `users/${uid}/family`);
        const familySnapshot = await get(familyRef);
        const familyData = {
          familyDiabetes: formData.familyDiabetes,
          familyHypertension: formData.familyHypertension,
          familyCardio: formData.familyCardio,
          geneticCondition: formData.geneticCondition,
        };

        // Only update changed fields for family data
        if (familySnapshot.exists()) {
          const currentData = familySnapshot.val();
          const updates = {};
          Object.entries(familyData).forEach(([key, value]) => {
            if (currentData[key] !== value) {
              updates[key] = value;
            }
          });
          if (Object.keys(updates).length > 0) {
            await set(familyRef, { ...currentData, ...updates });
          }
        } else {
          await set(familyRef, familyData);
        }

        // Store details with timestamp
        const detailsData = {
          bloodPressure: formData.bloodPressure,
          heartRate: formData.heartRate,
          sugarLevel: formData.sugarLevel,
          performance: performance,
          healthPercentile: healthPercentile,
          protien: protien,
          fat: fat,
          carbs: carbs,
        };

        // Store each detail with timestamp
        for (const [key, value] of Object.entries(detailsData)) {
          await set(
            ref(db, `users/${uid}/details/${key}/${currentTimestamp}`),
            value
          );
        }
        setLoadingProgress(100); // Finishing up

        console.log("Data successfully stored in Firebase");
        toast.success(
          "Form submitted successfully! We'll analyze your health data.",
          {
            position: "top-center",
            autoClose: 1500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            onClose: () => {
              router.push("/analysis");
            },
          }
        );
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Something went wrong. Please try again.", {
          position: "top-center",
          autoClose: 3000,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error("Please fill in all required fields", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Add cleanup in useEffect
  useEffect(() => {
    return () => {
      if (debouncedTimer) {
        clearTimeout(debouncedTimer);
      }
    };
  }, [debouncedTimer]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <>
      {isSubmitting && (
        <LoadingProgress
          progress={loadingProgress}
          stage={
            loadingProgress === 0
              ? "Saving data..."
              : loadingProgress === 33
              ? "Analyzing report..."
              : loadingProgress === 66
              ? "Structuring data..."
              : "Finishing up..."
          }
        />
      )}
      <ToastContainer />
      <div className="page-container default-padding">
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        <div className="form-side">
          <div className="form-container">
            <h1 className="form-title">Health Risk Assessment</h1>
            <div className="steps-indicator">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`step ${currentStep >= step ? "active" : ""}`}
                >
                  <div className="step-number">{step}</div>
                  <div className="step-label">
                    {step === 1 && "Personal"}
                    {step === 2 && "Lifestyle"}
                    {step === 3 && "Medical"}
                    {step === 4 && "Family"}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div
                className={`form-section ${currentStep === 1 ? "active" : ""}`}
              >
                <h2 className="form-section-title">
                  <span className="section-number">1</span>
                  Personal Info
                </h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Name*</label>
                    <input
                      type="text"
                      name="name"
                      className={`form-input ${errors.name ? "error" : ""} ${
                        readOnlyFields.name ? "readonly" : ""
                      }`}
                      value={formData.name}
                      onChange={handleChange}
                      readOnly={readOnlyFields.name}
                    />
                    {errors.name && (
                      <span className="error-message">{errors.name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender*</label>
                    <select
                      name="gender"
                      className={`form-input ${errors.gender ? "error" : ""} ${
                        readOnlyFields.gender ? "readonly" : ""
                      }`}
                      value={formData.gender}
                      onChange={handleChange}
                      disabled={readOnlyFields.gender}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <span className="error-message">{errors.gender}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location*</label>
                    <input
                      type="text"
                      name="location"
                      className={`form-input ${
                        errors.location ? "error" : ""
                      } ${readOnlyFields.location ? "readonly" : ""}`}
                      value={formData.location}
                      onChange={handleChange}
                      readOnly={readOnlyFields.location}
                    />
                    {errors.location && (
                      <span className="error-message">{errors.location}</span>
                    )}
                  </div>

                  {/* Add Water Intake Input */}
                  <div className="form-group">
                    <label className="form-label">
                      Water Intake (liters/day)*
                    </label>
                    <input
                      type="number"
                      name="waterIntake"
                      onKeyDown={preventMinus}
                      onKeyPress={preventE}
                      className={`form-input ${
                        errors.waterIntake ? "error" : ""
                      }`}
                      value={formData.waterIntake}
                      onChange={handleChange}
                      min="1"
                      max="14"
                      step="0.1"
                      placeholder="Enter daily water intake"
                    />
                    {errors.waterIntake && (
                      <span className="error-message">
                        {errors.waterIntake}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
                      min="2"
                      max="2000"
                      onKeyDown={preventMinus}
                      onKeyPress={preventE}
                      className={`form-input ${errors.weight ? "error" : ""} ${
                        validFields.weight ? "success" : ""
                      }`}
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="Enter your weight"
                    />
                    {errors.weight && (
                      <span className="error-message">{errors.weight}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Height (cm)</label>
                    <input
                      type="number"
                      name="height"
                      onKeyDown={preventMinus}
                      onKeyPress={preventE}
                      min="30"
                      max="300"
                      className={`form-input ${errors.height ? "error" : ""} ${
                        validFields.height ? "success" : ""
                      }`}
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="Enter your height"
                    />
                    {errors.height && (
                      <span className="error-message">{errors.height}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      name="age"
                      onKeyDown={preventMinus}
                      onKeyPress={preventE}
                      min="5"
                      max="120"
                      className={`form-input ${errors.age ? "error" : ""} ${
                        validFields.age ? "success" : ""
                      }`}
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Enter your age"
                    />
                    {errors.age && (
                      <span className="error-message">{errors.age}</span>
                    )}
                  </div>
                </div>
                <div className="navigation-buttons">
                  <button
                    type="button"
                    className="nav-button prev-button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <span className="button-icon">←</span>
                    Previous
                  </button>
                  {currentStep === totalSteps ? (
                    <button
                      type="submit"
                      className="nav-button next-button"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span>Submitting...</span>
                      ) : (
                        <span>Submit</span>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="nav-button next-button"
                      onClick={nextStep}
                    >
                      Next
                      <span className="button-icon">→</span>
                    </button>
                  )}
                </div>
              </div>

              <div
                className={`form-section ${currentStep === 2 ? "active" : ""}`}
              >
                <h2 className="form-section-title">
                  <span className="section-number">2</span>
                  Personal Background
                </h2>
                <div className="form-group">
                  <label className="form-label">Do you smoke?</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="smoking"
                        value="yes"
                        checked={formData.smoking === "yes"}
                        onChange={handleChange}
                      />
                      Yes
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="smoking"
                        value="no"
                        checked={formData.smoking === "no"}
                        onChange={handleChange}
                      />
                      No
                    </label>
                  </div>
                  {formData.smoking === "yes" && (
                    <div className="conditional-input">
                      <input
                        type="number"
                        name="cigarettesPerDay"
                        onKeyDown={preventMinus}
                        onKeyPress={preventE}
                        min="0"
                        max="50"
                        className={`form-input ${
                          errors.cigarettesPerDay ? "error" : ""
                        }`}
                        placeholder="Number of cigarettes per day"
                        value={formData.cigarettesPerDay}
                        onChange={handleChange}
                      />
                      {errors.cigarettesPerDay && (
                        <span className="error-message">
                          {errors.cigarettesPerDay}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Do you drink alcohol?</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="alcohol"
                        value="yes"
                        checked={formData.alcohol === "yes"}
                        onChange={handleChange}
                      />
                      Yes
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="alcohol"
                        value="no"
                        checked={formData.alcohol === "no"}
                        onChange={handleChange}
                      />
                      No
                    </label>
                  </div>
                  {formData.alcohol === "yes" && (
                    <div className="conditional-input">
                      <input
                        type="number"
                        name="drinksPerWeek"
                        onKeyDown={preventMinus}
                        onKeyPress={preventE}
                        min="0"
                        max="200"
                        className={`form-input ${
                          errors.drinksPerWeek ? "error" : ""
                        }`}
                        placeholder="Number of drinks per week"
                        value={formData.drinksPerWeek}
                        onChange={handleChange}
                      />
                      {errors.drinksPerWeek && (
                        <span className="error-message">
                          {errors.drinksPerWeek}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Physical Activity</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="physicalActivity"
                        value="yes"
                        checked={formData.physicalActivity === "yes"}
                        onChange={handleChange}
                      />
                      Yes
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="physicalActivity"
                        value="no"
                        checked={formData.physicalActivity === "no"}
                        onChange={handleChange}
                      />
                      No
                    </label>
                  </div>
                  {formData.physicalActivity === "yes" && (
                    <div className="conditional-input">
                      <input
                        type="number"
                        name="hoursPerWeek"
                        onKeyDown={preventMinus}
                        onKeyPress={preventE}
                        min="0"
                        max="200"
                        className={`form-input ${
                          errors.hoursPerWeek ? "error" : ""
                        }`}
                        placeholder="Hours per week"
                        value={formData.hoursPerWeek}
                        onChange={handleChange}
                      />
                      {errors.hoursPerWeek && (
                        <span className="error-message">
                          {errors.hoursPerWeek}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Sleep (hours per day)</label>
                  <input
                    type="number"
                    name="sleepHours"
                    onKeyDown={preventMinus}
                    onKeyPress={preventE}
                    min="1"
                    max="24"
                    className={`form-input ${
                      errors.sleepHours ? "error" : ""
                    } ${validFields.sleepHours ? "success" : ""}`}
                    value={formData.sleepHours}
                    onChange={handleChange}
                    placeholder="Enter your sleep hours"
                  />
                  {errors.sleepHours && (
                    <span className="error-message">{errors.sleepHours}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Diet</label>
                  <select
                    name="diet"
                    className={`form-input ${errors.diet ? "error" : ""} ${
                      validFields.diet ? "success" : ""
                    }`}
                    value={formData.diet}
                    onChange={handleChange}
                  >
                    <option value="vegetarian">Vegetarian</option>
                    <option value="non-vegetarian">Non-Vegetarian</option>
                    <option value="mixed">Mixed</option>
                  </select>
                  {errors.diet && (
                    <span className="error-message">{errors.diet}</span>
                  )}
                </div>
                <div className="navigation-buttons">
                  <button
                    type="button"
                    className="nav-button prev-button"
                    onClick={prevStep}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="nav-button next-button"
                    onClick={nextStep}
                  >
                    Next
                  </button>
                </div>
              </div>

              <div
                className={`form-section ${currentStep === 3 ? "active" : ""}`}
              >
                <h2 className="form-section-title">
                  <span className="section-number">3</span>
                  Medical Information
                </h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      Blood Pressure (sys/dia)
                    </label>
                    <input
                      type="text"
                      name="bloodPressure"
                      className={`form-input ${
                        errors.bloodPressure ? "error" : ""
                      } ${
                        formData.bloodPressure &&
                        formData.bloodPressure.includes("/") &&
                        formData.bloodPressure.split("/").length === 2 &&
                        !errors.bloodPressure
                          ? "normal-range"
                          : formData.bloodPressure
                          ? "out-of-range"
                          : ""
                      }`}
                      placeholder="120/80 (Normal Range)"
                      value={formData.bloodPressure}
                      onChange={handleChange}
                      maxLength={7}
                    />
                    {errors.bloodPressure && (
                      <span className="error-message">
                        {errors.bloodPressure}
                      </span>
                    )}
                    {formData.bloodPressure && (
                      <span
                        className={`range-indicator ${
                          formData.bloodPressure.includes("/") &&
                          formData.bloodPressure.split("/").length === 2
                            ? "normal"
                            : "high"
                        }`}
                      >
                        {formData.bloodPressure.includes("/") &&
                        formData.bloodPressure.split("/").length === 2
                          ? "Normal range is between 90/60 and 120/80"
                          : "Please enter in format: systolic/diastolic (e.g., 120/80)"}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      name="heartRate"
                      onKeyDown={preventMinus}
                      onKeyPress={preventE}
                      min="40"
                      max="200"
                      className={`form-input ${
                        errors.heartRate ? "error" : ""
                      } ${
                        formData.heartRate &&
                        formData.heartRate >= 60 &&
                        formData.heartRate <= 100
                          ? "normal-range"
                          : formData.heartRate
                          ? "out-of-range"
                          : ""
                      }`}
                      value={formData.heartRate}
                      onChange={handleChange}
                      placeholder="60-100 (Normal Range)"
                    />
                    {errors.heartRate && (
                      <span className="error-message">{errors.heartRate}</span>
                    )}
                    {formData.heartRate &&
                      formData.heartRate.toString().length > 0 && (
                        <span
                          className={`range-indicator ${
                            formData.heartRate.toString().length < 2
                              ? "info"
                              : formData.heartRate >= 60 &&
                                formData.heartRate <= 100
                              ? "normal"
                              : formData.heartRate < 60
                              ? "low"
                              : "high"
                          }`}
                        >
                          {formData.heartRate.toString().length < 2
                            ? "Please enter complete heart rate"
                            : formData.heartRate >= 60 &&
                              formData.heartRate <= 100
                            ? "Normal"
                            : formData.heartRate < 60
                            ? "Low Heart Rate"
                            : "High Heart Rate"}
                        </span>
                      )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sugar Level</label>
                    <input
                      type="number"
                      name="sugarLevel"
                      onKeyDown={preventMinus}
                      onKeyPress={preventE}
                      min="50"
                      max="400"
                      className={`form-input ${
                        errors.sugarLevel ? "error" : ""
                      } ${
                        formData.sugarLevel &&
                        validateField("sugarLevel", formData.sugarLevel)
                          ? "normal-range"
                          : formData.sugarLevel
                          ? "out-of-range"
                          : ""
                      }`}
                      value={formData.sugarLevel}
                      onChange={handleChange}
                      placeholder="120 (Normal Range)"
                    />
                    {errors.sugarLevel && (
                      <span className="error-message">{errors.sugarLevel}</span>
                    )}
                    {formData.sugarLevel && !errors.sugarLevel && (
                      <>
                        <span
                          className={`range-indicator ${
                            validateField("sugarLevel", formData.sugarLevel)
                              ? "normal"
                              : parseFloat(formData.sugarLevel) < 80
                              ? "low"
                              : "high"
                          }`}
                        >
                          {validateField("sugarLevel", formData.sugarLevel)
                            ? "Normal"
                            : parseFloat(formData.sugarLevel) < 80
                            ? "Low"
                            : "High"}
                        </span>
                        <span className="info-message">
                          Normal range is between 80 and 120 mg/dL
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Disease (if any)</label>
                  <textarea
                    name="disease"
                    className={`form-input ${errors.disease ? "error" : ""}`}
                    value={formData.disease}
                    onChange={handleChange}
                    onInput={handleTextAreaInput}
                    rows="1"
                  />
                  {errors.disease && (
                    <span className="error-message">{errors.disease}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Medication (if any)</label>
                  <textarea
                    name="medication"
                    className={`form-input ${errors.medication ? "error" : ""}`}
                    value={formData.medication}
                    onChange={handleChange}
                    onInput={handleTextAreaInput}
                    rows="1"
                  />
                  {errors.medication && (
                    <span className="error-message">{errors.medication}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Allergies (if any)</label>
                  <textarea
                    name="allergies"
                    className={`form-input ${errors.allergies ? "error" : ""}`}
                    value={formData.allergies}
                    onChange={handleChange}
                    onInput={handleTextAreaInput}
                    rows="1"
                  />
                  {errors.allergies && (
                    <span className="error-message">{errors.allergies}</span>
                  )}
                </div>
                <div className="navigation-buttons">
                  <button
                    type="button"
                    className="nav-button prev-button"
                    onClick={prevStep}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="nav-button next-button"
                    onClick={nextStep}
                  >
                    Next
                  </button>
                </div>
              </div>

              <div
                className={`form-section ${currentStep === 4 ? "active" : ""}`}
              >
                <h2 className="form-section-title">
                  <span className="section-number">4</span>
                  Family Background
                </h2>
                <div className="form-group">
                  <label className="form-label">
                    Family History of Diabetes
                  </label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="familyDiabetes"
                        value="yes"
                        checked={formData.familyDiabetes === "yes"}
                        onChange={handleChange}
                      />
                      Yes
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="familyDiabetes"
                        value="no"
                        checked={formData.familyDiabetes === "no"}
                        onChange={handleChange}
                      />
                      No
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Family History of Hypertension
                  </label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="familyHypertension"
                        value="yes"
                        checked={formData.familyHypertension === "yes"}
                        onChange={handleChange}
                      />
                      Yes
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="familyHypertension"
                        value="no"
                        checked={formData.familyHypertension === "no"}
                        onChange={handleChange}
                      />
                      No
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Family History of Cardiovascular Disease
                  </label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="familyCardio"
                        value="yes"
                        checked={formData.familyCardio === "yes"}
                        onChange={handleChange}
                      />
                      Yes
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="familyCardio"
                        value="no"
                        checked={formData.familyCardio === "no"}
                        onChange={handleChange}
                      />
                      No
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Genetic Condition (if any)
                  </label>
                  <textarea
                    name="geneticCondition"
                    className={`form-input ${
                      errors.geneticCondition ? "error" : ""
                    }`}
                    value={formData.geneticCondition}
                    onChange={handleChange}
                    onInput={handleTextAreaInput}
                    rows="1"
                  />
                  {errors.geneticCondition && (
                    <span className="error-message">
                      {errors.geneticCondition}
                    </span>
                  )}
                </div>
                <div className="navigation-buttons">
                  <button
                    type="button"
                    className="nav-button prev-button"
                    onClick={prevStep}
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    className="nav-button next-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <span>Submit</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div
          className={`image-side ${
            currentStep === 1
              ? "personal active"
              : currentStep === 2
              ? "lifestyle active"
              : currentStep === 3
              ? "medical active"
              : currentStep === 4
              ? "family active"
              : ""
          }`}
        >
          <div className="image-overlay">
            <h2>Health Assessment</h2>
            {currentStep === 1 && (
              <>
                <h3>Personal Information</h3>
                <p>
                  Let's start with the basics. Your personal details help us
                  create a foundation for your health profile, enabling us to
                  provide tailored recommendations that match your individual
                  characteristics.
                </p>
              </>
            )}
            {currentStep === 2 && (
              <>
                <h3>Lifestyle Habits</h3>
                <p>
                  Your daily habits shape your health. Understanding your
                  lifestyle choices helps us identify potential risk factors and
                  opportunities for positive changes that can enhance your
                  overall well-being.
                </p>
              </>
            )}
            {currentStep === 3 && (
              <>
                <h3>Medical Overview</h3>
                <p>
                  Your medical history provides crucial insights into your
                  health patterns. This information helps us assess current
                  health status and identify preventive measures for better
                  health outcomes.
                </p>
              </>
            )}
            {currentStep === 4 && (
              <>
                <h3>Family Background</h3>
                <p>
                  Understanding your family health history is key to identifying
                  potential genetic predispositions. This helps us provide more
                  accurate risk assessments and preventive recommendations.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Check;
