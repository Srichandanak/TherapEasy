import React, { useState, useEffect } from "react";
import { 
    Button, Dialog, DialogActions, DialogContent, DialogTitle, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, CircularProgress, Alert 
} from "@mui/material";

const Reminder = () => {
    const [open, setOpen] = useState(false);
    const [reminders, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch notifications when modal opens
    const handleOpen = async () => {
        setOpen(true);
        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:5000/get-notifications");
            const data = await response.json();

            if (response.ok) {
                setNotifications(data);
            } else {
                setError("Failed to fetch notifications");
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
            setError("An error occurred while fetching notifications");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => setOpen(false);

    return (
        <div>
            {/* Notifications Button */}
            <Button variant="contained" color="primary" onClick={handleOpen}>
                NOTIFICATIONS
            </Button>

            {/* Notifications Modal */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>Notifications</DialogTitle>
                <DialogContent>
                    {loading ? (
                        <CircularProgress />
                    ) : error ? (
                        <Alert severity="error">{error}</Alert>
                    ) : reminders.length === 0 ? (
                        <Alert severity="info">No notifications available</Alert>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Message</TableCell>
                                        <TableCell>Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reminders.map((notification) => (
                                        <TableRow key={notification.id}>
                                            <TableCell>{notification.type}</TableCell>
                                            <TableCell>{notification.message}</TableCell>
                                            <TableCell>{new Date(notification.date).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Reminder;
