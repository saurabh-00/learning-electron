let fruits = [];
let sortAsc = true;
let currentSortColumn = null;
let ws;

const connectWebSocket = () => {
    ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
        console.log('WebSocket connected');
        updateConnectionStatus('Connected', true);
    }

    ws.onclose = () => {
        console.log('WebSocket disconnected');
        updateConnectionStatus('Disconnected', false);
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
    }

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'update') {
            fruits = message.data;
            if (currentSortColumn) {
                sortTable(currentSortColumn, false);
            } else {
                displayFruits(fruits);
            }
        }
    }

    ws.onerror = (error) => {
        console.error('WebSocket error: ', error);
        updateConnectionStatus('Error', false);
    };
}

const updateConnectionStatus = (status, isConnected) => {
    const statusElement = document.getElementById('connection-status');
    statusElement.textContent = `Status: ${status}`;
    statusElement.className = `status-indicator ${isConnected ? 'connected' : 'disconnected'}`;
}

const fetchFruits = async () => {
    try {
        const response = await fetch('http://localhost:3001/fruits');
        fruits = await response.json();
        displayFruits(fruits);
    } catch (e) {
        console.log(e);
    }
}

const displayFruits = (fetchedFruits) => {
    const fruitList = document.getElementById('fruitList');
    fruitList.innerHTML = '';

    fetchedFruits.forEach(fruit => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td><img src="${fruit.image}" alt="${fruit.name}" class="fruit-image"></td>
                    <td>${fruit.name}</td>
                    <td>$${fruit.price}</td>
                `;
        fruitList.appendChild(row);
    })
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

fetchFruits();

connectWebSocket();