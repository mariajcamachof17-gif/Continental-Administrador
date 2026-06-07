const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const CSV_FILE = path.join(__dirname, 'ordenes.csv');

app.use(express.json());
app.use(express.static(__dirname)); // sirve index.html y otros archivos

// Encabezados del CSV (se crean solo si el archivo no existe)
const CSV_HEADERS = 'Fecha,ID Pedido,Nombre Comprador,Correo,Telefono,Sucursal,Direccion,CP,ID Linea,Producto,Cantidad,Estado\n';

if (!fs.existsSync(CSV_FILE)) {
  fs.writeFileSync(CSV_FILE, CSV_HEADERS, 'utf8');
}

// POST /registrar  →  guarda la orden en el CSV
app.post('/registrar', (req, res) => {
  const orden = req.body;

  if (!orden || !Array.isArray(orden.productos) || !orden.productos.length) {
    return res.status(400).json({ ok: false, error: 'Datos inválidos' });
  }

  // Una fila por producto
  const filas = orden.productos.map(p => {
    const campos = [
      orden.fecha      || new Date().toLocaleString('es-MX'),
      orden.idPedido   || '',
      orden.nombre     || '',
      orden.correo     || '',
      orden.telefono   || '',
      orden.sucursal   || '',
      orden.direccion  || '',
      orden.cp         || '',
      p.idLinea        || '',
      p.producto       || '',
      p.cantidad       || '0',
      p.estado         || 'Registrado'
    ].map(v => `"${String(v).replace(/"/g, '""')}"`); // escapa comillas

    return campos.join(',');
  });

  fs.appendFile(CSV_FILE, filas.join('\n') + '\n', 'utf8', err => {
    if (err) {
      console.error('Error al escribir CSV:', err);
      return res.status(500).json({ ok: false, error: 'Error al guardar' });
    }
    console.log(`✅ Orden ${orden.idPedido} guardada (${orden.productos.length} productos)`);
    res.json({ ok: true });
  });
});

// GET /descargar-csv  →  descarga el archivo CSV directamente
app.get('/descargar-csv', (req, res) => {
  if (!fs.existsSync(CSV_FILE)) {
    return res.status(404).send('No hay órdenes aún');
  }
  res.download(CSV_FILE, 'ordenes_continental.csv');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
