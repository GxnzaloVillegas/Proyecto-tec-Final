export const validarEmail = async (email) => {
  // Validación básica con regex
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    throw new Error('Formato de correo electrónico inválido');
  }

  // Validación de dominio
  const [, domain] = email.split('@');
  if (!domain) {
    throw new Error('Dominio de correo inválido');
  }

  // Lista de dominios comunes válidos
  const commonDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
  
  // Validación adicional para dominios no comunes
  if (!commonDomains.includes(domain.toLowerCase())) {
    try {
      const hasMxRecord = await checkDomainMX(domain);
      if (!hasMxRecord) {
        throw new Error('El dominio del correo no parece ser válido');
      }
    } catch (error) {
      throw new Error('No se pudo verificar el dominio del correo');
    }
  }

  return true;
};

const checkDomainMX = async (domain) => {
  try {
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
    const data = await response.json();
    return data.Answer && data.Answer.length > 0;
  } catch {
    return false;
  }
}; 