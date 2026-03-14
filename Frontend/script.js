const API_URL = "http://127.0.0.1:5000/expenses";

let categoryChart;
let weeklyChart;


// LOAD EXPENSES
async function loadExpenses() {
    try {
        const res = await fetch(API_URL);

        if (!res.ok) {
            console.error("Failed to fetch expenses");
            return;
        }

        const expenses = await res.json();

        const list = document.getElementById("expenseList");
        list.innerHTML = "";

        let total = 0;
        let categories = {};

        expenses.forEach(exp => {

            total += Number(exp.amount);

            if (categories[exp.category]) {
                categories[exp.category] += Number(exp.amount);
            } else {
                categories[exp.category] = Number(exp.amount);
            }

            const li = document.createElement("li");

            li.innerHTML = `
                ${exp.title} - ₹${exp.amount} (${exp.category})
                <span>
                    <button onclick="editExpense(${exp.id}, '${exp.title}', ${exp.amount}, '${exp.category}')">Edit</button>
                    <button onclick="deleteExpense(${exp.id})">Delete</button>
                </span>
            `;

            list.appendChild(li);

        });

        document.getElementById("totalAmount").textContent = total;

        drawCategoryChart(categories);

        loadWeeklyChart();

    } catch (error) {
        console.error("Error loading expenses:", error);
    }
}



async function addExpense() {

    const title = document.getElementById("title").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;

    if (!title || !amount || !category) {
        alert("Please fill all fields");
        return;
    }

    try {

        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                amount: amount,
                category: category
            })
        });

        if (!res.ok) {
            const txt = await res.text();
            console.error("Server error:", txt);
            alert("Server error. Check console.");
            return;
        }

        document.getElementById("title").value = "";
        document.getElementById("amount").value = "";
        document.getElementById("category").value = "";

        loadExpenses();

    } catch (error) {
        console.error("Add expense error:", error);
    }
}



async function deleteExpense(id) {

    try {

        await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        loadExpenses();

    } catch (error) {
        console.error("Delete error:", error);
    }

}



async function editExpense(id, oldTitle, oldAmount, oldCategory) {

    const newTitle = prompt("Edit title", oldTitle);
    const newAmount = prompt("Edit amount", oldAmount);
    const newCategory = prompt("Edit category", oldCategory);

    if (!newTitle || !newAmount || !newCategory) return;

    try {

        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: newTitle,
                amount: Number(newAmount),
                category: newCategory
            })
        });

        loadExpenses();

    } catch (error) {
        console.error("Update error:", error);
    }

}



function drawCategoryChart(categories) {

    const ctx = document.getElementById("expenseChart").getContext("2d");

    if (categoryChart) {
        categoryChart.destroy();
    }

    categoryChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    "#4b5563",
                    "#6b7280",
                    "#9ca3af",
                    "#374151",
                    "#1f2937"
                ]
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: "#e5e5e5"
                    }
                }
            }
        }
    });

}



async function loadWeeklyChart() {

    try {

        const res = await fetch("http://127.0.0.1:5000/weekly-expenses");

        if (!res.ok) return;

        const data = await res.json();

        const labels = data.map(d => d.date);
        const values = data.map(d => d.total);

        const ctx = document.getElementById("weeklyChart").getContext("2d");

        if (weeklyChart) {
            weeklyChart.destroy();
        }

        weeklyChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Weekly Spending",
                    data: values,
                    borderColor: "#e5e5e5",
                    backgroundColor: "rgba(229,229,229,0.1)",
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            color: "#e5e5e5"
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: "#e5e5e5" }
                    },
                    y: {
                        ticks: { color: "#e5e5e5" }
                    }
                }
            }
        });

    } catch (error) {
        console.error("Weekly chart error:", error);
    }

}



loadExpenses();