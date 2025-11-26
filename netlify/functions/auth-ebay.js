const { connectToDatabase } = require('./utils/database');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const clientId = process.env.EBAY_APP_ID;
    const redirectUri = `${process.env.URL}/.netlify/functions/auth-callback`;
    const scope = 'https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.account';
    
    const authUrl = `https://auth.ebay.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&prompt=login`;
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        authUrl,
        message: 'Redirecting to eBay authentication...'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to initiate authentication' })
    };
  }
};
