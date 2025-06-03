require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a PostgreSQL usando las variables de entorno
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST, 
    dialect: 'postgres', 
    port: process.env.DB_PORT || 5433, 
  }
);


// Modelos
const Empresa = sequelize.define('Empresa', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,  
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, 
  },
});

const Usuario = sequelize.define('Usuario', {
  username: {
    type: DataTypes.STRING,
    unique: true,
  },
  password: DataTypes.STRING,
  estado: {
    type: DataTypes.ENUM('disponible', 'descanso', 'dia_libre'),
    defaultValue: 'disponible'
  }
});



const Ticket = sequelize.define('Ticket', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  fecha: { type: DataTypes.DATEONLY, allowNull: false },
  hora: { type: DataTypes.STRING, allowNull: false },
  dni: { type: DataTypes.STRING, allowNull: false },
  mensaje: { type: DataTypes.TEXT, allowNull: false },
  resuelto: { type: DataTypes.BOOLEAN, defaultValue: false },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: Usuario, key: 'id' }
  }
});

const Solicitud = sequelize.define('Solicitud', {
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  mensaje: { type: DataTypes.TEXT, allowNull: false },
  empresaId: { type: DataTypes.INTEGER, allowNull: false } 
});


Usuario.belongsTo(Empresa, { foreignKey: 'empresaId', onDelete: 'SET NULL' });
Empresa.hasMany(Usuario, { foreignKey: 'empresaId' });

Ticket.belongsTo(Empresa, { foreignKey: 'empresaId', onDelete: 'CASCADE' }); 
Empresa.hasMany(Ticket, { foreignKey: 'empresaId', onDelete: 'CASCADE' });

Ticket.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'EmpleadoAsignado' });
Usuario.hasMany(Ticket, { foreignKey: 'usuarioId', as: 'TicketsAsignados' });





Solicitud.belongsTo(Empresa, { foreignKey: 'empresaId' });
Empresa.hasMany(Solicitud, { foreignKey: 'empresaId' });

sequelize.sync({ alter: true })
  .then(() => console.log('Base de datos sincronizada'))
  .catch(err => console.error('Error sincronizando la base de datos:', err));


// --- ENDPOINTS ---

// Endpoint de prueba
app.get('/api/test', (req, res) => {
  res.send('API funcionando');
});

