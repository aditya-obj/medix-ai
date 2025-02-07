// pages/assessment.js
'use client'
import React, { useState } from "react";
import '@/app/styles/assessment.css'

export default function Assessment() {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    location: "",
    familyDiabetes: "",
    familyHypertension: "",
    familyCardiovascular: "",
    smoking: "",
    alcohol: "",
    physicalActivity: "",
    diet: "",
    sleep: "",
    weight: "",
    height: "",
    bloodPressure: "",
    bloodSugar: "",
    cholesterol: "",
    diabetes: "",
    hypertension: "",
    cardiovascular: "",
    stress: "",
    mentalHealth: "",
    medications: "",
    allergies: "",
    pregnancy: "",
    otherGeneticConditions: "",
    cigarettesPerDay: "",
    drinksPerWeek: "",
    sleepHours: "",
    weightUnit: "kg",
    heightUnit: "cm",
    systolic: "",
    diastolic: "",
    diagnosedDiabetes: "",
    diagnosedHypertension: "",
    diagnosedCardiovascular: "",
    otherConditions: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Send formData to the backend or AI model for processing
    console.log(formData);
  };

  return (
    <div className="assessment-container">
      <form onSubmit={handleSubmit}>
        {/* Demographic Information */}
        <div className="question">
          <h2 className="question-header">Demographic Information</h2>
          <div className="answer-options">
            <div className="form-group">
              <div className="form-group-inner">
                <label>Age:</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Gender:</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="form-control"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="form-control"
                placeholder="Enter your city/region"
              />
            </div>
          </div>
        </div>

        {/* Family Medical History */}
        <div className="question">
          <h2 className="question-header">Family Medical History</h2>
          <div className="answer-options">
            {['diabetes', 'hypertension', 'cardiovascular'].map((condition) => (
              <div key={condition} className="form-group radio-group">
                <div className="form-group-inner">
                  <label>{`Family History of ${condition.charAt(0).toUpperCase() + condition.slice(1)}:`}</label>
                  <div className="radio-options">
                    <label>
                      <input
                        type="radio"
                        value="yes"
                        checked={formData[`family${condition.charAt(0).toUpperCase() + condition.slice(1)}`] === "yes"}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          [`family${condition.charAt(0).toUpperCase() + condition.slice(1)}`]: e.target.value 
                        })}
                      /> Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="no"
                        checked={formData[`family${condition.charAt(0).toUpperCase() + condition.slice(1)}`] === "no"}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          [`family${condition.charAt(0).toUpperCase() + condition.slice(1)}`]: e.target.value 
                        })}
                      /> No
                    </label>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="form-group">
              <div className="form-group-inner">
                <label>Other Genetic Conditions:</label>
                <textarea
                  className="form-control"
                  placeholder="Please list any other hereditary diseases in your family (optional)"
                  value={formData.otherGeneticConditions}
                  onChange={(e) => setFormData({ ...formData, otherGeneticConditions: e.target.value })}
                  rows="3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lifestyle Habits */}
        <div className="question">
          <h2 className="question-header">Lifestyle Habits</h2>
          <div className="answer-options">
            {/* Smoking Habits */}
            <div className="form-group">
              <div className="form-group-inner">
                <label>Do you smoke?</label>
                <div className="radio-options">
                  <label>
                    <input
                      type="radio"
                      value="yes"
                      checked={formData.smoking === "yes"}
                      onChange={(e) => setFormData({ ...formData, smoking: e.target.value })}
                    /> Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="no"
                      checked={formData.smoking === "no"}
                      onChange={(e) => setFormData({ ...formData, smoking: e.target.value })}
                    /> No
                  </label>
                </div>
                {formData.smoking === "yes" && (
                  <div className="conditional-input">
                    <label>How many cigarettes per day?</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formData.cigarettesPerDay}
                      onChange={(e) => setFormData({ ...formData, cigarettesPerDay: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Alcohol Consumption */}
            <div className="form-group">
              <div className="form-group-inner">
                <label>Do you consume alcohol?</label>
                <div className="radio-options">
                  <label>
                    <input
                      type="radio"
                      value="yes"
                      checked={formData.alcohol === "yes"}
                      onChange={(e) => setFormData({ ...formData, alcohol: e.target.value })}
                    /> Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="no"
                      checked={formData.alcohol === "no"}
                      onChange={(e) => setFormData({ ...formData, alcohol: e.target.value })}
                    /> No
                  </label>
                </div>
                {formData.alcohol === "yes" && (
                  <div className="conditional-input">
                    <label>How many drinks per week?</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formData.drinksPerWeek}
                      onChange={(e) => setFormData({ ...formData, drinksPerWeek: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Physical Activity Level */}
            <div className="form-group">
              <div className="form-group-inner">
                <label>Physical Activity Level:</label>
                <select
                  className="form-control"
                  value={formData.physicalActivity}
                  onChange={(e) => setFormData({ ...formData, physicalActivity: e.target.value })}
                >
                  <option value="">Select frequency</option>
                  <option value="never">Never</option>
                  <option value="1-2">1-2 times/week</option>
                  <option value="3-5">3-5 times/week</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
            </div>

            {/* Dietary Patterns */}
            <div className="form-group">
              <div className="form-group-inner">
                <label>Dietary Patterns:</label>
                <select
                  className="form-control"
                  value={formData.diet}
                  onChange={(e) => setFormData({ ...formData, diet: e.target.value })}
                >
                  <option value="">Select diet type</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non-vegetarian">Non-vegetarian</option>
                  <option value="high-carb">High-carb</option>
                  <option value="low-carb">Low-carb</option>
                  <option value="vegan">Vegan</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Sleep Patterns */}
            <div className="form-group">
              <div className="form-group-inner">
                <label>Average hours of sleep per night:</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  className="form-control"
                  value={formData.sleepHours}
                  onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                  placeholder="Enter hours"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Self-Reported Health Metrics */}
        <div className="question">
          <h2 className="question-header">Self-Reported Health Metrics</h2>
          <div className="answer-options">
            {/* Weight */}
            <div className="form-group">
              <div className="form-group-inner">
                <label>Weight:</label>
                <div className="input-wrapper">
                  <div className="measurement-input">
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                    <select
                      className="form-control unit-select"
                      value={formData.weightUnit}
                      onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Height */}
            <div className="form-group">
              <div className="form-group-inner">
                <label>Height:</label>
                <div className="input-wrapper">
                  <div className="measurement-input">
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    />
                    <select
                      className="form-control unit-select"
                      value={formData.heightUnit}
                      onChange={(e) => setFormData({ ...formData, heightUnit: e.target.value })}
                    >
                      <option value="cm">cm</option>
                      <option value="ft">ft</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Blood Pressure */}
            <div className="form-group">
              <div className="form-group-inner">
                <label>Blood Pressure:</label>
                <div className="blood-pressure-input">
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={formData.systolic}
                    onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                    placeholder="Systolic"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={formData.diastolic}
                    onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                    placeholder="Diastolic"
                  />
                  <span>mmHg</span>
                </div>
              </div>
            </div>

            {/* Blood Sugar Level */}
            <div className="form-group">
              <div className="form-group-inner">
                <label>Blood Sugar Level (mg/dL):</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={formData.bloodSugar}
                  onChange={(e) => setFormData({ ...formData, bloodSugar: e.target.value })}
                  placeholder="Enter blood sugar level"
                />
              </div>
            </div>

            {/* Cholesterol Level */}
            <div className="form-group">
              <div className="form-group-inner">
                <label>Cholesterol Level (mg/dL):</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={formData.cholesterol}
                  onChange={(e) => setFormData({ ...formData, cholesterol: e.target.value })}
                  placeholder="Enter cholesterol level"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Existing Medical Conditions */}
        <div className="question">
          <h2 className="question-header">Existing Medical Conditions</h2>
          <div className="answer-options">
            {['diabetes', 'hypertension', 'cardiovascular'].map((condition) => (
              <div key={condition} className="form-group radio-group">
                <div className="form-group-inner">
                  <label>{`Have you been diagnosed with ${condition === 'cardiovascular' ? 'heart disease or stroke' : condition}?`}</label>
                  <div className="radio-options">
                    <label>
                      <input
                        type="radio"
                        value="yes"
                        checked={formData[`diagnosed${condition.charAt(0).toUpperCase() + condition.slice(1)}`] === "yes"}
                        onChange={(e) => setFormData({
                          ...formData,
                          [`diagnosed${condition.charAt(0).toUpperCase() + condition.slice(1)}`]: e.target.value
                        })}
                      /> Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="no"
                        checked={formData[`diagnosed${condition.charAt(0).toUpperCase() + condition.slice(1)}`] === "no"}
                        onChange={(e) => setFormData({
                          ...formData,
                          [`diagnosed${condition.charAt(0).toUpperCase() + condition.slice(1)}`]: e.target.value
                        })}
                      /> No
                    </label>
                  </div>
                </div>
              </div>
            ))}

            {/* Other Chronic Conditions */}
            <div className="form-group">
              <div className="form-group-inner">
                <label>Other Chronic Conditions:</label>
                <textarea
                  className="form-control"
                  value={formData.otherConditions}
                  onChange={(e) => setFormData({ ...formData, otherConditions: e.target.value })}
                  placeholder="Please list any other chronic conditions (e.g., asthma, kidney disease)"
                  rows="3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Questions */}
        <div className="question">
          <h2 className="question-header">Additional Questions</h2>
          <div className="answer-options">
            {/* Medication Use */}
            <div className="form-group required">
              <div className="form-group-inner">
                <label>Current Medications:</label>
                <textarea
                  className="form-control"
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  placeholder="Please list any medications you are currently taking (write 'None' if not taking any)"
                  rows="3"
                  required
                />
              </div>
            </div>

            {/* Allergies */}
            <div className="form-group required">
              <div className="form-group-inner">
                <label>Allergies:</label>
                <textarea
                  className="form-control"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="Please list any allergies to food or medication (write 'None' if no allergies)"
                  rows="3"
                  required
                />
              </div>
            </div>

            {/* Pregnancy Status - Only show if gender is female */}
            {formData.gender === 'female' && (
              <div className="form-group required radio-group">
                <div className="form-group-inner">
                  <label>Are you currently pregnant?</label>
                  <div className="radio-options">
                    <label>
                      <input
                        type="radio"
                        value="yes"
                        checked={formData.pregnancy === "yes"}
                        onChange={(e) => setFormData({ ...formData, pregnancy: e.target.value })}
                        required
                      /> Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="no"
                        checked={formData.pregnancy === "no"}
                        onChange={(e) => setFormData({ ...formData, pregnancy: e.target.value })}
                        required
                      /> No
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="submit-button">Submit Assessment</button>
      </form>
    </div>
  );
}