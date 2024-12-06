from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
import bcrypt
import json
import os
from datetime import timedelta
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Setup the Flask-JWT-Extended extension
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)

# Ensure the data directory exists
if not os.path.exists('data'):
    os.makedirs('data')

# Create users.json with admin user if it doesn't exist
def initialize_users_file():
    if not os.path.exists('data/users.json'):
        admin_password = "Admin@123"
        hashed_password = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt())
        initial_users = {
            "users": [
                {
                    "email": "admin@ltimindtree.com",
                    "password": hashed_password.decode('utf-8'),
                    "fullName": "Admin User",
                    "role": "admin"
                }
            ]
        }
        with open('data/users.json', 'w') as f:
            json.dump(initial_users, f, indent=4)

# Initialize the users file when the app starts
initialize_users_file()

# Helper function to read users from file
def read_users():
    with open('data/users.json', 'r') as f:
        return json.load(f)

# Helper function to write users to file
def write_users(users_data):
    with open('data/users.json', 'w') as f:
        json.dump(users_data, f, indent=4)


@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('fullName')

    # Basic validation
    if not email or not password or not full_name:
        return jsonify({"error": "All fields are required"}), 400

    if len(password) < 5:
        return jsonify({"error": "Password must be at least 5 characters long"}), 400

    # Read existing users
    users_data = read_users()
    
    # Check if email already exists
    if any(user['email'] == email for user in users_data['users']):
        return jsonify({"error": "Email already registered"}), 400

    # Hash password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Create new user
    new_user = {
        "email": email,
        "password": hashed_password.decode('utf-8'),
        "fullName": full_name,
        "role": "pending"
    }

    # Add user to database
    users_data['users'].append(new_user)
    write_users(users_data)

    return jsonify({"message": "User registered successfully. Waiting for role assignment."}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Basic validation
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Read users
    users_data = read_users()
    
    # Find user
    user = next((user for user in users_data['users'] if user['email'] == email), None)
    
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    # Check password
    if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({"error": "Invalid credentials"}), 401

    # Check if user's role is still pending
    if user['role'] == "pending":
        return jsonify({"error": "Your account is pending approval. Please wait for role assignment."}), 403

    # Create access token
    access_token = create_access_token(identity={
        "email": user['email'],
        "role": user['role'],
        "fullName": user['fullName']
    })

    return jsonify({
        "token": access_token,
        "user": {
            "email": user['email'],
            "role": user['role'],
            "fullName": user['fullName']
        }
    }), 200

@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    # Get current user's identity
    current_user = get_jwt_identity()
    
    # Check if user is admin
    if current_user.get('role') != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    # Read and return all users (excluding password hashes)
    users_data = read_users()
    users_list = [{
        "email": user['email'],
        "fullName": user['fullName'],
        "role": user['role']
    } for user in users_data['users']]
    
    return jsonify({"users": users_list}), 200

@app.route('/api/users/<email>/role', methods=['PUT'])
@jwt_required()
def update_user_role(email):
    # Get current user's identity
    current_user = get_jwt_identity()
    
    # Check if user is admin
    if current_user.get('role') != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    data = request.get_json()
    new_role = data.get('role')

    # Validate new role
    valid_roles = ["Business Leader", "Marketing Analyst", "pending", "admin"]
    if new_role not in valid_roles:
        return jsonify({"error": "Invalid role"}), 400

    # Read users
    users_data = read_users()
    
    # Find and update user
    user_found = False
    for user in users_data['users']:
        if user['email'] == email:
            user['role'] = new_role
            user_found = True
            break

    if not user_found:
        return jsonify({"error": "User not found"}), 404

    # Save updated users
    write_users(users_data)

    return jsonify({"message": "User role updated successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True)