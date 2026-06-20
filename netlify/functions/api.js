import serverless from 'serverless-http';
import app from '../../server.js';
import connectDB from '../../config/db.js';

let cachedConn = null;

export const handler = async (event, context) => {
    // Make sure to wait for the database connection
    if (!cachedConn) {
        const dbConnector = connectDB.default || connectDB;
        cachedConn = await dbConnector();
    }
    
    // serverless-http handles the conversion between Netlify events and Express req/res
    const expressApp = app.default || app;
    const serverlessHandler = serverless(expressApp);
    return serverlessHandler(event, context);
};
