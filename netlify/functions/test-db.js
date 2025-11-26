const { connectToDatabase } = require('./utils/database');

exports.handler = async (event) => {
  try {
    const db = await connectToDatabase();
    
    const testDoc = {
      username: 'buttababy',
      cluster: 'Butta122',
      test: 'Database connection test',
      timestamp: new Date(),
      status: 'success'
    };
    
    const result = await db.collection('connection_tests').insertOne(testDoc);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: '✅ MongoDB Atlas connection successful!',
        details: {
          cluster: 'Butta122',
          username: 'buttababy',
          database: 'dropship_automation'
        }
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false,
        error: '❌ Database connection failed',
        details: error.message
      })
    };
  }
};
