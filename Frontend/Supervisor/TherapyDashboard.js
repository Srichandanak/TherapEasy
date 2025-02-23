import React, { useState, useEffect } from "react";
import "./sDashboard.css";
import "./TherapyDashboard.css";
import Navbar from "../Common/Navbar";

export default function TherapyDashboard() {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedTherapist, setSelectedTherapist] = useState("");
  const [patients, setPatients] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchReports();
    fetchVideoProgress();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/users");
      if (!response.ok) throw new Error("Failed to fetch users");

      const { users } = await response.json();
      setPatients(users.filter(user => user.role === "patient"));
      setTherapists(users.filter(user => user.role === "therapist"));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  const fetchReports = async () => {
    try {
      const response = await fetch("http://localhost:5000/supervisor-reports");
      if (!response.ok) throw new Error("Failed to fetch reports");

      const data = await response.json();
      setReports(data.reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchVideoProgress = async () => {
    try {
      const response = await fetch("http://localhost:5000/video-progress");
      if (!response.ok) throw new Error("Failed to fetch video progress");

      const data = await response.json();
      setProgressData(data.progress);
    } catch (error) {
      console.error("Error fetching video progress:", error);
    }
  };

  const assignPatient = async (manual = true) => {
    let patientId = selectedPatient;
    let therapistId = selectedTherapist;

    if (!manual) {
      if (patients.length === 0 || therapists.length === 0) {
        alert("No available patients or therapists.");
        return;
      }
      patientId = patients[0].id;
      therapistId = therapists[0].id;
    }

    if (!patientId || !therapistId) {
      alert("Please select both a patient and a therapist.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/assign-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: patientId, therapist_id: therapistId }),
      });

      if (!response.ok) throw new Error("Failed to assign patient");

      alert("Patient assigned successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Error assigning patient:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <h1 className="supervisor-title">Welcome, Supervisor</h1>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="section">
              <h2 className="section-title">Assign Patient to Therapist</h2>
              <select className="dropdown-select" value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
                <option value="">-- Select Patient --</option>
                {patients.map((user) => (
                  <option key={user.id} value={user.id}>{user.id} - {user.full_name}</option>
                ))}
              </select>
              <select className="dropdown-select" value={selectedTherapist} onChange={(e) => setSelectedTherapist(e.target.value)}>
                <option value="">-- Select Therapist --</option>
                {therapists.map((user) => (
                  <option key={user.id} value={user.id}>{user.id} - {user.full_name}</option>
                ))}
              </select>
              <button className="assign-button" onClick={() => assignPatient(true)}>Assign Manually</button>
              <button className="assign-button" onClick={() => assignPatient(false)}>Assign Automatically</button>
            </div>

            <div className="section">
              <h2 className="section-title">Reports Received</h2>
              <ul className="reports-list">
                {reports.length > 0 ? (
                  reports.map((report, index) => (
                    <li key={index} className="report-item">
                      <p><strong>Therapist ID:</strong> {report.therapist_id}</p>
                      <p><strong>Message:</strong> {report.message}</p>
                      <p><strong>Received At:</strong> {new Date(report.created_at).toLocaleString()}</p>
                    </li>
                  ))
                ) : (
                  <p>No reports available.</p>
                )}
              </ul>
            </div>

            <div className="section">
              <h2 className="section-title">Patient Video Progress</h2>
              <ul className="progress-list">
                {progressData.length > 0 ? (
                  progressData.map((progress, index) => (
                    <li key={index} className="progress-item">
                      <p><strong>Patient ID:</strong> {progress.patient_id}</p>
                      <p><strong>Video ID:</strong> {progress.video_id}</p>
                      <p><strong>Progress:</strong> {progress.progress.toFixed(2)}%</p>
                    </li>
                  ))
                ) : (
                  <p>No progress data available.</p>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  );
}
