const express = require('express');
const cors = require('cors');
const db = require('./db');
const WebSocket = require('ws');
const ZongJi = require('zongji');

const app = express();
app.use(cors());
app.use(express.json());

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Store connected clients
const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected');

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});

// Broadcast updates to all connected clients
const broadcastUpdate = () => {
    db.query('SELECT * FROM fruits', (err, results) => {
        if (err) {
            console.error('Error fetching updated data: ', err);
            return;
        }

        const updateMessage = JSON.stringify({
            type: 'update',
            data: results
        });

        clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(updateMessage);
            }
        });
    });
}

// Set up MySQL binlog monitoring
const zongji = new ZongJi({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'first_electron_app'
});

// Start binlog monitoring
zongji.start({
    includeSchema: {
        'first_electron_app': ['fruits']  // Monitor only the fruits table in our db
    },
    includeEvents: ['writerows', 'updaterows', 'deleterows', 'tablemap']
});

zongji.on('binlog', (evt) => {
    evt.dump();
    broadcastUpdate();
    // if (evt.getEventName() === 'writerows' || evt.getEventName() === 'updateRows' || evt.getEventName() === 'deleteRows' || evt.getEventName() === 'tablemap') {
    //     // Check if the event is for our fruits table
    //     if (evt.tableMap[evt.tableId].tableName === 'fruits') {
    //         console.log('Database Table change detected');
    //         broadcastUpdate();
    //     }
    // }
});

process.on('SIGINT', () => {
    console.log('Stopping binlog monitoring...');
    zongji.stop();
    process.exit();
});

app.get('/fruits', (req, res) => {
    db.query('SELECT * FROM fruits', (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});