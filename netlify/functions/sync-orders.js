const { connectToDatabase } = require('./utils/database');

exports.handler = async (event) => {
  try {
    const db = await connectToDatabase();
    
    const mockOrders = [
      {
        id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        product: 'Professional DJ Controller with Software',
        status: 'completed',
        profit: 150.00,
        date: new Date().toISOString()
      },
      {
        id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        product: '4K Action Camera with Accessories Kit',
        status: 'processing',
        profit: 130.00,
        date: new Date().toISOString()
      }
    ];

    for (const order of mockOrders) {
      await db.collection('orders').updateOne(
        { id: order.id },
        { $set: order },
        { upsert: true }
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        orders: mockOrders,
        summary: {
          totalOrders: mockOrders.length,
          totalProfit: mockOrders.reduce((sum, order) => sum + order.profit, 0)
        }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to sync orders' })
    };
  }
};
