import React, { useState } from "react";
import {
    TextField,
    Button,
    Typography,
    Container,
    Alert,
} from "@mui/material";
import "./NotificationPage.css"; // Import the CSS file
import Navbar from "../Common/Navbar";

const NotificationPage = () => {
    const [method, setMethod] = useState("email");
    const [emailData, setEmailData] = useState({ recipient: "", subject: "", body: "" });
    const [reminderData, setReminderData] = useState({ user_id: "", message: "" });
    const [status, setStatus] = useState("");

    const handleSendNotification = async () => {
        let payload = {};

        if (method === "email") {
            if (!emailData.recipient || !emailData.subject || !emailData.body) {
                setStatus("❌ Please fill all email fields.");
                return;
            }
            payload = { ...emailData, method: "email" };
        } else if (method === "reminder") {
            if (!reminderData.user_id || !reminderData.message) {
                setStatus("❌ Please fill all reminder fields.");
                return;
            }
            payload = { ...reminderData, method: "reminder" };
        }

        try {
            const response = await fetch(method === "email" ? "http://localhost:5000/send-email" : "http://localhost:5000/set-reminder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                setStatus(`✅ ${result.message}`);
                setEmailData({ recipient: "", subject: "", body: "" });
                setReminderData({ user_id: "", message: "" });
            } else {
                setStatus(`❌ Error: ${result.error}`);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setStatus("❌ An unexpected error occurred.");
        }
    };

    return (
        <>
        <Navbar />
        <Container maxWidth="sm" className="notification-container">
            <Typography variant="h4" align="center" gutterBottom>
                {method === "email" ? "Send Email" : "Set Reminder"}
            </Typography>
            <div className="button-group">
                <Button variant="contained" color="primary" onClick={() => setMethod("email")}>
                    Email
                </Button>
                <Button variant="contained" color="secondary" onClick={() => setMethod("reminder")}>
                    Reminder
                </Button>
            </div>

            {method === "email" ? (
                <>
                    <TextField
                        fullWidth
                        label="Recipient Email"
                        value={emailData.recipient}
                        onChange={(e) => setEmailData({ ...emailData, recipient: e.target.value })}
                        margin="normal"
                    />
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
                        value={emailData.body}
                        onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                        margin="normal"
                    />
                </>
            ) : (
                <>
                    <TextField
                        fullWidth
                        label="User ID"
                        value={reminderData.user_id}
                        onChange={(e) => setReminderData({ ...reminderData, user_id: e.target.value })}
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
                </>
            )}

            

            <Button
                variant="contained"
                color="success"
                onClick={handleSendNotification}
                className="send-button"
            >
                {method === "email" ? "Send Email" : "Set Reminder"}
            </Button>

            {status && <Alert severity={status.startsWith("✅") ? "success" : "error"} className="status-alert">{status}</Alert>}
        </Container>
        </>
    );
};

export default NotificationPage;
