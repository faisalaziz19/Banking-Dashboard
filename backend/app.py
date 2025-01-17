from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from flask_sqlalchemy import SQLAlchemy
import bcrypt
import os
from datetime import timedelta
from dotenv import load_dotenv
import re
import requests

load_dotenv()

resend_api_key = os.getenv('RESEND_API_KEY')

app = Flask(__name__)
CORS(app)

# Setup the Flask-JWT-Extended extension
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)

# Configure SQLAlchemy
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URI")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# User model
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default="Pending")

# Helper function to initialize default admin user
def initialize_admin_user():
    admin_email = "ayadav1201@gmail.com"
    admin_password = "Admin@123"
    
    # Check if the admin user already exists
    admin_user = User.query.filter_by(email=admin_email).first()
    
    if not admin_user:
        # Hash the password
        hashed_password = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Create the admin user
        admin_user = User(
            full_name="Admin",
            email=admin_email,
            password=hashed_password,
            role="Admin"
        )
        db.session.add(admin_user)
        db.session.commit()
        print("Admin user added successfully.")
    else:
        print("Admin user already exists.")

# Initialize the database and add admin user
with app.app_context():
    db.create_all()  
    initialize_admin_user()

# Email regex pattern 
EMAIL_REGEX = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"

# List of allowed email domains
ALLOWED_DOMAINS = [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
]

# Signup Route
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('fullName')

    # Basic validation
    if not email or not password or not full_name:
        return jsonify({"error": "All fields are required"}), 400

    # Password length validation
    if len(password) < 5:
        return jsonify({"error": "Password must be at least 5 characters long"}), 400
    
    # Email regex validation
    if not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Invalid email format"}), 400
    
    # Check if the domain is in the allowed list
    domain = email.split('@')[-1]
    if domain not in ALLOWED_DOMAINS:
        return jsonify({"error": "Enter a valid email"}), 400

    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400

    # Hash password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Create new user
    new_user = User(full_name=full_name, email=email, password=hashed_password.decode('utf-8'))
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully. Waiting for role assignment."}), 201

# Login Route
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Basic validation
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Find user by email
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    # Check password
    if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        return jsonify({"error": "Invalid credentials"}), 401

    # Check if user's role is still pending
    if user.role == "Pending":
        return jsonify({"error": "Your account is pending approval. Please wait for role assignment."}), 403

    # Create access token
    access_token = create_access_token(identity={
        "email": user.email,
        "role": user.role,
        "fullName": user.full_name
    })

    return jsonify({
        "token": access_token,
        "user": {
            "email": user.email,
            "role": user.role,
            "fullName": user.full_name
        }
    }), 200

# Get all users or filter by role
@app.route('/api/users', methods=['GET'])
def get_users():
    role = request.args.get('role')  # Get the role query parameter
    
    if role:
        # Filter users by the provided role
        users = User.query.filter_by(role=role).all()
    else:
        # Get all users if no role is provided
        users = User.query.all()

    users_data = [{
        "id": user.id,
        "fullName": user.full_name,
        "email": user.email,
        "role": user.role
    } for user in users]

    return jsonify(users_data), 200

# Update user role
@app.route('/api/users/<email>/role', methods=['PUT'])
def update_user_role(email):
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    new_role = request.json.get('role')
    if not new_role:
        return jsonify({"error": "New role is required"}), 400

    user.role = new_role
    db.session.commit()

    return jsonify({"message": "User role updated successfully"}), 200

# Update user full name
@app.route('/api/users/<email>/name', methods=['PUT'])
def update_user_name(email):
    # Query the database for the user
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Get the new full name from the request
    new_name = request.json.get('fullName')
    if not new_name:
        return jsonify({"error": "New full name is required"}), 400

    # Update the user's full name
    user.full_name = new_name
    db.session.commit()

    return jsonify({"message": "User full name updated successfully"}), 200

# Delete a user
@app.route('/api/users/<email>', methods=['DELETE'])
def delete_user(email):
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Prevent deletion of admin users
    if user.role.lower() == "admin":
        return jsonify({"error": "Cannot delete Admin User"}), 403

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"}), 200

@app.route('/api/send-email', methods=['POST'])
def send_email():
    email_data = request.json
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {resend_api_key}'  # Use the API key from the environment variable
    }
    data = {
        "from": "notification@dashboard-project-ay.site",
        "to": email_data['to'],
        "subject": email_data['subject'],
        "html": email_data['html']
    }

    # Make the request to the Resend API
    response = requests.post('https://api.resend.com/emails', json=data, headers=headers)
    print(f"Resend response status: {response.status_code}")  # Log the response status

    if response.status_code == 200:
        return jsonify(response.json()), 200
    else:
        print(f"Error sending email: {response.text}")  # Log the error
        return jsonify({"error": "Failed to send email"}), response.status_code

if __name__ == '__main__':
    app.run(debug=True)