// Registro de usuario (empleado)
app.post('/api/register-employee', async (req, res) => {
  const { username, password, empresaId } = req.body;
  if (!empresaId) return res.status(400).json({ error: 'Se debe asignar un empresaId al empleado' });

  try {
    const nuevoUsuario = await Usuario.create({ username, password, empresaId });
    res.json(nuevoUsuario);
  } catch (err) {
    console.error('Error al registrar el empleado:', err);
    res.status(400).json({ error: 'Error al registrar el empleado' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await Usuario.findOne({ where: { username, password } });
  if (user) {
    res.json({
      success: true,
      usuario: {
        id: user.id,
        username: user.username,
        empresaId: user.empresaId,
      }
    });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

// Crear ticket con asignación automática
app.post('/api/ticket', async (req, res) => {
  const { nombre, fecha, hora, dni, mensaje, empresaId } = req.body;

  if (!empresaId) {
    return res.status(400).json({ error: 'Se debe seleccionar una empresa para el ticket.' });
  }

  const ticketExistente = await Ticket.findOne({ where: { empresaId, fecha, hora } });

  if (ticketExistente) {
    return res.status(400).json({ error: 'La hora seleccionada ya está ocupada en esta empresa.' });
  }

  try {
    const empleados = await Usuario.findAll({
      where: { 
        empresaId,
        estado: 'disponible'
      }
    });

    if (!empleados || empleados.length === 0) {
      return res.status(400).json({ error: 'No hay empleados DISPONIBLES en esta empresa para asignar el ticket.' });
    }

    const empleadosConContador = await Promise.all(
      empleados.map(async empleado => {
        const pendientes = await Ticket.count({
          where: { usuarioId: empleado.id, resuelto: false }
        });
        return { empleado, pendientes };
      })
    );
    empleadosConContador.sort((a, b) => a.pendientes - b.pendientes);
    const empleadoAsignado = empleadosConContador[0].empleado;

    const ticket = await Ticket.create({
      nombre,
      fecha,
      hora,
      mensaje,
      dni,
      empresaId,
      usuarioId: empleadoAsignado.id
    });

    res.json(ticket);
  } catch (err) {
    console.error('❌ Error al crear el ticket:', err);
    res.status(500).json({ error: 'Error al crear el ticket' });
  }
});

// Cambiar contraseña de usuario
app.put('/api/usuario/:id/password', async (req, res) => {
  const { id } = req.params;
  const { nuevaPassword } = req.body;
  if (!nuevaPassword || nuevaPassword.length < 3) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 3 caracteres.' });
  }
  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    usuario.password = nuevaPassword;
    await usuario.save();
    res.json({ message: 'Contraseña actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
});


// Cambiar estado de usuario
app.put('/api/usuario/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  if (!['disponible', 'descanso', 'dia_libre'].includes(estado)) {
    return res.status(400).json({ error: 'Estado no válido.' });
  }
  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    usuario.estado = estado;
    await usuario.save();
    res.json({ message: 'Estado actualizado', usuario });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el estado del usuario' });
  }
});

// Obtener usuario por id
app.get('/api/usuario/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await Usuario.findByPk(id, {
      include: [{ model: Empresa, attributes: ['nombre'] }]
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
});


// OBTENER TICKETS (FLEXIBLE)
app.get('/api/ticket', async (req, res) => {
  const { empresaId, dni, fecha } = req.query;
  const whereCondition = {};
  if (empresaId) whereCondition.empresaId = empresaId;
  if (dni) whereCondition.dni = dni;
  if (fecha) whereCondition.fecha = fecha;

  try {
    const tickets = await Ticket.findAll({
      where: whereCondition,
      include: [
        { model: Empresa, attributes: ['nombre'] },
        { model: Usuario, as: 'EmpleadoAsignado', attributes: ['username'] }
      ]
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los tickets' });
  }
});

// Marcar ticket como resuelto
app.put('/api/ticket/:id/resuelto', async (req, res) => {
  const { id } = req.params;
  try {
    const ticket = await Ticket.findByPk(id);
    if (ticket) {
      ticket.resuelto = true;
      await ticket.save();
      res.json({ message: 'Ticket marcado como resuelto' });
    } else {
      res.status(404).json({ error: 'Ticket no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al marcar el ticket como resuelto' });
  }
});

// Borrar ticket
app.delete('/api/ticket/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const eliminado = await Ticket.destroy({ where: { id } });
    if (eliminado) {
      res.json({ message: 'Ticket eliminado' });
    } else {
      res.status(404).json({ error: 'Ticket no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al borrar el ticket' });
  }
});

// Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      include: {
        model: Empresa,
        attributes: ['nombre'],
      },
    });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// Endpoint para solicitudes de contacto
app.post('/api/contacto', async (req, res) => {
  const { nombre, email, mensaje, empresaId } = req.body;
  if (!nombre || !email || !mensaje || !empresaId) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  try {
    const nuevaSolicitud = await Solicitud.create({ nombre, email, mensaje, empresaId });
    res.json({ success: true, message: 'Tu solicitud ha sido enviada al administrador.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar la solicitud' });
  }
});


app.get('/api/solicitudes', async (req, res) => {
  try {
    const solicitudes = await Solicitud.findAll({
      include: [{ model: Empresa, attributes: ['nombre'] }]
    });
    res.json(solicitudes);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las solicitudes' });
  }
});


app.delete('/api/solicitudes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const eliminado = await Solicitud.destroy({ where: { id } });
    if (eliminado) {
      res.json({ message: 'Solicitud eliminada' });
    } else {
      res.status(404).json({ error: 'Solicitud no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al borrar la solicitud' });
  }
});

// EMPRESAS

app.post('/api/empresa', async (req, res) => {
  const { nombre, activo } = req.body;
  try {
    const nuevaEmpresa = await Empresa.create({ nombre, activo });
    res.json(nuevaEmpresa);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear la empresa' });
  }
});

app.get('/api/empresa', async (req, res) => {
  try {
    const empresas = await Empresa.findAll();
    res.json(empresas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener las empresas' });
  }
});

app.get('/api/empresa/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const empresa = await Empresa.findByPk(id);
    if (empresa) {
      res.json(empresa);
    } else {
      res.status(404).json({ error: 'Empresa no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener detalles de la empresa' });
  }
});

app.put('/api/empresa/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, activo } = req.body;
  try {
    const empresa = await Empresa.findByPk(id);
    if (empresa) {
      empresa.nombre = nombre || empresa.nombre;
      empresa.activo = activo !== undefined ? activo : empresa.activo;
      await empresa.save();
      res.json(empresa);
    } else {
      res.status(404).json({ error: 'Empresa no encontrada' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar la empresa' });
  }
});

app.delete('/api/empresa/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const empresa = await Empresa.findByPk(id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    await empresa.destroy();
    res.json({ message: 'Empresa eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la empresa' });
  }
});

// Tickets asignados a un usuario
app.get('/api/ticket-asignados', async (req, res) => {
  const { usuarioId } = req.query;
  if (!usuarioId) return res.status(400).json({ error: 'Falta usuarioId' });

  try {
    const tickets = await Ticket.findAll({
      where: { usuarioId, resuelto: false },
      include: [
        { model: Empresa, attributes: ['nombre'] },
        { model: Usuario, as: 'EmpleadoAsignado', attributes: ['username'] }
      ]
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los tickets asignados' });
  }
});

// Borrar usuario
app.delete('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const eliminado = await Usuario.destroy({ where: { id } });
    if (eliminado) {
      res.json({ message: 'Usuario eliminado' });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error al borrar el usuario' });
  }
});

// Asignar ticket manualmente (si algún flujo lo requiere)
app.put('/api/ticket/:id/asignar', async (req, res) => {
  const { id } = req.params;
  const { usuarioId } = req.body;

  if (!usuarioId) return res.status(400).json({ error: 'No se ha proporcionado el id del usuario' });

  try {
    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ error: 'Ticket no encontrado' });

    ticket.usuarioId = usuarioId;
    await ticket.save();

    res.json({ message: 'Ticket asignado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al asignar el ticket' });
  }
});



// Usar el puerto proporcionado por la plataforma o el puerto por defecto (3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ Conectado a PostgreSQL');
    return sequelize.sync();
  })
  .then(() => {
    console.log('📦 Tablas sincronizadas');
  })
  .catch(err => {
    console.error('❌ Error al conectar o sincronizar:', err);
  });
