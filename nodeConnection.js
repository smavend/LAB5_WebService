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
  const query = `SELECT CONCAT(first_name, ' ', last_name) as full_name, employee_id FROM hr_v2.employees WHERE manager_id = ?`;

  connection.query(query, [managerId], (err, result) => {
    if (err) {
      console.error('Error retrieving employees:', err);
      res.status(500).json({ message: 'Error retrieving employees' });
    } else {
      if (result.length === 0) {
        // No se encontraron trabajadores para el manager específico o el manager no existe
        res.status(404).json({ message: 'No se encuentran trabajadores para ese manager o el manager no existe.' });
      } else {
        console.log('Successful search for employees with manager_id:', managerId);

        // Crear un arreglo con objetos que contienen employee_id y la concatenación de nombres
        const employeesData = result.map((employee) => {
          return {
            employee_id: employee.employee_id,
            full_name: employee.full_name
          };
        });

        // Enviar el arreglo como respuesta
        res.json(employeesData);
      }
    }
  });
});

app.get('/buscar/:employeeId', (req, res) => {
  console.log('Receiving a request at /buscar/:employeeId');
  const employeeId = req.params.employeeId;
  const query = `
    SELECT e.employee_id, CONCAT(e.first_name, ' ', e.last_name) as full_name, e.email, e.phone_number,
           e.hire_date, j.job_title, e.salary, 
           IFNULL(e.commission_pct, '-') as commission_pct,
           e.manager_id,
           IFNULL(d.department_name, '-') as department_name,
           IFNULL(e.meeting, '-') as meeting,
           IFNULL(e.meeting_date, '-') as meeting_date,
           IFNULL(e.employee_feedback, '-') as employee_feedback
    FROM hr_v2.employees e
    LEFT JOIN jobs j ON e.job_id = j.job_id
    LEFT JOIN departments d ON e.department_id = d.department_id
    WHERE e.employee_id = ?`;
  
  connection.query(query, [employeeId], (err, result) => {
    if (err) {
      console.error('Error searching for employee:', err);
      res.status(500).json({ message: 'Error searching for employee' });
    } else {
      if (result.length === 0) {
        // No se encontró un empleado con ese employee_id
        res.status(404).json({ message: 'No se encontró un empleado con ese employee_id.' });
      } else {
        console.log('Successful search for employee with employee_id:', employeeId);

        // Enviar la respuesta en formato JSON
        res.json(result[0]);
      }
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