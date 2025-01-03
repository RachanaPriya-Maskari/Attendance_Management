// server.js
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;
const filePath = './students.json';

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to read/write JSON file
const readData = () => {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
    return JSON.parse(fs.readFileSync(filePath));
};

const writeData = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Routes
app.get('/students', (req, res) => {
    const data = readData();
    res.json(data);
});

app.post('/students', (req, res) => {
    const { name, rollNumber } = req.body;
    const data = readData();
    data.push({ name, rollNumber, status: null});
    writeData(data);
    res.status(201).json({ message: 'Student added successfully!' });
});

app.put('/students/:rollNumber', (req, res) => {
    const { rollNumber } = req.params;
    const { name, status } = req.body;
    const data = readData();
    const student = data.find((s) => s.rollNumber === rollNumber);
    if (student) {
        student.name = name || student.name;
        student.status = status !== undefined ? status : student.status;
        writeData(data);
        res.json({ message: 'Student updated successfully!' });
    } else {
        res.status(404).json({ message: 'Student not found!' });
    }
});

app.delete('/students/:rollNumber', (req, res) => {
    const { rollNumber } = req.params;
    let data = readData();
    data = data.filter((s) => s.rollNumber !== rollNumber);
    writeData(data);
    res.json({ message: 'Student deleted successfully!' });
});

app.post('/export', (req, res) => {
    const data = readData();
    const today = new Date().toISOString().split('T')[0];
    const csv = [
        'Roll Number,Name,Present',
        ...data.map(({ rollNumber, name, status }) => `${rollNumber},${name},${status === true ? 1 : 0}`),
    ].join('\n');

    const filename = `attendance_${today}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment;filename=${filename}`);
    res.send(csv);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
