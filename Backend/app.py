from flask import Flask, request, jsonify, send_from_directory , session
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from flask_bcrypt import Bcrypt
from datetime import timedelta, datetime
import os
import difflib
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer  # For token generation

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

bcrypt = Bcrypt(app)

def create_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password='Sri/123@',
            database='therapyeasy'
        )
        return connection
    except Error as e:
        print(f"Error: {e}")
        return None

# 🟢 User Registration
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    full_name = data.get('full_name') or data.get('fullName')
    email = data.get('email')
    password = data.get('password')
    phone_number = data.get('phone_number')
    gender = data.get('gender')
    dob = data.get('dob')   
    address = data.get('address')
    role = data.get('role').lower()

    if not all([full_name, email, password, role]):
        return jsonify({"error": "Missing required fields"}), 400

    # Validate role
    valid_roles = ["patient", "therapist", "supervisor"]
    if role not in valid_roles:
        return jsonify({"error": "Invalid role"}), 400

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    conn = create_connection()
    if conn:
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (full_name, email, password_hash, phone_number, gender, dob, address, role) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (full_name, email, password_hash, phone_number, gender, dob, address, role)
            )
            conn.commit()
            return jsonify({"message": "User registered successfully!"}), 201
        except Error as e:
            print(f"Registration Error: {e}")
            return jsonify({"error": f"Database error: {str(e)}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"error": "Failed to connect to the database"}), 500

# 🔵 User Login (With Role Selection)
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', '').lower()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = create_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()

            if user and bcrypt.check_password_hash(user["password_hash"], password):
                if user["role"].lower() == role:
                    return jsonify({
                        "message": "Login successful!",
                        "user": {
                            "id": user["id"],
                            "email": user["email"],
                            "role": user["role"]
                        }
                    }), 200
                else:
                    return jsonify({"error": "Incorrect role selected"}), 403
            else:
                return jsonify({"error": "Invalid email or password"}), 401
        except Error as e:
            print(f"Login Error: {e}")
            return jsonify({"error": f"Database error: {str(e)}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"error": "Failed to connect to the database"}), 500

@app.route("/therapist-dashboard", methods=["GET"])
def get_therapist_dashboard_data():
    """
    Returns therapist dashboard data, including a list of patients and their appointments.
    """
    therapist_id = request.args.get("therapist_id", 1, type=int)  # Replace with real auth system

    conn = create_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        # Fetch all patients assigned to the therapist
        cursor.execute("SELECT id, full_name, email FROM users WHERE role = 'patient'")
        patients = cursor.fetchall()

        # Fetch all appointments for the therapist
        cursor.execute("""
            SELECT a.id, a.patient_id, u.full_name AS patient_name, 
                   a.date, a.time, a.status 
            FROM appointments a
            JOIN users u ON a.patient_id = u.id
            WHERE a.therapist_id = %s
            ORDER BY a.date DESC, a.time ASC
        """, (therapist_id,))
        appointments = cursor.fetchall()

        # Convert `time` field to string if it's a `timedelta`
        for appt in appointments:
            if isinstance(appt["time"], timedelta):
                appt["time"] = str(appt["time"])
            # Convert date to string
            if isinstance(appt["date"], datetime):
                appt["date"] = appt["date"].strftime('%Y-%m-%d')

        return jsonify({
            "therapist_id": therapist_id,
            "patients": patients,
            "appointments": appointments
        }), 200

    except Error as e:
        print(f"Database Query Error: {e}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    finally:
        cursor.close()
        conn.close()

@app.route("/send-notification", methods=["POST"])
def send_notification():
    """
    Handles sending notifications to users. No JWT authentication required.
    """
    data = request.json
    user_id = data.get("user_id")
    method = data.get("method")
    message = data.get("message")
    subject = data.get("subject", "")  # Optional subject

    if not all([user_id, method, message]):
        return jsonify({"error": "Missing required fields"}), 400

    valid_methods = ["email", "sms", "reminder"]
    if method not in valid_methods:
        return jsonify({"error": "Invalid notification method"}), 400

    conn = create_connection()
    if conn:
        cursor = conn.cursor()
        try:
            # Store the notification, including the subject if it exists
            cursor.execute(
                "INSERT INTO notifications (user_id, method, message, subject) VALUES (%s, %s, %s, %s)",
                (user_id, method, message, subject)
            )
            conn.commit()

         

            print(f"Simulating sending {method} to {user_id}: {message}")  # Debug
            return jsonify({"message": "Notification sent successfully!"}), 200

        except Error as e:
            print(f"Notification Error: {e}")
            return jsonify({"error": f"Database error: {str(e)}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"error": "Failed to connect to the database"}), 500


@app.route("/patient-plan", methods=["POST"])
def create_patient_plan():
    data = request.get_json()
    patient_id = data.get("patient_id")
    tasks = data.get("tasks", [])

    if not patient_id:
        return jsonify({"error": "Patient ID is required"}), 400

    # Ensure we have at least 4 weeks, filling missing ones with "No Task"
    weeks = [tasks[i] if i < len(tasks) else "No Task" for i in range(4)]

    conn = create_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO patient_plans (patient_id, week1, week2, week3, week4, created_at) 
            VALUES (%s, %s, %s, %s, %s, NOW())
        """, (patient_id, weeks[0], weeks[1], weeks[2], weeks[3]))

        conn.commit()
        return jsonify({"message": "Patient plan created successfully!"}), 201

    except mysql.connector.Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()
@app.route('/get-patient-plan/<int:patient_id>', methods=['GET'])
def get_patient_plan(patient_id):
    try:
        conn = mysql.connector.connect(host="localhost",user="root",password="Sri/123@",database="therapyeasy")
        cursor = conn.cursor()
        sql = "SELECT week1,week2,week3,week4 FROM patient_plans WHERE patient_id = %s"
        val = (patient_id,)
        cursor.execute(sql, val)
        # Fetch all results before closing the cursor
        results = cursor.fetchall() # Or cursor.fetchone() if you expect only one row

        # Process the results
        row_headers = [x[0] for x in cursor.description]
        json_data = []
        for result in results: #iterate over 'results', not 'cursor'
            json_data.append(dict(zip(row_headers, result)))
        return jsonify(json_data)

    except Exception as e:
        return jsonify({'error': str(e)})
    finally:
        if cursor: # Check if cursor exists before trying to close
            cursor.close()
        if conn:   # Check if connection exists before trying to close
            conn.close()


@app.route('/create-appointment', methods=['POST'])
def create_appointment():
    data = request.json
    patient_id = data.get('patient_id')
    therapist_id = data.get('therapist_id')
    date = data.get('date')
    time = data.get('time')

    if not all([patient_id, therapist_id, date, time]):
        return jsonify({"error": "Missing required fields"}), 400

    conn = create_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        try:
            # ✅ Check if an appointment already exists for this therapist at the same date and time
            cursor.execute(
                "SELECT * FROM appointments WHERE therapist_id = %s AND date = %s AND time = %s",
                (therapist_id, date, time)
            )
            existing_appointment = cursor.fetchone()

            if existing_appointment:
                return jsonify({"error": "This time slot is already booked for the therapist."}), 409  # HTTP 409 Conflict
            
            # ✅ Insert only if no existing appointment is found
            cursor.execute(
                "INSERT INTO appointments (patient_id, therapist_id, date, time) VALUES (%s, %s, %s, %s)",
                (patient_id, therapist_id, date, time)
            )
            conn.commit()
            return jsonify({"message": "Appointment created successfully!"}), 201
        except Error as e:
            print(f"Create Appointment Error: {e}")
            return jsonify({"error": f"Database error: {str(e)}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"error": "Failed to connect to the database"}), 500


@app.route('/appointments/pending', methods=['GET'])
def get_pending_appointments():
    try:
        conn = create_connection()
        if conn is None:
            return jsonify({"error": "Failed to connect to the database"}), 500

        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM appointments WHERE status = 'pending'"
        cursor.execute(query)
        appointments = cursor.fetchall()
        return jsonify(appointments), 200

    except Error as e:
        print(f"Fetch Pending Appointments Error: {e}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        print(f"Unexpected Error: {e}")
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/submit-report', methods=['POST'])
def submit_report():
    data = request.json
    therapist_id = data.get('therapist_id')
    message = data.get('message')

    if not therapist_id or not message:
        return jsonify({"error": "Missing required fields"}), 400

    conn = create_connection()
    if conn:
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT INTO reports (therapist_id, message) VALUES (%s, %s)",
                (therapist_id, message)
            )
            conn.commit()
            return jsonify({"message": "Report submitted successfully!"}), 201
        except Error as e:
            print(f"Report Submission Error: {e}")
            return jsonify({"error": f"Database error: {str(e)}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"error": "Failed to connect to the database"}), 500

# Add an endpoint to fetch reports for the supervisor dashboard
@app.route('/supervisor-reports', methods=['GET'])
def get_reports():
    conn = create_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM reports ORDER BY created_at DESC")
            reports = cursor.fetchall()
            return jsonify({"reports": reports}), 200
        except Error as e:
            print(f"Fetch Reports Error: {e}")
            return jsonify({"error": f"Database error: {str(e)}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"error": "Failed to connect to the database"}), 500    

def calculate_score(user_speech, correct_text):
    user_speech = user_speech.lower().strip()
    correct_text = correct_text.lower().strip()
    
    similarity = difflib.SequenceMatcher(None, user_speech, correct_text).ratio()
    score = round(similarity * 100)  # Convert to percentage
    return score

@app.route('/analyze', methods=['POST'])
def analyze_speech():
    data = request.json
    user_speech = data.get("userSpeech", "")
    correct_text = data.get("correctText", "")
    
    if not user_speech or not correct_text:
        return jsonify({"error": "Invalid input"}), 400
    
    score = calculate_score(user_speech, correct_text)

    
@app.route('/update-profile', methods=['PUT'])
def update_profile():
    full_name = request.json.get('full_name')
    email = request.json.get('email')
    phone_number = request.json.get('phone_number')
    id = request.json.get('id')  # Ensure user_id is included in the request


    conn = create_connection()
    if conn:
        cursor = conn.cursor()
        try:
            update_query = """UPDATE users SET full_name = %s, email = %s, phone_number = %s WHERE id = %s"""

            cursor.execute(update_query, (full_name, email, phone_number, id))
            conn.commit()
            return jsonify({"message": "Profile edited successfully!"}), 201
        except Error as e:
            print(f"Profile change Error: {e}")
            return jsonify({"error": f"Database error: {str(e)}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"error": "Failed to connect to the database"}), 500
    

# Configure Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'srichandanak.24@gmail.com'  
app.config['MAIL_PASSWORD'] = 'uteu nbjt dmch lzom'      # app password generated from Google
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_DEFAULT_SENDER'] = 'srichandanak.24@gmail.com'  # Set a default sender


mail = Mail(app)
s = URLSafeTimedSerializer('Thisisasecret!')  # Secret key for token 

mail = Mail(app)

# Send Email API
@app.route('/send-email', methods=['POST'])
def send_email():
    data = request.json
    recipient = data.get('recipient')
    subject = data.get('subject', "No Subject")
    body = data.get('body', "")

    if not recipient or not body:
        return jsonify({"error": "Recipient and message are required"}), 400

    try:
        msg = Message(subject, recipients=[recipient])
        msg.body = body
        mail.send(msg)
        
        return jsonify({"message": "Email sent successfully!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Set Reminder API (Simulating with Console Print)
@app.route('/set-reminder', methods=['POST'])
def set_reminder():
    data = request.json
    user_id = data.get('user_id')
    message = data.get('message')

    if not user_id or not message:
        return jsonify({"error": "User ID and message are required"}), 400

    # Insert the reminder into the database
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute(
                "INSERT INTO reminders (user_id, message) VALUES (%s, %s)",
                (user_id, message)
            )
            connection.commit()
            cursor.close()
            connection.close()
            return jsonify({"message": "Reminder set successfully!"})
        except Error as e:
            print(f"Database error: {e}")
            return jsonify({"error": "Failed to set reminder"}), 500
    else:
        return jsonify({"error": "Failed to connect to the database"}), 500   

@app.route("/patients", methods=["GET"])
def get_patients():
    conn = create_connection()
    
    cursor = conn.cursor()
    cursor.execute("SELECT id, full_name FROM patients")
    patients = cursor.fetchall()
    return jsonify(patients)

# Fetch therapists
@app.route("/therapists", methods=["GET"])
def get_therapists():
    conn = create_connection()
    
    cursor = conn.cursor()
    cursor.execute("SELECT id, full_name FROM therapists")
    therapists = cursor.fetchall()
    return jsonify(therapists)

# Fetch reports
# @app.route("/supervisor-reports", methods=["GET"])
# def get_reports():
#     conn = create_connection()
    
#     cursor = conn.cursor()
#     cursor.execute("SELECT therapist_id, message, created_at FROM reports")
#     reports = cursor.fetchall()
#     return jsonify({"reports": reports})

# Manually assign a patient to a therapist


@app.route('/users', methods=['GET'])
def get_users():
    conn = create_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT id, full_name, email, role FROM users")
            users = cursor.fetchall()
            return jsonify({"users": users}), 200
        except Error as e:
            print(f"Error fetching users: {e}")
            return jsonify({"error": f"Database error: {str(e)}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"error": "Failed to connect to the database"}), 500


@app.route("/assign-patient", methods=["POST"])
def assign_patient():
    data = request.json
    patient_id = data.get("patient_id")
    therapist_id = data.get("therapist_id")
    conn = create_connection()
    
    cursor = conn.cursor()

    if not patient_id or not therapist_id:
        return jsonify({"error": "Missing patient or therapist ID"}), 400

    cursor.execute("INSERT INTO assignments (patient_id, therapist_id) VALUES (%s, %s)", (patient_id, therapist_id))
    conn.commit()

    return jsonify({"success": True, "message": "Patient assigned successfully"})

# Auto-assign a patient to the least loaded therapist
@app.route("/auto-assign-patient", methods=["POST"])
def auto_assign_patient():
    conn = create_connection()
    
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM patients WHERE id NOT IN (SELECT patient_id FROM assignments) LIMIT 1")
    patient = cursor.fetchone()

    if not patient:
        return jsonify({"error": "No unassigned patients available"}), 400

    cursor.execute("""
        SELECT t.id FROM therapists t
        LEFT JOIN assignments a ON t.id = a.therapist_id
        GROUP BY t.id
        ORDER BY COUNT(a.therapist_id) ASC LIMIT 1
    """)
    therapist = cursor.fetchone()

    if not therapist:
        return jsonify({"error": "No available therapists"}), 400

    cursor.execute("INSERT INTO assignments (patient_id, therapist_id) VALUES (%s, %s)", (patient["id"], therapist["id"]))
    conn.commit()

    return jsonify({"success": True, "message": f"Patient {patient['id']} auto-assigned to therapist {therapist['id']}"})

    
@app.route('/get-notifications', methods=['GET'])
def get_notifications():
    connection = create_connection()
    if connection:
        try:
            # user_id = session["user_id"]
            cursor = connection.cursor(dictionary=True)  # Fetch results as dictionaries
            cursor.execute("SELECT id, message FROM reminders ORDER BY created_at DESC LIMIT 5")
            reminders = cursor.fetchall()
            cursor.close()
            connection.close()
            return jsonify(reminders)
        except Error as e:
            print(f"Database error: {e}")
            return jsonify({"error": "Failed to fetch notifications"}), 500
    else:
        return jsonify({"error": "Failed to connect to the database"}), 500


@app.route('/update-appointment-status/<int:appointment_id>', methods=['PUT'])
def update_appointment_status(appointment_id):
    data = request.json
    status = data.get('status')

    if not status:
        return jsonify({"error": "Missing status"}), 400

    # Ensure the status value is valid and within the expected length
    valid_statuses = ["pending", "confirmed", "canceled"]
    if status not in valid_statuses:
        return jsonify({"error": "Invalid status value"}), 400

    conn = create_connection()
    if conn:
        cursor = conn.cursor()
        try:
            cursor.execute("UPDATE appointments SET status = %s WHERE id = %s", (status, appointment_id))
            conn.commit()
            return jsonify({"success": True, "message": "Appointment status updated successfully"}), 200
        except Error as e:
            print(f"Database error: {e}")
            return jsonify({"error": f"Database error: {str(e)}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"error": "Failed to connect to the database"}), 500
    

@app.route('/send-reminder', methods=['POST'])
def send_reminder():
    data = request.json
    appointment_id = data.get('appointmentId')
    message = data.get('message')

    if not appointment_id or not message:
        return jsonify({"error": "Missing appointment ID or message"}), 400

    # Logic to send the reminder (e.g., via email, SMS, or push notification)
    # For now, we'll just print the message to simulate sending the reminder
    print(f"Reminder sent for appointment {appointment_id}: {message}")

    return jsonify({"success": True, "message": "Reminder sent successfully"}), 200    

@app.route("/contact", methods=["POST"])
def contact():
    form_data = request.get_json()  # Get the JSON data sent from the frontend
    name = form_data.get("name")
    email = form_data.get("email")
    message = form_data.get("message")

    # Send email to yourself (or any other recipient)
    msg = Message(
        subject=f"Message from {name} ({email})",
        recipients=["srichandanak.24@gmail.com"],  # The receiver's email
        body=message
    )
    msg.sender = email 
    try:
        mail.send(msg)  # Send the email
        return jsonify({"success": True, "message": "Your message has been sent!"}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500



# 🟢 **API: Fetch All YouTube Videos**
@app.route('/api/videos', methods=['GET'])
def get_videos():
    video_data = [
        {
            "id": "hello_video",
            "title": "How to Pronounce 'Hello'",
            "description": "Watch this video to learn how to pronounce the word 'Hello' correctly.",
            "url": "8hhCOkTj2Jk"
            
        },
        {
            "id": "mispronunciation_video",
            "title": "Common Mispronunciations",
            "description": "Here's a video that shows common mispronunciations and how to fix them.",
            "url": "TNP_6W1EECU"
        },
        {
            "id": "th_sound_video",
            "title": "Learn the 'Th' Sound",
            "description": "This video demonstrates how to pronounce the 'th' sound correctly.",
            "url": "G-chx6_NCp0"
        }
    ]
    return jsonify(video_data)


# 🟢 **API: Serve Local Video Files**
@app.route('/video/<video_name>')
def serve_video(video_name):
    video_path = os.path.join('static', 'videos', video_name)
    if os.path.exists(video_path):
        return send_from_directory(os.path.join('static', 'videos'), video_name)
    else:
        return jsonify({"error": "Video not found"}), 404


# 🟢 **API: Save Video Progress**
@app.route('/api/save_progress', methods=['POST'])
def save_progress():
    conn = create_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    data = request.json
    user_id = data.get("user_id")
    video_id = data.get("video_id")
    progress = data.get("progress")

    if not all([user_id, video_id, progress]):
        return jsonify({"error": "Missing required fields"}), 400

    watched = 1 if progress >= 95 else 0  # Mark as watched if 95%+ completed

    try:
        cursor = conn.cursor()

        query = """
        INSERT INTO video_progress (user_id, video_id, progress_percentage, watched)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE progress_percentage = %s, watched = %s;
        """
        cursor.execute(query, (user_id, video_id, progress, watched, progress, watched))
        conn.commit()
        return jsonify({"message": "Progress saved successfully!"}), 200
    except mysql.connector.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cursor.close()
        conn.close()


# 🟢 **API: Get Video Progress for a Patient**
@app.route('/get-video-progress/<int:patient_id>', methods=['GET'])
def get_video_progress(patient_id):
    conn = create_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        query = "SELECT video_id, progress_percentage, watched FROM video_progress WHERE user_id = %s"
        cursor.execute(query, (patient_id,))
        progress_data = cursor.fetchall()

        results = [{"video_id": vid, "progress": prog, "watched": bool(watched)} for vid, prog, watched in progress_data]
        return jsonify({"progress": results}), 200
    except mysql.connector.Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    app.run(debug=True)
