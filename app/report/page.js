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
import "@/app/styles/report.css";

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

  if (isLoading) {
    return (
      <div className="report-loading">
        <div className="report-loading-spinner"></div>
        <p>Loading your health reports...</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="report-empty">
        <div className="report-empty-icon">📋</div>
        <h2>No Reports Found</h2>
        <p>You haven't saved any health reports yet.</p>
        <button
          onClick={() => router.push("/check")}
          className="report-empty-button"
        >
          Get Your Health Report
        </button>
      </div>
    );
  }

  return (
    <div className="report-container">
      <div className="report-sidebar">
        <h2>Your Reports</h2>
        <div className="report-list">
          {reports.map((report) => (
            <div
              key={report.timestamp}
              className={`report-item ${
                selectedReport?.timestamp === report.timestamp ? "active" : ""
              }`}
              onClick={() => setSelectedReport(report)}
            >
              <div className="report-item-date">
                {formatDate(report.timestamp)}
              </div>
              <div className="report-item-icon">
                {selectedReport?.timestamp === report.timestamp ? "📄" : "📑"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="report-content">
        {selectedReport ? (
          <>
            <div className="report-header">
              <h1>Health Report</h1>
              <div className="report-date">
                {formatDate(selectedReport.timestamp)}
              </div>
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
                <p className="report-error">Report content is not available</p>
              )}
            </div>
          </>
        ) : (
          <div className="report-no-selection">
            <p>Select a report from the sidebar to view its contents</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;
