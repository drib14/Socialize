require('dotenv').config()
const mongoose = require('mongoose')

const clearDatabase = async () => {
    try {
        const URI = process.env.MONGO_URI
        if (!URI) {
            console.error('MONGO_URI is missing in .env')
            process.exit(1)
        }

        console.log('Connecting to database...')
        await mongoose.connect(URI)
        console.log('Connected!')

        const db = mongoose.connection.db
        const collections = await db.listCollections().toArray()

        for (let col of collections) {
            console.log(`Clearing collection: ${col.name}`)
            await db.collection(col.name).deleteMany({})
        }

        console.log('Database successfully cleared!')
        await mongoose.disconnect()
        process.exit(0)
    } catch (err) {
        console.error('Error clearing database:', err)
        process.exit(1)
    }
}

clearDatabase()
