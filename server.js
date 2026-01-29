const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

const app = express();
app.use(express.json());

//start the server
app.listen(port, () => {
    console.log(`Server running on port`, port);
});

app.get('/allanimals', async (req, res) => {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM defaultdb.animal;');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error for allanimals!'});
    }
});


app.post('/addanimal', async (req, res) => {
    const { animal_name, animal_char, animal_desc, animal_habitat, animal_diet, animal_agg, animal_pic } = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('INSERT INTO animal (animal_name, animal_char, animal_desc, animal_habitat, animal_diet, animal_agg, animal_pic) VALUES (?, ?, ?, ?, ?, ?, ?)', [animal_name, animal_char, animal_desc, animal_habitat, animal_diet, animal_agg, animal_pic]);
        res.status(201).json({message: 'Animal '+animal_name+' added successfully.'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error - could not add animal '+animal_name});
    }
});

app.put('/updateanimal/:id', async (req, res) => {
    const { id } = req.params;
    const { animal_name, animal_char, animal_desc, animal_habitat, animal_diet, animal_agg, animal_pic } = req.body;

    try {
        let connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            `UPDATE defaultdb.animal SET animal_name = ?, animal_char = ?, animal_desc = ?, animal_habitat = ?, animal_diet = ?, animal_agg =  ?, animal_pic = ? WHERE id = ?`,
            [animal_name, animal_char, animal_desc, animal_habitat, animal_diet, animal_agg, animal_pic, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `No animal found with id ${id}` });
        }

        res.json({ message: `Animal with id ${id} updated successfully.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Update failed' });
    }
});

app.delete('/deleteanimal/:id', async (req, res) => {
    const { id } = req.params;

    try {
        let connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            'DELETE FROM defaultdb.animal WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `No animal found with id ${id}` });
        }

        res.json({ message: `Animal with id ${id} deleted successfully.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Delete failed' });
    }
});