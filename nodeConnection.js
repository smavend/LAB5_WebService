const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'hr_v2', 
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
      if (result.length === 0) {
        // No se encontraron trabajadores para el manager específico o el manager no existe
        res.status(404).json({ message: 'No se encuentran trabajadores para ese manager o el manager no existe.' });
      } else {
        console.log('Successful search for employees with manager_id:', managerId);
        res.json(result);
      }
    }
  });
});


app.get('/buscar/:employeeId', (req, res) => {
  console.log('Receiving a request at /buscar/:employeeId');
  const employeeId = req.params.employeeId;
  const query = `
    SELECT * FROM hr_v2.employees e WHERE e.employee_id = ?`;
  
  connection.query(query, [employeeId], (err, result) => {
    if (err) {
      console.error('Error searching for employee:', err);
      res.status(500).json({ status:'error',
                             message: 'Error del servidor' });
    } else {
      if (result.length === 0) {
        // No se encontró un empleado con ese employee_id
        res.status(404).json({ status: 'error',
                               message: 'No se encontró un empleado con ese employee_id.' });
      } else {
        console.log('Successful search for employee with employee_id:', employeeId);

        // Enviar la respuesta en formato JSON
        res.json({ status: 'success', result});
      }
    }
  });
});

app.post('/asignartutorias/:codigoTutor/:codigoTrabajador', (req, res) => {
  // Obtener los datos del tutor y el empleado

  const codigoTutor = req.params.codigoTutor;
  const codigoTrabajador = req.params.codigoTrabajador;
  console.log("Datos recibidos en la solicitud:", codigoTutor, codigoTrabajador);

  // Realizar las validaciones
  // 1. Verificar si el tutor es el manager del empleado
  const queryTutorManager = "SELECT manager_id FROM hr_v2.employees WHERE employee_id = ?";
  connection.query(queryTutorManager, [codigoTrabajador], (error, tutorResults) => {
    if (error) {
      res.status(200).json({ message: 'Error en la consulta SQL' });
    } else {
      if (tutorResults.length === 0) {
        res.status(200).json({ message: 'El tutor no existe' });
      } else {
        const codigoTutor2 = String(tutorResults[0].manager_id);
        console.log("Codigo tutor del employee: ", codigoTutor2)
        if (codigoTutor2 !== codigoTutor) {
          console.log("Comparar: ", codigoTutor2, codigoTutor)
          res.status(200).json({ message: 'El tutor no es manager del empleado' });
        } else {
          // 2. Verificar si el empleado ya tiene una cita asignada
          const queryMeetingStatus = "SELECT meeting FROM hr_v2.employees WHERE employee_id = ?";
          connection.query(queryMeetingStatus, [codigoTrabajador], (error, meetingResults) => {
            if (error) {
              res.status(500).json({ message: 'Error en la consulta SQL' });
            } else {
              const meetingStatus = meetingResults[0].meeting;
              if (meetingStatus === 1) {
                res.status(200).json({ message: 'El trabajador ya tiene una cita asignada. Elija otro trabajador' });
              } else {
                const newMeetingDate = new Date(); // Obtiene la fecha y hora actual
                newMeetingDate.setDate(newMeetingDate.getDate() + 1); // Suma un día a la fecha actual

                const formattedMeetingDate = newMeetingDate.toISOString().slice(0, 19).replace("T", " "); // Formatea la fecha a 'YYYY-MM-DD HH:mm:ss'

                const updateMeetingStatus = "UPDATE hr_v2.employees SET meeting = 1, meeting_date = ? WHERE employee_id = ?";
                connection.query(updateMeetingStatus, [formattedMeetingDate, codigoTrabajador], (error) => {
                  if (error) {
                    res.status(500).json({ message: 'Error en la consulta SQL' });
                  } else {
                    res.status(200).json({ message: 'Asignación del trabajador con fecha y hora correcta' });
                  }
                });
              }
            }
          });
        }
      }
    }
  });
});
app.post('/feedback',  bodyParser.urlencoded({extended: true}), (req, res) => {
  const employeeId = req.body.employeeId;
  const feedback = req.body.feedback;
  console.log("Datos recibidos en la solicitud:", employeeId, feedback);

  // Realizar las validaciones
  const queryTutorManager = "UPDATE employees SET employee_feedback = ? WHERE employee_id = ?";
  connection.query(queryTutorManager, [feedback, employeeId], (error, results) => {
    if (error) {
      res.status(500).json({ message: 'Error en la consulta SQL' });
    } else {
      res.status(200).json({ message: 'Se ha actualizado correctamente su nuevo feedback.' });
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