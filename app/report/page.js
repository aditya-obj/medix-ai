"use client";
import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { ref, get } from "firebase/database";
import { db } from "@/components/firebase.config";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { IoArrowBack } from "react-icons/io5";
import { FaRegCalendarAlt, FaDownload } from "react-icons/fa";
import { motion } from "framer-motion";
import { pdf } from "@react-pdf/renderer";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { htmlToText } from "html-to-text";
import "@/app/styles/report.css";

// Register fonts for PDF
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

Font.register({
  family: "RobotoBold",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
});

// PDF styles
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Roboto",
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottom: "2pt solid #3182ce",
    paddingBottom: 10,
  },
  headerLogo: {
    fontSize: 24,
    fontFamily: "RobotoBold",
    color: "#3182ce",
    marginBottom: 8,
    textAlign: "center",
  },
  title: {
    fontSize: 20,
    marginBottom: 8,
    color: "#2d3748",
    textAlign: "center",
    fontFamily: "RobotoBold",
  },
  date: {
    fontSize: 10,
    color: "#4a5568",
    textAlign: "right",
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "RobotoBold",
    marginBottom: 8,
    color: "#2c5282",
    backgroundColor: "#f7fafc",
    padding: "6 10",
    borderRadius: 4,
  },
  scoreSection: {
    marginVertical: 15,
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingHorizontal: 4,
  },
  scoreLabel: {
    flex: 1,
    color: "#4a5568",
    fontSize: 12,
    fontFamily: "RobotoBold",
  },
  scoreValue: {
    flex: 1,
    textAlign: "right",
    fontFamily: "RobotoBold",
    color: "#3182ce",
    fontSize: 12,
  },
  paragraph: {
    marginBottom: 8,
    textAlign: "justify",
    color: "#2d3748",
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 4,
    paddingLeft: 15,
  },
  bullet: {
    width: 10,
    fontSize: 11,
  },
  listItemContent: {
    flex: 1,
    paddingLeft: 5,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    borderTop: "1pt solid #e2e8f0",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 9,
    color: "#718096",
    textAlign: "center",
  },
  patientInfo: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f7fafc",
    borderRadius: 4,
  },
  patientInfoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  patientInfoLabel: {
    width: "30%",
    color: "#4a5568",
    fontSize: 10,
    fontFamily: "RobotoBold",
  },
  patientInfoValue: {
    flex: 1,
    color: "#2d3748",
    fontSize: 10,
  },
});

