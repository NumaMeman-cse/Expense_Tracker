from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_PATH = "expenses.db"

# Helper function to get database connection
def get_db():
    conn = sqlite3.connect("expenses.db")
    conn.row_factory = sqlite3.Row
    return conn

# Home route
@app.route("/")
def home():
    return "Expense Tracker Backend is Running!"

# GET all expenses
@app.route("/expenses", methods=["GET"])
def get_expenses():
    try:
        conn = get_db()
        rows = conn.execute("SELECT * FROM expenses ORDER BY id DESC").fetchall()
        conn.close()
        return jsonify([dict(r) for r in rows])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# POST a new expense
@app.route("/expenses", methods=["POST"])
def add_expense():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data sent"}), 400

        title = data.get("title")
        amount = data.get("amount")
        category = data.get("category")
        date = datetime.now().strftime("%Y-%m-%d")

        if not title or not amount or not category:
            return jsonify({"error": "title, amount, category are required"}), 400

        conn = get_db()
        conn.execute(
            "INSERT INTO expenses (title, amount, category, date) VALUES (?, ?, ?, ?)",
            (title, amount, category, date)
        )
        conn.commit()
        conn.close()

        return jsonify({"message": "Expense added successfully"}), 201

    except Exception as e:
        print("Error in POST /expenses:", str(e))
        return jsonify({"error": str(e)}), 500

# DELETE an expense
@app.route("/expenses/<int:id>", methods=["DELETE"])
def delete_expense(id):
    try:
        conn = get_db()
        conn.execute("DELETE FROM expenses WHERE id=?", (id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Expense deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# UPDATE an expense
@app.route("/expenses/<int:id>", methods=["PUT"])
def update_expense(id):
    try:
        data = request.get_json()
        title = data.get("title")
        amount = data.get("amount")
        category = data.get("category")

        if not title or not amount or not category:
            return jsonify({"error": "title, amount, category are required"}), 400

        conn = get_db()
        conn.execute(
            "UPDATE expenses SET title=?, amount=?, category=? WHERE id=?",
            (title, amount, category, id)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Expense updated"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Weekly expenses for chart
@app.route("/weekly-expenses", methods=["GET"])
def weekly_expenses():
    try:
        conn = get_db()
        data = conn.execute("""
            SELECT date, SUM(amount) as total
            FROM expenses
            WHERE date >= date('now','-7 day')
            GROUP BY date
            ORDER BY date ASC
        """).fetchall()
        conn.close()
        result = [{"date": row["date"], "total": row["total"]} for row in data]
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Monthly total
@app.route("/monthly-total", methods=["GET"])
def monthly_total():
    try:
        conn = get_db()
        total = conn.execute("""
            SELECT SUM(amount) as total
            FROM expenses
            WHERE date >= date('now','start of month')
        """).fetchone()
        conn.close()
        return jsonify({"monthly_total": total["total"] or 0})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)