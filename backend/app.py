from typing import cast
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import extract, func
import bcrypt
import os
from datetime import timedelta
from dotenv import load_dotenv
import re
import requests
from decimal import Decimal


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

class Chart(db.Model):
    __tablename__ = 'charts'
    chart_id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(255))
    allowed_roles = db.Column(ARRAY(db.String))

class Transaction(db.Model):
    __tablename__ = 'transaction'
    transactionid = db.Column(db.Integer, primary_key=True)
    transactiondate = db.Column(db.DateTime)
    transactionamount = db.Column(db.Numeric)
    channel = db.Column(db.String)  # 'Online', 'Debit Card', 'Credit Card'

class Loan(db.Model):
    __tablename__ = 'loan'
    loanid = db.Column(db.Integer, primary_key=True)
    loantype = db.Column(db.String)  # 'Home', 'Auto', 'Personal'
    loanamount = db.Column(db.Numeric)  # Loan amount
    startdate = db.Column(db.DateTime)  # Start date of the loan

class Account(db.Model):
    __tablename__ = 'account'
    accountid = db.Column(db.Integer, primary_key=True)  # Primary key for the account
    customerid = db.Column(db.Integer, db.ForeignKey('customer.customerid'), nullable=False)  # Foreign key reference to Customer
    accounttype = db.Column(db.String(50), nullable=False)  # Type of account (e.g., Savings, Current)
    opendate = db.Column(db.Date, nullable=False)  # Date when the account was opened
    # Define relationship to Customer
    customer = db.relationship('Customer', backref='accounts', lazy=True)


class Customer(db.Model):
    __tablename__ = 'customer'
    customerid = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(225), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(1), nullable=False)  # M/F/O for Male/Female/Other
    country = db.Column(db.String(30), nullable=False)
    zone = db.Column(db.String(30), nullable=False)
    incomelevel = db.Column(db.String(50), nullable=True)
    customersegment = db.Column(db.String(50), nullable=True)
    riskrating = db.Column(db.Numeric(5, 2), nullable=True)

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

#Email service
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

from sqlalchemy.sql import text

@app.route('/api/get-charts', methods=['GET'])
def get_charts():
    role = request.args.get('role')
    if not role:
        return jsonify({"error": "Role parameter is required"}), 400

    try:
        query = text("SELECT * FROM charts WHERE allowed_roles @> ARRAY[:role]::TEXT[]")
        result = db.session.execute(query, {"role": role})

        charts_data = [
            {"chart_id": row.chart_id, "description": row.description}
            for row in result
        ]
        return jsonify(charts_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/get-transaction-data', methods=['GET'])
def get_transaction_data():
    year = request.args.get('year')

    if not year:
        return jsonify({"error": "Year parameter is missing"}), 400

    try:
        # Query to fetch transaction data grouped by month and channel
        data = db.session.query(
            extract('month', Transaction.transactiondate).label('month'),
            Transaction.channel,
            func.sum(Transaction.transactionamount).label('total_amount')
        ).filter(
            extract('year', Transaction.transactiondate) == int(year)
        ).group_by(
            extract('month', Transaction.transactiondate),
            Transaction.channel
        ).all()

        # Debugging: Log the fetched data
        print(f"Fetched transaction data: {data}")
        
        # Check if no data is found
        if not data:
            return jsonify({"error": "No data found for the given year"}), 404

        # Initialize monthly data with 0 for all channels
        monthly_data = {month: {"Online": 0, "Debit Card": 0, "Credit Card": 0, "ATM": 0} for month in range(1, 13)}
        month_mapping = {1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
                         7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"}

        for row in data:
            month = int(row.month)
            channel = row.channel
            total_amount = float(row.total_amount) if isinstance(row.total_amount, Decimal) else row.total_amount

            # Process valid channels
            if channel not in monthly_data[month]:
                print(f"Ignoring invalid channel: {channel} for month {month}")
                continue

            monthly_data[month][channel] = total_amount  # Converting to float for JSON response

        # Populate the result
        result = {"months": [], "online": [], "debitCard": [], "creditCard": [], "atm": []}
        for month, values in monthly_data.items():
            result["months"].append(month_mapping[month])
            result["online"].append(values["Online"])
            result["debitCard"].append(values["Debit Card"])
            result["creditCard"].append(values["Credit Card"])
            result["atm"].append(values["ATM"])  # Add ATM channel data

        # Debugging: Log the result before returning
        print(f"Returning result: {result}")
        return jsonify(result)

    except Exception as e:
        print(f"Error fetching transaction data: {e}")
        return jsonify({"error": "Failed to fetch transaction data"}), 500

@app.route('/api/get-loan-data', methods=['GET'])
def get_loan_data():
    year = request.args.get('year')
    if not year:
        return jsonify({"error": "Year parameter is missing"}), 400

    try:
        # Query to fetch loan data grouped by loantype for the given year
        data = db.session.query(
            Loan.loantype,
            func.count(Loan.loanid).label('loan_count'),
            func.sum(Loan.loanamount).label('total_loan_amount')
        ).filter(
            extract('year', Loan.startdate) == int(year)
        ).group_by(
            Loan.loantype
        ).all()

        # Check if no data is found
        if not data:
            return jsonify({"error": f"No Loans/Loan Data not available for year {year}"}), 404

        result = {
            "loanTypes": [],
            "loanCounts": [],
            "loanAmounts": []
        }

        for row in data:
            result["loanTypes"].append(row.loantype)
            result["loanCounts"].append(row.loan_count)
            result["loanAmounts"].append(row.total_loan_amount)

        return jsonify(result)

    except Exception as e:
        print(f"Error fetching loan data: {e}")
        return jsonify({"error": "Failed to fetch loan data"}), 500

@app.route('/api/get-countries', methods=['GET'])
def get_countries():
    try:
        countries = db.session.query(Customer.country).distinct().all()
        country_list = [country[0] for country in countries]
        return jsonify(country_list)
    except Exception as e:
        print(f"Error in get-countries: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/get-customer-chart-data', methods=['GET'])
def get_customer_chart_data():
    try:
        country_filter = request.args.get('country', None)
        zones = ["North", "South", "East", "West", "Central"]  # List of all zones

        # Fetch the data
        query = db.session.query(
            func.extract('year', Account.opendate).label('year'),
            Customer.zone,  # Use lowercase 'zone'
            func.count(Customer.customerid).label('customer_count')
        ).join(Customer, Account.customerid == Customer.customerid)

        if country_filter:
            query = query.filter(Customer.country == country_filter)

        query = query.group_by(func.extract('year', Account.opendate), Customer.zone)
        result = query.all()

        # Process the result into the required format
        data = {}
        for row in result:
            year = int(row.year)
            zone = row.zone
            if year not in data:
                data[year] = {z: 0 for z in zones}  # Initialize all zones with 0
            data[year][zone] = row.customer_count  # Update with actual data

        # Ensure all years and zones are accounted for
        all_years = sorted(set(int(row.year) for row in result))
        for year in all_years:
            if year not in data:
                data[year] = {z: 0 for z in zones}  # Add missing years with all zones set to 0
            else:
                for zone in zones:
                    if zone not in data[year]:
                        data[year][zone] = 0  # Add missing zones for existing years

        return jsonify(data)

    except Exception as e:
        print(f"Error in get-customer-chart-data: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500



if __name__ == '__main__':
    app.run(debug=True)
