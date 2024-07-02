const express = require('express');
const app = express();
const Pool = require('pg').Pool;
const path = require('path');
const ejs = require('ejs');
const cors = require('cors')
const PORT = 8000;
require('dotenv').config();

app.use(express.json());

app.use(cors())

const pool = new Pool({
    user:process.env.USER_NAME,
    host:process.env.HOST_NAME,
    database:process.env.DB_NAME,
    password:process.env.DB_PASSWORD,
    dialect:process.env.DIALECT,
    port:process.env.PORT_NUMBER


})

pool.connect((err,client,release)=>{
    if(err){
        return console.error("Error in connection")
    }
    client.query('SELECT NOW()', (err,result)=>{
        release()
        if(err){
            return console.error("Error execution query")
        }
        console.log("Connected to database")
    })
})

app.post('/addtodo', async (req, res) => {
    const data = req.body;
    console.log('Request Body:', data); // Log the request body

    if (!data?.todo || !data?.date) {
        return res.status(400).json({ error: true, message: 'Todo and date are required.' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO todo (todo, date) VALUES ($1, $2) RETURNING *`,
            [data.todo, data.date]
        );
 
        console.log('Database Insert Result:', result);
        return res.status(200).json({ error: false, data: result.rows[0] });
    } catch (error) {
        console.error('Database Error:', error);
        return res.status(500).json({ error: true, message: 'Database error.' });
    }
})

app.put('/update/:id', async (req,res) => {
    const {id} = req.params;
    const data = req.body;

    try {
        const result  = await pool.query(`update todo set todo=$1, date=$2 where id=$3`,[data?.todo,data?.date,id]);
        return res.status(201).json({error:false,data:result.rows[0]});

    } catch (error) {
        console.log(error);
        return res.status(400).json({error:true,data: error.message});

        
    }
})

app.get('/readtodo/:id', async (req,res) => {
    const {id} = req.params;
    try { 
        const result =  await pool.query(`select * from todo where id=${id};`);
        console.log('Database  Result:', result);
        return res.status(200).json({ error: false, data: result.rows[0]});
        
    } catch (error) {
        console.log(error);
    }
})

app.get('/readtodo', async (req,res) => {
    
    try { 
        const result =  await pool.query(`select * from todo;`);
        console.log('Database  Result:', result);
        return res.status(200).json({ error: false, data: result});
        
    } catch (error) {
        console.log(error);
    }
})


app.delete('/delete/:id', async (req,res) => {
    const {id} = req.params;
    try {
        const result = await pool.query(`delete from todo where id=$1;`, [id])
        console.log("Row deleted successfully");
        return res.status(200).json({error:false,data:result});
    } catch (error) {
        console.log(error);
        
    }
})

app.listen(PORT, ()=>{console.log(`Server started at port ${PORT}`)})
