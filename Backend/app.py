from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from flask_bcrypt import Bcrypt
# from flask_jwt_extended import create_access_token, jwt_required, JWTManager, get_jwt_identity # REMOVE
import datetime
import os  # For environment variables

# Initialize Flask App
app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

# JWT Configuration
# app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "supersecretkey")  # Get from env # REMOVE
# jwt = JWTManager(app) # REMOVE

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
                "INSERT INTO users (full_name, email, password_hash, role) VALUES (%s, %s, %s, %s)",
                (full_name, email, password_hash, role)
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
                    # access_token = create_access_token( # REMOVE
                    #     identity={"id": user["id"], "role": user["role"]}, # REMOVE
                    #     expires_delta=datetime.timedelta(hours=2) # REMOVE
                    # ) # REMOVE
                    return jsonify({
                        "message": "Login successful!",
                        # "token": access_token, # REMOVE
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
# @jwt_required() # REMOVE
def get_therapist_dashboard_data():
    """
    Returns therapist dashboard data, including a list of patients.
    No JWT authentication required.
    """
    # current_user = get_jwt_identity() # REMOVE
    # therapist_id = current_user['id']  # Get therapist ID from JWT # REMOVE
    therapist_id = 1 # Example

    conn = create_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        try:
            # Fetch all patients
            cursor.execute("SELECT id, full_name, email FROM users WHERE role = 'patient'")
            patients = cursor.fetchall()

            # Further data could be fetched here (e.g., appointments, etc.)

            return jsonify({
                "therapist_id": therapist_id,  # Include therapist ID
                "patients": patients  # Include patient data directly
                # Other dashboard data can be added here
            }), 200

        except Error as e:
            print(f"Get Dashboard Data Error: {e}")
            return jsonify({"error": f"Database error: {str(e)}"}), 500
        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"error": "Database connection failed"}), 500

@app.route("/send-notification", methods=["POST"])
# @jwt_required() # REMOVE
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

            # *** PLACEHOLDER:  Actual Sending Logic ***
            # In a real app, you would now send the notification.
            # This is where you'd use libraries like smtplib (email),
            # Twilio (SMS), or schedule a reminder.

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

@app.route("/notifications/<int:user_id>", methods=["GET"])
# @jwt_required() # REMOVE
def get_notifications(user_id):
    """
    Retrieves notifications for a specific user. No JWT authentication required.
    """
    conn = create_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute("SELECT * FROM notifications WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
            notifications = cursor.fetchall()
            return jsonify({"notifications": notifications}), 200
        except Error as e:
            print(f"Fetch Notifications Error: {e}")
            return jsonify({"error": f"Database error: {str(e)}"}), 500
    else:
        return jsonify({"error": "Failed to connect to the database"}), 500

# Route for creating a patient plan (basic structure)
@app.route("/patient-plan", methods=["POST"])
# @jwt_required() # REMOVE
def create_patient_plan():
    data = request.get_json()
    patient_id = data.get('patient_id')
    tasks = data.get('tasks')  # Expect an array of task descriptions

    if not all([patient_id, tasks]):
        return jsonify({"error": "Missing required fields"}), 400

    conn = create_connection()
    if conn:
        cursor = conn.cursor()
        try:
            # Insert the plan header
            cursor.execute("INSERT INTO patient_plans (patient_id, created_at) VALUES (%s, NOW())", (patient_id,))
            plan_id = cursor.lastrowid  # Get the ID of the newly inserted plan

            # Insert tasks related to the plan
            for task in tasks:
                cursor.execute("INSERT INTO plan_tasks (plan_id, task_description) VALUES (%s, %s)", (plan_id, task))

            conn.commit()
            return jsonify({"message": "Patient plan created successfully!", "plan_id": plan_id}), 201

        except Error as e:
            print(f"Create Plan Error: {e}")
            return jsonify({"error": f"Database error: {str(e)}"}), 500

        finally:
            cursor.close()
            conn.close()
    else:
        return jsonify({"error": "Failed to connect to the database"}), 500

if __name__ == '__main__':
    app.run(debug=True)
