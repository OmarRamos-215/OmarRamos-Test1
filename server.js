'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config({
  path: './config.env'
})

app.use(cors());
app.use(bodyParser.json({
  'limit': '50mb'
}))

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origins', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/students/list', (req, res) => {
  res.send(studentsTable);
})

app.get('/students/single/:id', (req, res) => {
  const id = req.params.id;
  const student = studentsTable.find(student => student.id == id);
  if (student) res.send(student);
  else res.send(`Student not found`);
})

app.post('/students/register', async(req, res) => {
  const values = req.body;
  if (values) {
    values.password = await encrypt(values.password);
    values.id = studentsTable.length+10;
    studentsTable.push(values);
    res.send(`Student ${values.username} added`);
  }
  else res.send('Params not added');
})

app.get('/students/login', async (req, res) => {
  const values = req.body;
  const student = studentsTable.find(student => student.username == values.username);
  if (student) {
    const correctPassword = await bcrypt.compare(values.password, student.password);
    if (correctPassword) {
      res.send(`Welcome ${student.username}`);
    }
    else res.send('pass');
  }
  else res.send('Student not found');
})

app.put('/students/update/:id', (req, res) => {
  const id = req.params.id;
  const values = req.body;
  const student = studentsTable.find(student => student.id == id);
  if (student) {
    const password = encrypt(values.password);
    const updatedStudent = {
      id: id,
      username: values.username || student.username,
      password: password ? password : student.password,
      age: values.age || student.age,
      badge: values.badge || student.badge
    }
    const index = studentsTable.findIndex(student => student.id == id);
    studentsTable.splice(index, 1, updatedStudent);
    res.send(updatedStudent);
  }
  else res.send(`Student not found`);
});

app.delete('/students/delete/:id', (req, res) => {
  const id = req.params.id;
  const student = studentsTable.find(student => student.id == id);
  if (student) {
    const index = studentsTable.findIndex(student => student.id == id);
    studentsTable.splice(index, 1);
  } else {
    res.send('Student not found');
  }
})

const port = process.env.PORT || 3000;  
app.listen(port, () => {
  console.log(`Connection succesfull on port ${port}`);
});

const studentsTable = [
  {id : 1, username : 'omar',  age : 20, badge : 'a6520150016', password : 'hahaiamyourpassword'},
  {id : 2, username : 'alex', age : 20, badge : 'a6529399593', password : 'error'},
  {id : 3, username : 'miguel', age : 21, badge : 'a6524868205', password : 'notWorks'},
  {id : 4, username : 'jonatan', age : 20, badge : 'a6529680353', password : 'hello'},
  {id : 5, username : 'gustavo', age : 24, badge : 'a6529593953', password : 'password'},
];

async function encrypt(message, saltRounds = 10) {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(message, salt); 
  } catch (error) {
    console.log(error);
    return false;
  }
}