"use client";
import React from "react";
import {
  FaCode,
  FaSearch,
  FaPenNib,
  FaPalette,
  FaRobot,
  FaGlobe,
  FaChartBar,
  FaIndustry,
  FaUserCog,
  FaPallet,
} from "react-icons/fa";
import { BsGrid1X2Fill } from "react-icons/bs";
import { MdEdit } from "react-icons/md";
import { TbLayoutDashboard } from "react-icons/tb";
import { BiWorld } from "react-icons/bi";
import { AiOutlineSetting } from "react-icons/ai";

import { motion } from "framer-motion";
import "@/app/styles/services.css";

const ServicesPage = () => {
  const services = [
    {
      icon: <FaCode />,
      title: "Personalized Health Risk Assessment",
      description:
        "Get a detailed analysis of your disease risk based on personalized data inputs, empowering you to take proactive health measures.",
      colorClass: "bg-lime",
    },
    {
      icon: <FaSearch />,
      title: "AI-Powered Predictive Analysis",
      description:
        "Leverage cutting-edge AI technology to predict potential health risks and provide actionable insights for better decision-making.",
      colorClass: "bg-blue",
    },
    {
      icon: <FaPenNib />,
      title: "Downloadable Health Reports",
      description:
        "Access and download comprehensive health reports anytime, ensuring you have your critical health data at your fingertips.",
      colorClass: "bg-purple",
    },
    {
      icon: <FaPallet />,
      title: "Secure Data Storage",
      description:
        "Store your health data securely in our database, allowing you to view and manage your reports whenever needed.",
      colorClass: "bg-orange",
    },
    {
      icon: <FaRobot />,
      title: "Robust User Authentication",
      description:
        "Ensure the privacy and security of your health information with advanced authentication features protecting your account.",
      colorClass: "bg-pink",
    },
    {
      icon: <FaGlobe />,
      title: "Comprehensive Risk Trends",
      description:
        "Track changes in your health risk over time with easy-to-understand visualizations and trend analysis.",
      colorClass: "bg-teal",
    },
    {
      icon: <FaChartBar />,
      title: "Proactive Health Monitoring",
      description:
        "Stay ahead of potential health issues by regularly monitoring your risk factors and receiving timely recommendations.",
      colorClass: "bg-indigo",
    },
    {
      icon: <FaIndustry />,
      title: "Personalized Recommendations",
      description:
        "Receive tailored advice and preventive measures based on your unique health profile and risk assessment results.",
      colorClass: "bg-amber",
    },
    {
      icon: <FaUserCog />,
      title: "Privacy-Centric Design",
      description:
        "Your data is handled with utmost care, adhering to strict privacy standards to safeguard your sensitive health information.",
      colorClass: "bg-emerald",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.02,
      y: -5,
      boxShadow: "0px 8px 20px rgba(0,0,0,0.1)",
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div id="services-component">
      <motion.div
        className="services-container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="services-header" variants={headerVariants}>
          <h2 className="services-title">Our Palette of Expertise</h2>
        </motion.div>

        <motion.div className="services-page-grid" variants={containerVariants}>
          {services.map((service, index) => (
            <motion.div
              key={index}
              className={`service-card ${service.colorClass}`}
              variants={cardVariants}
              whileHover="hover"
              whileTap={{ scale: 0.95 }}
            >
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ServicesPage;
