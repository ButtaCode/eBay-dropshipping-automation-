const { connectToDatabase } = require('./utils/database');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { minProfit, maxProfit } = JSON.parse(event.body);
  
  try {
    const db = await connectToDatabase();
    
    await db.collection('automation').updateOne(
      { userId: 'default' },
      { 
        $set: { 
          minProfit: minProfit || 100,
          maxProfit: maxProfit || 150,
          isRunning: true,
          startedAt: new Date(),
          updatedAt: new Date(),
          profitMode: '$100-150 High Profit'
        } 
      },
      { upsert: true }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Automation started successfully',
        settings: { 
          minProfit: minProfit || 100, 
          maxProfit: maxProfit || 150
        }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to start automation' })
    };
  }
};