// PDF Document Component
const PDFDocument = ({ report, date }) => {
  // Parse the report content to extract sections
  const parseReport = (content) => {
    const sections = {};
    let currentSection = "";
    let currentContent = [];
    let introText = [];
    let isIntro = false;

    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.match(/^[-_\s]*$/)); // Remove empty lines and separator lines

    lines.forEach((line) => {
      if (line.startsWith("Dear")) {
        sections["greeting"] = line;
        isIntro = true;
      } else if (line.startsWith("**") && line.endsWith("**")) {
        if (isIntro && introText.length > 0) {
          sections["introduction"] = introText;
          isIntro = false;
        }
        if (currentSection && currentContent.length > 0) {
          sections[currentSection] = currentContent;
        }
        currentSection = line.replace(/\*\*/g, "").trim();
        currentContent = [];
      } else if (isIntro) {
        const cleanLine = line.replace(/\*/g, "").trim();
        if (cleanLine && !cleanLine.match(/^Patient Health Report$/i)) {
          introText.push(cleanLine);
        }
      } else if (currentSection) {
        const cleanLine = line.replace(/\*/g, "").trim();
        if (cleanLine) {
          currentContent.push(cleanLine);
        }
      }
    });

    // Save the last section
    if (currentSection && currentContent.length > 0) {
      sections[currentSection] = currentContent;
    }
    // Save intro if we have any remaining
    if (isIntro && introText.length > 0) {
      sections["introduction"] = introText;
    }

    return sections;
  };

  const sections = parseReport(report);

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.headerLogo}>MEDIX</Text>
          <Text style={pdfStyles.title}>Health Assessment Report</Text>
          <Text style={pdfStyles.date}>{date}</Text>
        </View>

        <View style={pdfStyles.content}>
          {/* Greeting and Introduction */}
          {sections.greeting && (
            <View style={[pdfStyles.section, { marginBottom: 10 }]}>
              <Text style={[pdfStyles.paragraph, { fontFamily: "RobotoBold" }]}>
                {sections.greeting}
              </Text>
            </View>
          )}

          {sections.introduction && sections.introduction.length > 0 && (
            <View style={[pdfStyles.section, { marginBottom: 20 }]}>
              {sections.introduction.map((para, index) => (
                <Text key={index} style={pdfStyles.paragraph}>
                  {para}
                </Text>
              ))}
            </View>
          )}

          {/* Health Scores */}
          {(sections["1. Overall Health Score"] ||
            sections["2. Health Percentile Ranking"]) && (
            <View style={pdfStyles.scoreSection}>
              {sections["1. Overall Health Score"] &&
                sections["1. Overall Health Score"].length > 0 && (
                  <View style={pdfStyles.scoreRow}>
                    <Text style={pdfStyles.scoreLabel}>
                      Overall Health Score
                    </Text>
                    <Text style={pdfStyles.scoreValue}>
                      {sections["1. Overall Health Score"][0].replace(
                        /[^\d/]/g,
                        ""
                      )}
                    </Text>
                  </View>
                )}
              {sections["2. Health Percentile Ranking"] &&
                sections["2. Health Percentile Ranking"].length > 0 && (
                  <View style={pdfStyles.scoreRow}>
                    <Text style={pdfStyles.scoreLabel}>Health Percentile</Text>
                    <Text style={pdfStyles.scoreValue}>
                      {sections["2. Health Percentile Ranking"][0].replace(
                        /[^\d%]/g,
                        ""
                      )}
                    </Text>
                  </View>
                )}
            </View>
          )}

          {/* Health Overview */}
          {sections["3. Health Overview"] &&
            sections["3. Health Overview"].length > 0 && (
              <View style={pdfStyles.section}>
                <Text style={pdfStyles.sectionTitle}>Health Overview</Text>
                {sections["3. Health Overview"].map((paragraph, index) => (
                  <Text key={index} style={pdfStyles.paragraph}>
                    {paragraph}
                  </Text>
                ))}
              </View>
            )}

          {/* Other Sections */}
          {Object.entries(sections).map(([title, content]) => {
            if (
              ![
                "greeting",
                "introduction",
                "Patient Health Report",
                "1. Overall Health Score",
                "2. Health Percentile Ranking",
                "3. Health Overview",
              ].includes(title) &&
              Array.isArray(content) &&
              content.length > 0
            ) {
              const sectionTitle = title.replace(/^\d+\.\s/, "");
              return (
                <View style={pdfStyles.section} key={title}>
                  <Text style={pdfStyles.sectionTitle}>{sectionTitle}</Text>
                  {content.map((item, index) => {
                    if (item.includes(":")) {
                      const [label, value] = item.split(":");
                      return (
                        <View style={pdfStyles.scoreRow} key={index}>
                          <Text style={pdfStyles.scoreLabel}>
                            {label.trim()}
                          </Text>
                          <Text
                            style={[pdfStyles.scoreValue, { color: "#2d3748" }]}
                          >
                            {value.trim()}
                          </Text>
                        </View>
                      );
                    } else {
                      return (
                        <Text key={index} style={pdfStyles.paragraph}>
                          {item}
                        </Text>
                      );
                    }
                  })}
                </View>
              );
            }
          })}
        </View>

        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerText}>
            Generated by Medix - Your Trusted Health Companion
          </Text>
          <Text style={[pdfStyles.footerText, { marginTop: 4 }]}>
            Report Generated on: {date}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

