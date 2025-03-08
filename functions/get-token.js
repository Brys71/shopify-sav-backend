const axios = require('axios');

exports.handler = async function(event, context) {
  // Activer CORS pour l'extension Chrome
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }
  
  // Vérifier si c'est une requête POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    const { shop, code } = JSON.parse(event.body);
    
    if (!shop || !code) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Shop and code are required' }) 
      };
    }
    
    // Échange du code contre un token d'accès
    const tokenResponse = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code
      }
    );
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        access_token: tokenResponse.data.access_token,
        scope: tokenResponse.data.scope
      })
    };
  } catch (error) {
    console.log('Token exchange error:', error.response?.data || error.message);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Failed to exchange token',
        details: error.message
      })
    };
  }
};
