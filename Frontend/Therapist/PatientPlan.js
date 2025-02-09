import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    TextField,
    Button,
    Typography,
    Container,
    List,
    ListItem,
    Box,
    Stack
} from "@mui/material";
import './PatientPlan.css'

const PatientPlanPage = () => {
    const { patientId } = useParams();
    const [weeks, setWeeks] = useState([
        { tasks: [""] },
        { tasks: [""] },
        { tasks: [""] },
        { tasks: [""] },
    ]);
    const navigate = useNavigate();

    const addTask = (weekIndex) => {
        const newWeeks = [...weeks];
        newWeeks[weekIndex].tasks.push("");
        setWeeks(newWeeks);
    };

    const updateTask = (weekIndex, taskIndex, value) => {
        const newWeeks = [...weeks];
        newWeeks[weekIndex].tasks[taskIndex] = value;
        setWeeks(newWeeks);
    };

    const removeTask = (weekIndex, taskIndex) => {
        const newWeeks = [...weeks];
        newWeeks[weekIndex].tasks.splice(taskIndex, 1);
        setWeeks(newWeeks);
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch("http://localhost:5000/patient-plan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    patient_id: patientId,
                    tasks: weeks.map(week => week.tasks).flat().filter(task => task !== ""),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Patient plan created successfully!");
                navigate("/therapist-dashboard");
            } else {
                alert(`Error creating patient plan: ${data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error creating patient plan:", error);
            alert("An unexpected error occurred.");
        }
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                Create Patient Plan for Patient ID: {patientId}
            </Typography>

            {weeks.map((week, weekIndex) => (
                <Box key={weekIndex} mb={3}>
                    <Typography variant="h6" gutterBottom>
                        Week {weekIndex + 1}
                    </Typography>
                    <List>
                        {week.tasks.map((task, taskIndex) => (
                            <ListItem key={taskIndex} sx={{ display: 'flex', alignItems: 'center', padding: '8px' }}>
                                <TextField
                                    fullWidth
                                    label={`Task ${taskIndex + 1}`}
                                    value={task}
                                    multiline
                                    rows={4}
                                    variant="outlined"
                                    onChange={(e) => updateTask(weekIndex, taskIndex, e.target.value)}
                                    sx={{ mr: 1 }}
                                />
                                <Stack>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => removeTask(weekIndex, taskIndex)}
                                    sx={{ ml: 1 }}  // Add some left margin
                                >
                                    Delete
                                </Button>
                                <Button variant="outlined" onClick={() => addTask(weekIndex)} sx={{ mt: 1 }}>
                                    Add Task
                                </Button>
                                </Stack>
                                
                            </ListItem>
                        ))}
                    </List>
                    
                </Box>
            ))}

            <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 3, ml: 2 }}>
                Save Plan
            </Button>
        </Container>
    );
};

export default PatientPlanPage;