const Report = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          router.push("/");
          return;
        }

        const reportsRef = ref(db, `users/${user.uid}/reports`);
        const snapshot = await get(reportsRef);

        if (snapshot.exists()) {
          const reportsData = snapshot.val();
          const reportsArray = Object.entries(reportsData)
            .map(([timestamp, data]) => ({
              timestamp: parseInt(timestamp),
              ...data,
            }))
            .sort((a, b) => b.timestamp - a.timestamp);

          setReports(reportsArray);
          if (reportsArray.length > 0) {
            setSelectedReport(reportsArray[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [router]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const downloadPDF = async () => {
    if (!selectedReport) return;

    try {
      const blob = await pdf(
        <PDFDocument
          report={selectedReport.report}
          date={formatDate(selectedReport.timestamp)}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Medix_Health_Report_${formatDate(
        selectedReport.timestamp
      ).replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="report-loading">
        <div className="report-loading-spinner"></div>
        <p>Medix AI</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="report-empty">
        <div className="report-empty-icon">📋</div>
        <h2>No Reports Found</h2>
        <p>You haven't saved any health reports yet.</p>
        <div className="report-empty-buttons">
          <button
            onClick={() => router.push("/check")}
            className="report-empty-button"
          >
            Get Your Health Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="report-container default-padding"
    >
      

      <div className="report-content-wrapper">
        <div className="report-sidebar">
          <h2>
          <button onClick={() => router.push("/")} className="back-button">
            <IoArrowBack />
          </button>
            Saved Reports
            </h2>
          <div className="report-list">
            {reports.map((report) => (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={report.timestamp}
                className={`report-item ${
                  selectedReport?.timestamp === report.timestamp ? "active" : ""
                }`}
                onClick={() => setSelectedReport(report)}
              >
                <div className="report-item-content">
                  <div className="report-item-left">
                    <div className="report-item-date">
                      <FaRegCalendarAlt className="calendar-icon" />

                      {formatDate(report.timestamp)}
                    </div>
                    <div className="report-item-status">
                      {selectedReport?.timestamp === report.timestamp
                        ? "Current Report"
                        : "Click to view"}
                    </div>
                  </div>
                  <div className="report-item-icon">
                    {selectedReport?.timestamp === report.timestamp
                      ? <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 15H21M3 19H15M3 7H11M3 11H11M19.4 11H16.6C16.0399 11 15.7599 11 15.546 10.891C15.3578 10.7951 15.2049 10.6422 15.109 10.454C15 10.2401 15 9.96005 15 9.4V6.6C15 6.03995 15 5.75992 15.109 5.54601C15.2049 5.35785 15.3578 5.20487 15.546 5.10899C15.7599 5 16.0399 5 16.6 5H19.4C19.9601 5 20.2401 5 20.454 5.10899C20.6422 5.20487 20.7951 5.35785 20.891 5.54601C21 5.75992 21 6.03995 21 6.6V9.4C21 9.96005 21 10.2401 20.891 10.454C20.7951 10.6422 20.6422 10.7951 20.454 10.891C20.2401 11 19.9601 11 19.4 11Z" stroke="#e5e5e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg>
                      : <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="style=linear"> <g id="document"> <path id="rec" d="M3 7C3 4.23858 5.23858 2 8 2H16C18.7614 2 21 4.23858 21 7V17C21 19.7614 18.7614 22 16 22H8C5.23858 22 3 19.7614 3 17V7Z" stroke="#9b9b9b" strokeWidth="1.5"></path> <path id="line" d="M8 8.2002H16" stroke="#9b9b9b" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path> <path id="line_2" d="M8 12.2002H16" stroke="#9b9b9b" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path> <path id="line_3" d="M9 16.2002H15" stroke="#9b9b9b" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path> </g> </g> </g></svg>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="report-content">
          {selectedReport ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="report-header">
                <div className="report-header-left">
                  <h1>Health Report</h1>
                  <div className="report-date">
                    <FaRegCalendarAlt className="calendar-icon" />
                    {formatDate(selectedReport.timestamp)}
                  </div>
                </div>
                <button onClick={downloadPDF} className="download-button">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 3V16M12 16L16 11.625M12 16L8 11.625" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> <path d="M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg> Download PDF
                </button>
              </div>
              <div className="report-body">
                {typeof selectedReport.report === "string" ? (
                  <ReactMarkdown
                    className="markdown-content"
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  >
                    {selectedReport.report}
                  </ReactMarkdown>
                ) : (
                  <p className="report-error">
                    Report content is not available
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="report-no-selection">
              <p>Select a report from the sidebar to view its contents</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Report;
