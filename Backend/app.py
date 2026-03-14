
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

DB_PATH = "expenses.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@app.route("/")
def home():
    return "Expense Tracker Backend is Running!"


# -----------------------------
# GET all expenses
# -----------------------------
@app.route("/expenses", methods=["GET"])
def get_expenses():

    conn = get_db()

    rows = conn.execute(
        "SELECT * FROM expenses ORDER BY id DESC"
    ).fetchall()

    conn.close()

    return jsonify([dict(row) for row in rows])


# -----------------------------
# ADD new expense
# -----------------------------
@app.route("/expenses", methods=["POST"])
def add_expense():

    data = request.get_json()

    title = data.get("title")
    amount = data.get("amount")
    category = data.get("category")

    if not title or amount is None or not category:
        return jsonify({"error": "title, amount, category are required"}), 400

    # automatically store today's date
    date = datetime.now().strftime("%Y-%m-%d")

    conn = get_db()

    conn.execute(
        "INSERT INTO expenses (title, amount, category, date) VALUES (?, ?, ?, ?)",
        (title, amount, category, date)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Expense added successfully"}), 201


# -----------------------------
# DELETE expense
# -----------------------------
@app.route("/expenses/<int:id>", methods=["DELETE"])
def delete_expense(id):

    conn = get_db()

    conn.execute(
        "DELETE FROM expenses WHERE id=?",
        (id,)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Expense deleted"})


# -----------------------------
# UPDATE expense
# -----------------------------
@app.route("/expenses/<int:id>", methods=["PUT"])
def update_expense(id):

    data = request.get_json()

    title = data.get("title")
    amount = data.get("amount")
    category = data.get("category")

    conn = get_db()

    conn.execute(
        "UPDATE expenses SET title=?, amount=?, category=? WHERE id=?",
        (title, amount, category, id)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Expense updated"})


# -----------------------------
# WEEKLY EXPENSE ANALYTICS
# -----------------------------
@app.route("/weekly-expenses", methods=["GET"])
def weekly_expenses():

    conn = get_db()

    rows = conn.execute("""
        SELECT date, SUM(amount) as total
        FROM expenses
        WHERE date >= date('now','-7 day')
        GROUP BY date
        ORDER BY date
    """).fetchall()

    conn.close()

    result = []

    for row in rows:
        result.append({
            "date": row["date"],
            "total": row["total"]
        })

    return jsonify(result)


# -----------------------------
# MONTHLY TOTAL
# -----------------------------
@app.route("/monthly-total", methods=["GET"])
def monthly_total():

    conn = get_db()

    row = conn.execute("""
        SELECT SUM(amount) as total
        FROM expenses
        WHERE date >= date('now','start of month')
    """).fetchone()

    conn.close()

    return jsonify({
        "monthly_total": row["total"] if row["total"] else 0
    })


# -----------------------------
# RUN SERVER
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)

