let fruits = [];
let sortAsc = true;
let currentSortColumn = null;

// Initialize WebSocket handlers
window.fruitsAPI.onWebSocketStatus((status) => {
    const statusElement = document.getElementById('connection-status');
    statusElement.textContent = status.connected ? 'Connected' : 'Disconnected';
    statusElement.className = `status-indicator ${status.connected ? 'Connected' : 'Disconnected'}`;
    if (status.error) {
        statusElement.textContent += ` (Error: ${status.error})`;
    }
});

window.fruitsAPI.onWebSocketMessage((data) => {
    if (data.type === 'update') {
        fruits = data.data;
        if (currentSortColumn) {
            sortTable(currentSortColumn, false);
        } else {
            displayFruits(fruits);
        }
    }
});

const fetchFruits = async () => {
    try {
        const result = await window.fruitsAPI.getFruits();
        if (result.success) {
            fruits = result.data;
            displayFruits(fruits);
        } else {
            console.error('Error fetching fruits: ', result.error);
        }
    } catch (error) {
        console.error('Error: ', error);
    }
}

const displayFruits = (fruitsToDisplay) => {
    const fruitList = document.getElementById('fruitList');
    fruitList.innerHTML = '';

    fruitsToDisplay.forEach(fruit => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td><img src="${fruit.image}" alt="${fruit.name}" class="fruit-image"></td>
                    <td>${fruit.name}</td>
                    <td>$${fruit.price}</td>
                `;
        fruitList.appendChild(row);
    });
}

const sortTable = (column, toggleSort = true) => {
    if (toggleSort) {
        sortAsc = currentSortColumn === column ? !sortAsc : true;
    }
    currentSortColumn = column;

    fruits.sort((a, b) => {
        const valueA = a[column];
        const valueB = b[column];

        if (sortAsc) {
            return valueA > valueB ? 1 : -1;
        } else {
            return valueA < valueB ? 1 : -1;
        }
    });

    displayFruits(fruits);
}

// Initial load
fetchFruits();