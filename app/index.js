const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(express.json())
app.use(express.urlencoded({ extended: true}))


const connection = mysql.createConnection({
  host: 'db',
  user: 'testuser',
  password: 'shh',
  database: 'mydb',
});

connection.connect((err) => {
  if (err) {
    throw err;
  }

  console.log('db connected');

  const createTablePeopleSQL = `
    CREATE TABLE IF NOT EXISTS People (
      id int NOT NULL AUTO_INCREMENT,
      name varchar(255) NOT NULL,
      PRIMARY KEY (id)
    ); 
  `;
  connection.query(createTablePeopleSQL);
});

async function selectPeople () {
  return await new Promise((resolve, reject) => {
    connection.query('SELECT name FROM People;', function (error, results) {
      if (error) reject(error);

      resolve(results);  
    });
  });
}

async function renderMainPage() {
  const people = (await selectPeople()).map(({name}) => name).join('<br/>');

  const response = `
    <h1>Full Cycle Rocks!</h1><br>
    <form onsubmit="window.location.reload();" id='form' method="POST" action="/">
      <input id='input-name' type='text' name='name' placeholder='Enter your name'>
      <input id='btn' type='submit'>
    </form>
    ${people}
  `;

  return response;
}

app.post('/', (req, res) => {
  const insertIntoPeopleSQL = `
    INSERT INTO People (name) VALUES (?);
  `;
  connection.query(insertIntoPeopleSQL, [req.body.name]);

  res.redirect('/');
});

app.get('/', async (req, res) => {
  const page = await renderMainPage();
  res.send(page);
});

app.listen(port, () => {
  console.log(`listen on port ${port}`);
});