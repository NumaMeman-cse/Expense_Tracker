

const API_URL = "http://127.0.0.1:5000/expenses";
let chart;
async function loadExpenses(){

    const response = await fetch(API_URL);
    const data = await response.json();

    const list = document.getElementById("expenseList");
    list.innerHTML = "";

let total = 0;
let categories = {};

data.forEach(expense => {

    total += Number(expense.amount);

    if(categories[expense.category]){
        categories[expense.category] += Number(expense.amount);
    } else {
        categories[expense.category] = Number(expense.amount);
    }

    const li = document.createElement("li");

    li.innerHTML = `
    ${expense.title} - ₹${expense.amount} (${expense.category})
    <button onclick="editExpense(${expense.id}, '${expense.title}', ${expense.amount}, '${expense.category}')">Edit</button>
    <button onclick="deleteExpense(${expense.id})">Delete</button>
`   ;

    list.appendChild(li);

});

document.getElementById("totalAmount").textContent = total;

createChart(categories);

loadWeeklyExpenses();

}

async function addExpense(){

    const title = document.getElementById("title").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;

    await fetch(API_URL,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            title:title,
            amount:amount,
            category:category
        })
    });

    loadExpenses();

    document.getElementById("title").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";
}

async function deleteExpense(id){

    await fetch(`${API_URL}/${id}`,{
        method:"DELETE"
    });

    loadExpenses();
}

loadExpenses();

function createChart(categories){

    const ctx = document.getElementById("expenseChart").getContext("2d");

    const labels = Object.keys(categories);
    const values = Object.values(categories);

    if(chart){
        chart.destroy();
    }

    chart = new Chart(ctx,{
        type:"pie",
        data:{
            labels:labels,
            datasets:[{
               data:values,
               backgroundColor:[
                    "#9ca3af",
                    "#6b7280",
                    "#4b5563",
                    "#374151",
                    "#1f2937"
    ],
    borderWidth:0
}]
        }
    });
}

async function editExpense(id, title, amount, category){

    const newTitle = prompt("Edit title:", title);
    const newAmount = prompt("Edit amount:", amount);
    const newCategory = prompt("Edit category:", category);

    await fetch(`${API_URL}/${id}`,{
        method:"PUT",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            title:newTitle,
            amount:newAmount,
            category:newCategory
        })
    });

    loadExpenses();
}

let weeklyChart;

async function loadWeeklyExpenses(){

    const response = await fetch("http://127.0.0.1:5000/weekly-expenses");

    const data = await response.json();

    const labels = data.map(item => item.date);
    const values = data.map(item => item.total);

    const ctx = document.getElementById("weeklyChart").getContext("2d");

    if(weeklyChart){
        weeklyChart.destroy();
    }

    weeklyChart = new Chart(ctx,{
        type:"line",
        data:{
            labels:labels,
            datasets:[{
                 label:"Weekly Spending",
                 data:values,
                 borderColor:"#9ca3af",
                 backgroundColor:"rgba(156,163,175,0.15)",
                 tension:0.4,
                 fill:true
}]
        }
    });
}