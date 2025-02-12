"use client";
import React from "react";
import "@/app/styles/footer.css";
import { FaTwitter, FaLinkedinIn, FaGithub, FaInstagram } from "react-icons/fa";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-brand">
            <h3 className="footer-logo">Medix AI</h3>
            <p>
            Our platform uses advanced AI to analyze your health data and provide personalized insights. Get actionable recommendations, track trends over time, and securely access downloadable reports. Take control of your health with confidence.
            </p>
            <div className="footer-social">
              <a
                href="#"
                className="social-icon"
                aria-label="Follow us on Twitter"
              >
                <FaTwitter />
              </a>
              <a
                href="#"
                className="social-icon"
                aria-label="Connect with us on LinkedIn"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="#"
                className="social-icon"
                aria-label="View our GitHub repository"
              >
                <FaGithub />
              </a>
              <a
                href="#"
                className="social-icon"
                aria-label="Follow us on Instagram"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          <div className="footer-columns-container">
            <div className="footer-column">
              <h3>Services</h3>
              <a href="/#services-component">Health Reports</a>
              <a href="/#services-component">AI Predictions</a>
              <a href="/#services-component">Data Security</a>
              <a href="/#services-component">Trend Tracking</a>
            </div>
            <div className="footer-column">
            <h3>Company</h3>
            <a href="#">About Us</a>
            <a href="#">How It Works</a>
            <a href="#">Our Mission</a>
            <a href="#">Get Support</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Medix AI. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
