from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from flask_sqlalchemy import SQLAlchemy
import bcrypt
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Setup the Flask-JWT-Extended extension
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
jwt = JWTManager(app)

# Configure SQLAlchemy
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:postroot@localhost:5432/BankProjectData"
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
    db.create_all()  # Ensure all tables are created
    initialize_admin_user()

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

    if len(password) < 5:
        return jsonify({"error": "Password must be at least 5 characters long"}), 400

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

# Get all users (for admin)
@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    users_data = [{
        "id": user.id,
        "fullName": user.full_name,
        "email": user.email,
        "role": user.role
    } for user in users]
    return jsonify(users_data), 200

# Update user role (Admin Only)
@app.route('/api/users/<email>/role', methods=['PUT'])
@jwt_required()
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

# Delete a user
@app.route('/api/users/<email>', methods=['DELETE'])
@jwt_required()
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


if __name__ == '__main__':
    app.run(debug=True)
