const express = require('express');
const app = express();
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

app.use(express.json());

// Configure CORS middleware
const corsOptions = {
    origin: 'https://fiverr-clone-shalini.vercel.app', // Replace with your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: 'Content-Type,Authorization', // Add any other headers your frontend might send
};

app.use(cors(corsOptions));

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    user: process.env.POSTGRES_USER,
    host:process.env.POSTGRES_HOST,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE
});

pool.connect((err, client, release) => {
    if (err) {
        console.error("Error in connection", err);
    } else {
        client.query('SELECT NOW()', (err, result) => {
            release();
            if (err) {
                console.error("Error executing query", err);
            } else {
                console.log("Connected to database", result.rows[0]);
            }
        });
    }
});

app.post('/addtodo', async (req, res) => {
    const { todo, date } = req.body;

    if (!todo || !date) {
        return res.status(400).json({ error: true, message: 'Todo and date are required.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO todo (todo, date) VALUES ($1, $2) RETURNING *',
            [todo, date]
        );
        return res.status(200).json({ error: false, data: result.rows[0] });
    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ error: true, message: 'Database error.' });
    }
});

// Other routes (update, read, delete) as before...
app.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { todo, date } = req.body;

    try {
        const result = await pool.query(
            'UPDATE todo SET todo = $1, date = $2 WHERE id = $3 RETURNING *',
            [todo, date, id]
        );
        return res.status(200).json({ error: false, data: result.rows[0] });
    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ error: true, message: 'Database error.' });
    }
});

app.get('/readtodo/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM todo WHERE id = $1', [id]);
        return res.status(200).json({ error: false, data: result.rows[0] });
    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ error: true, message: 'Database error.' });
    }
});

app.get('/readtodo', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todo');
        return res.status(200).json({ error: false, data: result.rows });
    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ error: true, message: 'Database error.' });
    }
});

app.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM todo WHERE id = $1 RETURNING *', [id]);
        console.log("Row deleted successfully");
        return res.status(200).json({ error: false, data: result.rows[0] });
    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ error: true, message: 'Database error.' });
    }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});
