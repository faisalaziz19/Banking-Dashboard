from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)  

# Database connection details
DB_CONFIG = {
    'dbname': '',
    'user': '',
    'password': '',
    'host': 'localhost',  
    'port': '5432'
}

# Connect to PostgreSQL
def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print("Database connection failed:", e)
        return None

# API endpoint for login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        query = "SELECT * FROM users WHERE email = %s AND password = %s"
        cursor.execute(query, (email, password))
        user = cursor.fetchone()
        if user:
            return jsonify({"message": "Login successful", "user": user[1]}), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    finally:
        conn.close()

# API endpoint for signup
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        query = "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)"
        cursor.execute(query, (name, email, password, role))
        conn.commit()
        return jsonify({"message": "Signup successful"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        conn.close()

# API endpoint for dashboard data
@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = conn.cursor()
        query = "SELECT id, name, value FROM dashboard_data"
        cursor.execute(query)
        results = cursor.fetchall()
        data = [{"id": row[0], "name": row[1], "value": row[2]} for row in results]
        return jsonify(data), 200
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
