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
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import Navbar from "../Common/Navbar";

const TherapistDashboard = () => {
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState("");
    const [rescheduleData, setRescheduleData] = useState({ id: null, date: "", time: "" });
    const navigate = useNavigate();
    const [reminderMessage, setReminderMessage] = useState(""); // State to store the reminder message

    useEffect(() => {
        const therapistId = localStorage.getItem("therapistId");
        if (!therapistId) {
            setError("Therapist ID not found.");
            setLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/therapist-dashboard?`);
                if (!response.ok) throw new Error("Failed to fetch data");

                const data = await response.json();
                setPatients(data.patients || []);
                setAppointments(data.appointments || []);
            } catch (e) {
                setError("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Accept Appointment
    const handleAccept = async (id) => {
        try {
          // Send reminder to the user about appointment confirmation
          await sendReminder(id, 'confirmed');
          
          // Update appointment status in the database
          await updateAppointmentStatus(id, 'confirmed');
        } catch (error) {
          console.error("Error confirming appointment:", error);
        }
      };
      
      const handleReschedule = async (appointment) => {
        try {
          // Send reminder to the user to reschedule the meeting
          await sendReminder(appointment.id, 'reschedule');
          
          // Update appointment status to 'rescheduled' or 'pending'
          await updateAppointmentStatus(appointment.id, 'pending');
          
          // Optionally, show a reschedule form or open a calendar for the user to pick a new time
          setRescheduleData({ id: appointment.id, date: appointment.date, time: appointment.time });
        } catch (error) {
          console.error("Error rescheduling appointment:", error);
        }
      };
      
      const handleCancel = async (id) => {
        try {
          // Send reminder to the user that the meeting has been canceled
          await sendReminder(id, 'canceled');
          
          // Update appointment status in the database to 'canceled'
          await updateAppointmentStatus(id, 'canceled');
        } catch (error) {
          console.error("Error canceling appointment:", error);
        }
      };
      const sendReminder = async (appointmentId, status) => {
        const messages = {
          confirmed: "Your appointment has been confirmed.",
          reschedule: "Please reschedule your meeting.",
          canceled: "Your meeting has been canceled.",
        };
      
        const reminderMessage = messages[status];
      
        // Assuming you have an API endpoint to send the reminder (e.g., via email, SMS, or push notification)
        await fetch('/send-reminder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appointmentId,
            message: reminderMessage,
          }),
        });
      
        console.log(`Reminder sent for appointment ${appointmentId}: ${reminderMessage}`);
      };
      const updateAppointmentStatus = async (appointmentId, status) => {
        // Ensure the status value is valid and within the expected length
        const validStatuses = ["pending", "confirmed", "canceled"];
        if (!validStatuses.includes(status)) {
          console.error("Invalid status value:", status);
          return;
        }
      
        try {
          const response = await fetch(`http://localhost:5000/update-appointment-status/${appointmentId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
          });
      
          if (!response.ok) {
            throw new Error("Failed to update appointment status");
          }
      
          console.log(`Appointment ${appointmentId} status updated to ${status}`);
        } catch (error) {
          console.error("Error updating appointment status:", error);
        }
      };
                  
    // Navigation Handlers
    const handlePlanClick = (patientId) => navigate(`/patient-plan/${patientId}`);
    const handleCreatePlan = async (patientId, tasks) => {
        try {
            const response = await fetch(`http://localhost:5000/patient-plan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patient_id: patientId, tasks }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to create patient plan");
            }
    
            const data = await response.json();
            alert(data.message || "Patient plan created successfully!");
        } catch (error) {
            console.error("Error creating patient plan:", error);
            alert("Failed to create patient plan. Please try again.");
        }
    };
    const handleSendNotification = (patientId) => navigate(`/notification/${patientId}`);

    // Report to Supervisor
    const handleReportToSupervisor = async () => {
        const therapistId = localStorage.getItem("therapistId");
        if (!therapistId) {
            alert("Therapist ID not found.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/submit-report`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ therapist_id: therapistId, message }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit report");
            }

            const data = await response.json();
            alert(data.message || "Report submitted successfully!");
            setMessage("");
        } catch (error) {
            console.error("Error submitting report:", error);
            alert("Failed to submit report. Please try again.");
        }
    };

    

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <>
        <Navbar />
        <div className="dashboard-container">
            
            <header className="dashboard-header">
                <h2>THERAPIST DASHBOARD</h2>
            </header>

            {/* Clients Section */}
            <section className="clients-section">
            <h3>CLIENTS AND THEIR DETAILS</h3>
            <div className="patient-cards-container">
                {patients.map((patient) => (
                    <Card className="patient-card" key={patient.id}>
                        <CardContent>
                            <Typography variant="h5">{patient.full_name}</Typography>
                            <Typography color="text.secondary">
                                Issue: {patient.issue || "Not specified"}
                            </Typography>
                            <Typography variant="body2">
                                Age: {patient.age || "Not specified"} | Email: {patient.email || "Not specified"}
                            </Typography>
                            <div className="client-buttons">
                                <Button variant="contained" color="primary" onClick={() => handleSendNotification(patient.id)}>
                                    NOTIFY
                                </Button>
                                <Button variant="outlined" onClick={() => handlePlanClick(patient.id)}>
                                    PLAN
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            </section>

            {/* Appointments Section */}
            <section className="appointments-section">
                <h3>APPOINTMENTS</h3>
                <div className="appointment-list">
                    {appointments.length > 0 ? (
                        appointments.map((appointment) => (
                            <div key={appointment.id} className="appointment-card">
                                <p><strong>Date:</strong> {appointment.date}</p>
                                <p><strong>Time:</strong> {appointment.time}</p>
                                <p><strong>Patient:</strong> {appointment.patient_name}</p>
                                <div className="appointment-actions">
                                
                                    <Button variant="contained" color="success" onClick={() => handleAccept(appointment.id)}>✔ Accept</Button>
                                    <Button variant="contained" color="secondary" onClick={() => setRescheduleData({ id: appointment.id, date: appointment.date, time: appointment.time })}>🔄 Reschedule</Button>
                                    <Button variant="contained" color="error" onClick={() => handleCancel(appointment.id)}>❌ Cancel</Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No upcoming appointments.</p>
                    )}
                </div>
            </section>

            {/* Reschedule Dialog */}
            <Dialog open={!!rescheduleData.id} onClose={() => setRescheduleData({ id: null, date: "", time: "" })}>
                <DialogTitle>Reschedule Appointment</DialogTitle>
                <DialogContent>
                    <TextField type="date" fullWidth margin="normal" value={rescheduleData.date} onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })} />
                    <TextField type="time" fullWidth margin="normal" value={rescheduleData.time} onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRescheduleData({ id: null, date: "", time: "" })} color="secondary">Cancel</Button>
                    <Button onClick={handleReschedule} color="primary">Confirm</Button>
                </DialogActions>
            </Dialog>

            {/* Chat with Supervisor */}
            <section className="chat-section">
                <h3>CHAT WITH SUPERVISOR</h3>
                <TextField fullWidth label="Type your message..." heading = "You can report to the Supervisor here..." multiline rows={4} value={message} onChange={(e) => setMessage(e.target.value)} variant="outlined" />
                <Button variant="contained" color="primary" onClick={handleReportToSupervisor} sx={{ mt: 2 }}>REPORT TO SUPERVISOR</Button>
            </section>
        </div>
        </>
        
    );
};

export default TherapistDashboard;
