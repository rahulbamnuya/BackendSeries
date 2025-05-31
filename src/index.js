import dotenv from 'dotenv';
import {app} from './app.js';
import connectDB from './db/index.js';

dotenv.config({
    path:"./env"
})
connectDB().then(()=>{
    app.listen(process.env.PORT||8000, () => {
        console.log(`✅ Server is running on port: ${process.env.PORT}`);
        
    });
}).catch((error) => {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
})
app.get('/', (req, res) => {
    res.send('Hello, World!');
});