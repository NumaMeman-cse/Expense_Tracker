
import sqlite3

conn = sqlite3.connect("expenses.db")

cursor = conn.cursor()

# Create table if it does not exist
cursor.execute("""
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT
)
""")

# Ensure old rows get a date value
cursor.execute("""
UPDATE expenses
SET date = date('now')
WHERE date IS NULL
""")

conn.commit()
conn.close()

print("Database setup completed successfully")
