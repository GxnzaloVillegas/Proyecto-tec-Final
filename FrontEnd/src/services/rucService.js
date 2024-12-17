const API_TOKEN = '634bd2a7a5a7cc15b9240e40b8c858c5f3c0ef58e9b5a74d0191db634523e1cd';

export const consultarRUC = async (ruc) => {
  try {
    console.log('Consultando RUC:', ruc);
    
    const response = await fetch('https://apiperu.dev/api/ruc', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ruc })
    });

    const result = await response.json();
    console.log('Respuesta completa de la API:', result);

    if (!result.success) {
      console.error('Error en la respuesta de la API:', result.message);
      throw new Error(result.message || 'No se encontró información para el RUC proporcionado');
    }

    const datosFormateados = {
      ruc: result.data.ruc,
      raz_soc: result.data.nombre_o_razon_social,
      dir_pro: result.data.direccion_completa,
      estado: result.data.estado,
      condicion: result.data.condicion,
      departamento: result.data.departamento,
      provincia: result.data.provincia,
      distrito: result.data.distrito
    };

    console.log('Datos formateados:', datosFormateados);
    return datosFormateados;
  } catch (error) {
    console.error('Error en consultarRUC:', error);
    throw new Error('Error al consultar el RUC: ' + error.message);
  }
}; 