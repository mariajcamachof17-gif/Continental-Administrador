const express = require('express');
const path    = require('path');
 
const app  = express();
const PORT = process.env.PORT || 3000;
 
const AIRTABLE_TOKEN    = 'patkKYSePjkMH5umd.c4240e3e8acb79c8722a9c169a968bdbd6c497181b7daa8e8d7f8f2a71a9569a';
const AIRTABLE_BASE_ID  = 'appwszlST36JSOTuY';
const AIRTABLE_TABLE_ID = 'tbl0rE2WSyQczsrrX';
 
app.use(express.json());
app.use(express.static(__dirname));
 
app.post('/registrar', async (req, res) => {
  const orden = req.body;
 
  if (!orden || !Array.isArray(orden.productos) || !orden.productos.length) {
    return res.status(400).json({ ok: false, error: 'Datos inválidos' });
  }
 
  const records = orden.productos.map(p => ({
    fields: {
      'Fecha':     orden.fecha      || new Date().toLocaleString('es-MX'),
      'ID Pedido': orden.idPedido   || '',
      'Nombre':    orden.nombre     || '',
      'Correo':    orden.correo     || '',
      'Telefono':  orden.telefono   || '',
      'Sucursal':  orden.sucursal   || '',
      'Direccion': orden.direccion  || '',
      'CP':        orden.cp         || '',
      'ID de Linea':       p.idLinea        || '',
      'SKU':       p.sku        || '',
      'Producto':  p.producto       || '',
      'Cantidad':  String(p.cantidad || '0'),
      'Estado':    p.estado         || 'Registrado'
    }
  }));
 
  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({ records })
    });
 
    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || 'Error Airtable');
 
    console.log(`✅ Orden ${orden.idPedido} guardada en Airtable`);
    res.json({ ok: true });
  } catch (e) {
    console.error('Error al guardar en Airtable:', e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});
 
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
