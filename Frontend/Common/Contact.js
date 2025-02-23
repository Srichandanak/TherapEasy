import { useState } from "react";
import "./Contact.css";
import Navbar from "./Navbar";

export default function ContactForm() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch("http://localhost:5000/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        const result = await response.json();
        if (result.success) {
            setSuccessMessage(result.message);
            setFormData({ name: "", email: "", message: "" });
        }
    };

    return (
        <div className="contact-form-page">
            <header>
                <Navbar />
            </header>
            <div className="container mx-auto p-5 max-w-lg">
                <h1 className="logo">TherapEasy</h1>
                <h2 className="text-center text-2xl font-bold mb-4">Contact Us</h2>
                {successMessage && <div className="bg-green-200 text-green-800 p-2 mb-4">{successMessage}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                    <textarea
                        name="message"
                        placeholder="Your Message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded"
                    ></textarea>
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Send Message</button>
                </form>
            </div>
        </div>
    );
}
