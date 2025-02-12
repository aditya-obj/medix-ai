'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../app/styles/modernFaq.css';
import { BsPalette2, BsBarChart, BsPencilSquare, BsWindow, BsBrush, BsStars } from 'react-icons/bs';
import { HiChevronDown } from 'react-icons/hi';

const faqData = [
  {
    question: "How does the Disease Risk Prediction platform work?",
    answer:
      "Our platform uses advanced AI algorithms to analyze the data you provide through a simple form. The AI processes this information to predict potential health risks and generates a detailed report with actionable insights for better health management.",
    icon: <BsPalette2 />,
  },
  {
    question: "What kind of data do I need to provide for the analysis?",
    answer:
      "You’ll be asked to fill out a form with basic health information such as age, lifestyle habits, medical history, and other relevant factors. This data helps our AI model assess your risk profile accurately and provide personalized recommendations.",
    icon: <BsBarChart />,
  },
  {
    question: "Can I download and save my health reports?",
    answer:
      "Yes! After the analysis is complete, you can download your comprehensive health report in PDF format. You can also access and view your saved reports anytime by logging into your account.",
    icon: <BsPencilSquare />,
  },
  {
    question: "Is my personal health data secure on your platform?",
    answer:
      "Absolutely! We prioritize your privacy and use robust encryption and authentication measures to ensure your sensitive health data is stored securely. Your information is never shared without your consent.",
    icon: <BsWindow />,
  },
  {
    question: "How accurate are the predictions made by the AI?",
    answer:
      "Our AI models are trained on vast datasets and validated by healthcare experts to ensure high accuracy. While the predictions provide valuable insights, they are not a substitute for professional medical advice. Always consult a healthcare provider for diagnosis or treatment.",
    icon: <BsBrush />,
  },
  {
    question: "Can I track changes in my health risks over time?",
    answer:
      "Yes! Our platform allows you to monitor trends in your health risks over time. By regularly updating your data and running new analyses, you can track improvements or identify areas that need attention.",
    icon: <BsStars />,
  },
];

const FAQItem = ({ question, answer, icon, isOpen, onClick }) => {
  const contentRef = useRef(null);
  
  return (
    <div className="faq-item" onClick={onClick}>
      <motion.div 
        className="faq-question"
        animate={{ marginBottom: isOpen ? "1rem" : "0" }}
        transition={{ duration: 0.2 }}
      >
        <div className="question-content">
          <motion.div 
            className="faq-icon-wrapper"
            animate={{ 
              backgroundColor: isOpen ? '#4b9bff' : '#eef6ff',
              color: isOpen ? '#ffffff' : '#4b9bff'
            }}
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
          <h3>{question}</h3>
        </div>
        <motion.div
          className="faq-toggle"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <HiChevronDown />
        </motion.div>
      </motion.div>
      <motion.div
        className="faq-answer"
        initial={false}
        animate={{
          height: isOpen ? contentRef.current?.scrollHeight || "auto" : 0,
          opacity: isOpen ? 1 : 0,
          marginTop: isOpen ? "1.25rem" : 0
        }}
        transition={{
          height: { duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] },
          opacity: { duration: 0.15, delay: isOpen ? 0.05 : 0 }
        }}
      >
        <div ref={contentRef} className="faq-answer-content">
          <p>{answer}</p>
        </div>
      </motion.div>
    </div>
  );
};

const ModernFAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleClick = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <motion.div
          className="faq-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <div className="faq-title-underline"></div>
          <p className="faq-subtitle">Learn more about our comprehensive design and marketing services</p>
        </motion.div>
        <div className="faq-list">
          {faqData.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              icon={faq.icon}
              isOpen={openIndex === index}
              onClick={() => handleClick(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModernFAQ;
