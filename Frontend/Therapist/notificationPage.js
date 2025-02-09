import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Typography,
    Container,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress
} from "@mui/material";
import "./notification.css";

const NotificationPage = () => {
    const { patientId } = useParams();
    const [patient, setPatient] = useState(null);
    const [method, setMethod] = useState("email");
    const [emailData, setEmailData] = useState({ subject: "", message: "" });
    const [smsData, setSmsData] = useState({ message: "" });
    const [reminderData, setReminderData] = useState({ time: "", message: "" });
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatient = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/patients`, { // Adjust endpoint if needed
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                // find the patient with the id matching the one passed through the link
                const patient = data.patients.find(patient => patient.id === parseInt(patientId));
                setPatient(patient);

            } catch (error) {
                console.error("Error fetching patient:", error);
                setStatus("❌ Error fetching patient details.");
            } finally {
                setLoading(false);
            }
        };
        if (patientId) {
            fetchPatient();
        }
    }, [patientId]);

    const handleSendNotification = async () => {
        let payload = { user_id: patientId, method: method };

        if (method === "email") {
            payload = { ...payload, subject: emailData.subject, message: emailData.message };
        } else if (method === "sms") {
            payload = { ...payload, message: smsData.message };
        } else if (method === "reminder") {
            payload = { ...payload, message: reminderData.message, time: reminderData.time };
        }

        try {
            const response = await fetch("http://localhost:5000/send-notification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus("✅ Notification sent successfully!");
                navigate("/therapist-dashboard");
            } else {
                setStatus(`❌ Error: ${data.error || "Failed to send notification"}`);
            }
        } catch (error) {
            console.error("❌ Fetch Error:", error);
            setStatus("❌ An unexpected error occurred.");
        }
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
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                Send Notification to {patient ? patient.full_name : "Loading..."}
            </Typography>

            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="method-select-label">Method</InputLabel>
                <Select
                    labelId="method-select-label"
                    id="method-select"
                    value={method}
                    label="Method"
                    onChange={(e) => setMethod(e.target.value)}
                >
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="sms">SMS</MenuItem>
                    <MenuItem value="reminder">In-App Reminder</MenuItem>
                </Select>
            </FormControl>

            {method === "email" && (
                <div style={{ marginTop: "20px" }}>
                    <TextField
                        fullWidth
                        label="Subject"
                        value={emailData.subject}
                        onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Message"
                        multiline
                        rows={4}
                        value={emailData.message}
                        onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                        margin="normal"
                    />
                </div>
            )}

            {method === "sms" && (
                <div style={{ marginTop: "20px" }}>
                    <TextField
                        fullWidth
                        label="Message"
                        multiline
                        rows={4}
                        value={smsData.message}
                        onChange={(e) => setSmsData({ ...smsData, message: e.target.value })}
                        margin="normal"
                    />
                </div>
            )}

            {method === "reminder" && (
                <div style={{ marginTop: "20px" }}>
                    <TextField
                        fullWidth
                        label="Time"
                        type="datetime-local"
                        value={reminderData.time}
                        onChange={(e) => setReminderData({ ...reminderData, time: e.target.value })}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Message"
                        multiline
                        rows={4}
                        value={reminderData.message}
                        onChange={(e) => setReminderData({ ...reminderData, message: e.target.value })}
                        margin="normal"
                    />
                </div>
            )}

            <Button variant="contained" color="primary" onClick={handleSendNotification} sx={{ mt: 3 }}>
                Send Notification
            </Button>

            {status && <Typography variant="body2" sx={{ mt: 2 }}>{status}</Typography>}
        </Container>
    );
};

export default NotificationPage;
