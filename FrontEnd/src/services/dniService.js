const API_TOKEN = '634bd2a7a5a7cc15b9240e40b8c858c5f3c0ef58e9b5a74d0191db634523e1cd';

export const consultarDNI = async (dni) => {
  try {
    console.log('Consultando DNI:', dni);
    
    const response = await fetch('https://apiperu.dev/api/dni/' + dni, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    console.log('Respuesta completa de la API:', result);

    if (!result.success) {
      console.error('Error en la respuesta de la API:', result.message);
      throw new Error(result.message || 'No se encontró información para el DNI proporcionado');
    }

    const datosFormateados = {
      nombres: result.data.nombres,
      apellido_paterno: result.data.apellido_paterno,
      apellido_materno: result.data.apellido_materno,
      nombre_completo: result.data.nombre_completo
    };

    console.log('Datos formateados:', datosFormateados);
    return datosFormateados;
  } catch (error) {
    console.error('Error en consultarDNI:', error);
    throw new Error('Error al consultar el DNI: ' + error.message);
  }
}; 