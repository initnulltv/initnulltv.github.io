exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { key } = JSON.parse(event.body);
        if (!key) {
            return { statusCode: 400, body: JSON.stringify({ message: "No se proporcionó ninguna clave." }) };
        }
        const validKeysString = process.env.ACCESS_KEYS || '';
        const validKeys = validKeysString.split(','); 

        const isKeyValid = validKeys.includes(key.trim());

        if (isKeyValid) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Acceso concedido" })
            };
        } else {
            return {
                statusCode: 401, 
                body: JSON.stringify({ message: "Clave de acceso incorrecta." })
            };
        }

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: "Error interno del servidor." }) };
    }
};