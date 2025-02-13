"use client";
import React from 'react';
import '@/app/styles/loading-progress.css';

const LoadingProgress = ({ progress, stage }) => {
  const stages = {
    0: "Saving data...",
    33: "Analyzing report...",
    66: "Structuring data...",
    100: "Finishing up..."
  };

  return (
    <div className="loading-progress-container">
      <div className="loading-progress-spinner"></div>
      <div className="loading-progress-bar">
        <div 
          className="loading-progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="loading-progress-text">{stage}</p>
      <p className="loading-progress-percent">{progress}%</p>
    </div>
  );
};

export default LoadingProgress; 