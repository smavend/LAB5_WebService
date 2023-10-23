const express = require('express');
const app = express();
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost', // Cambia esto para apuntar a tu servidor local
  user: 'root', // Nombre de usuario de tu base de datos local
  password: '123456', // Contraseña de tu base de datos local
  database: 'hr_v2', // Nombre de tu base de datos local
});
 // Definir la ruta para consultar empleados por managerId
 app.get('/trabajadores/:managerId', (req, res) => {
    console.log('Receiving a request at /trabajadores/:managerId');
    const managerId = req.params.managerId;
    const query = `SELECT * FROM hr_v2.employees WHERE manager_id = ?`;

    connection.query(query, [managerId], (err, result) => {
      if (err) {
        console.error('Error retrieving employees:', err);
        res.status(500).json({ message: 'Error retrieving employees' });
      } else {
        console.log('Successful search for employees with manager_id:', managerId);
        res.json(result);
      }
    });
  });

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos: ' + err.message);
    return;
  }

  console.log('Conexión exitosa a la base de datos local');

  // El resto del código permanece igual

  // Escuchar en el puerto 3000
  app.listen(3000, () => {
    console.log('API escuchando en el puerto 3000');
  });
});