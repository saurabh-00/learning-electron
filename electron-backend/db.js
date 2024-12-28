const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'first_electron_app'
});

db.connect((err) => {
    if (err) {
        console.error('MySQL Database connection failed: ', err);
        return;
    }
    console.log('Connected to MySQL Database');
});

module.exports = db;