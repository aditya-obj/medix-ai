"use client";
import React, { useState, useEffect } from "react";
import "@/app/styles/check.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Page = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    location: "",
    weight: "",
    height: "",
    age: "",
    smoking: "no",
    cigarettesPerDay: "",
    alcohol: "no",
    drinksPerWeek: "",
    physicalActivity: "no",
    hoursPerWeek: "",
    sleepHours: "",
    diet: "veg",
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.gender) newErrors.gender = "Please select your gender";
        if (!formData.location.trim())
          newErrors.location = "Location is required";
        if (!formData.weight) newErrors.weight = "Weight is required";
        if (!formData.height) newErrors.height = "Height is required";
        if (!formData.age) newErrors.age = "Age is required";
        break;
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
        if (!formData.bloodPressure)
          newErrors.bloodPressure = "Blood pressure is required";
        if (!formData.heartRate) newErrors.heartRate = "Heart rate is required";
        if (!formData.sugarLevel)
          newErrors.sugarLevel = "Sugar level is required";
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
      case "weight":
        return value > 0;
      case "height":
        return value > 0;
      case "age":
        return value > 0 && value < 150;
      case "sleepHours":
        return value >= 0 && value <= 24;
      case "bloodPressure":
        return value.trim().length > 0;
      case "heartRate":
        return value > 0;
      case "sugarLevel":
        return value > 0;
      default:
        return true;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    const isValid = validateField(name, value);
    setValidFields((prev) => ({
      ...prev,
      [name]: isValid,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setIsSubmitting(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Form submitted successfully:", {
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          smoking: formData.smoking,
          cigarettesPerDay: formData.cigarettesPerDay,
          alcohol: formData.alcohol,
          drinksPerWeek: formData.drinksPerWeek,
          physicalActivity: formData.physicalActivity,
          hoursPerWeek: formData.hoursPerWeek,
          sleepHours: formData.sleepHours,
          diet: formData.diet,
          bloodPressure: formData.bloodPressure,
          heartRate: formData.heartRate,
          sugarLevel: formData.sugarLevel,
          disease: formData.disease,
          medication: formData.medication,
          allergies: formData.allergies,
          familyDiabetes: formData.familyDiabetes,
          familyHypertension: formData.familyHypertension,
          familyCardio: formData.familyCardio,
          geneticCondition: formData.geneticCondition,
        });
        toast.success(
          "Form submitted successfully! We'll analyze your health data.",
          {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
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

  return (
    <>
      <ToastContainer />
      <div className="page-container">
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
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      name="name"
                      className={`form-input ${errors.name ? "error" : ""} ${
                        validFields.name ? "success" : ""
                      }`}
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <span className="error-message">{errors.name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      name="gender"
                      className={`form-input ${errors.gender ? "error" : ""} ${
                        validFields.gender ? "success" : ""
                      }`}
                      value={formData.gender}
                      onChange={handleChange}
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
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      name="location"
                      className={`form-input ${
                        errors.location ? "error" : ""
                      } ${validFields.location ? "success" : ""}`}
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter your location"
                    />
                    {errors.location && (
                      <span className="error-message">{errors.location}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Weight (kg)</label>
                    <input
                      type="number"
                      name="weight"
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
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
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
                      }`}
                      placeholder="120/80"
                      value={formData.bloodPressure}
                      onChange={handleChange}
                    />
                    {errors.bloodPressure && (
                      <span className="error-message">
                        {errors.bloodPressure}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      name="heartRate"
                      className={`form-input ${
                        errors.heartRate ? "error" : ""
                      }`}
                      value={formData.heartRate}
                      onChange={handleChange}
                    />
                    {errors.heartRate && (
                      <span className="error-message">{errors.heartRate}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sugar Level</label>
                    <input
                      type="number"
                      name="sugarLevel"
                      className={`form-input ${
                        errors.sugarLevel ? "error" : ""
                      }`}
                      value={formData.sugarLevel}
                      onChange={handleChange}
                    />
                    {errors.sugarLevel && (
                      <span className="error-message">{errors.sugarLevel}</span>
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
                    rows="3"
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
                    rows="3"
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
                    rows="3"
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
                    rows="3"
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

        <div className="image-side">
          <div className="image-overlay">
            <h2>
              Health <span>Risk</span> Assessment
            </h2>
            <p>
              Take a proactive step towards understanding your health profile.
              Our comprehensive assessment analyzes your lifestyle and medical
              history to provide personalized insights for a healthier future.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
