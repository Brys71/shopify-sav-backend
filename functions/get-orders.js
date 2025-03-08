const axios = require('axios');

exports.handler = async function(event, context) {
  // Activer CORS pour l'extension Chrome
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      }
    };
  }
  
  // Vérifier si c'est une requête GET
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  const { shop, access_token, email, status, created_at_min } = event.queryStringParameters;
  
  if (!shop || !access_token) {
    return { 
      statusCode: 400, 
      body: JSON.stringify({ error: 'Shop and access_token are required' }) 
    };
  }
  
  try {
    let url = `https://${shop}/admin/api/2023-10/orders.json?limit=250`;
    
    // Appliquer les filtres s'ils sont fournis
    if (email) url += `&email=${encodeURIComponent(email)}`;
    if (status) url += `&status=${status}`;
    if (created_at_min) url += `&created_at_min=${created_at_min}`;
    
    const response = await axios.get(url, {
      headers: { 'X-Shopify-Access-Token': access_token }
    });
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response.data.orders)
    };
  } catch (error) {
    console.log('Orders API error:', error.response?.data || error.message);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Failed to fetch orders',
        details: error.message
      })
    };
  }
};
