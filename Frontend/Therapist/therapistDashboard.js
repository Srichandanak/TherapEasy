import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./tDashboard.css";
import {
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    TextField,
    CircularProgress,
    Alert
} from "@mui/material";

const TherapistDashboard = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const response = await fetch("http://localhost:5000/therapist-dashboard", {
                    
                });

                if (!response.ok) {
                    console.error("API Error:", response.status, response.statusText);
                    throw new Error(`API returned an error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                setPatients(data.patients || []);  // Access patients through data.patients
                setError(null);
            } catch (e) {
                console.error("Could not fetch dashboard data:", e);
                setError("Failed to load dashboard data. Please try again later.");
                setPatients([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handlePlanClick = (patientId) => {
        navigate(`/patient-plan/${patientId}`);
    };

    const handleSendNotification = (patientId) => {
        navigate(`/notification/${patientId}`);
    };

    const handleReportToSupervisor = () => {
        console.log("Reporting to supervisor:", message);
        setMessage("");
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return (
            <Alert severity="error">
                {error}
            </Alert>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>THERAPIST DASHBOARD</h2>
            </header>

            <section className="clients-section">
                <h3>CLIENTS AND THEIR DETAILS</h3>
                <Grid container spacing={2} className="patient-cards-container">
                    {patients.map((patient) => (
                        <Grid item xs={12} sm={6} md={4} key={patient.id}>
                            <Card className="patient-card">
                                <CardContent>
                                    <Typography variant="h5" component="div">
                                        {patient.full_name}
                                    </Typography>
                                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                        Issue: {patient.issue || "Not specified"}
                                    </Typography>
                                    <Typography variant="body2">
                                        Age: {patient.age || "Not specified"}
                                        <br />
                                        Email: {patient.email || "Not specified"}
                                    </Typography>
                                    <div className="client-buttons">
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleSendNotification(patient.id)}
                                        >
                                            NOTIFY
                                        </Button>
                                        <Button variant="outlined" onClick={() => handlePlanClick(patient.id)}>
                                            PLAN
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </section>
            {/* Appointments Section */}
      <section className="appointments-section">
        <h3>APPOINTMENTS</h3>
        <div className="appointment-card">
          <p><strong>Time:</strong> 10:30 AM - 11:30 AM</p>
          <div className="appointment-actions">
            <button className="ok-btn">OK</button>
            <button className="re-btn">RE</button>
            <button className="cancel-btn">CANCEL</button>
          </div>
        </div>
      </section>

            {/* Chat with Supervisor */}
            <section className="chat-section">
                <h3>CHAT WITH SUPERVISOR</h3>
                <TextField
                    fullWidth
                    label="Type your message..."
                    multiline
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    variant="outlined"
                />
                <Button variant="contained" color="primary" onClick={handleReportToSupervisor} sx={{ mt: 2 }}>
                    REPORT TO SUPERVISOR
                </Button>
            </section>
        </div>
    );
};

export default TherapistDashboard;
