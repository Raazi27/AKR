import serverless from 'serverless-http';
import app from '../../server.js';
import connectDB from '../../config/db.js';

let cachedConn = null;

export const handler = async (event, context) => {
    // Make sure to wait for the database connection
    if (!cachedConn) {
        cachedConn = await connectDB();
    }
    
    // serverless-http handles the conversion between Netlify events and Express req/res
    const serverlessHandler = serverless(app);
    return serverlessHandler(event, context);
};
