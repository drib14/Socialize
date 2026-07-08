const fs = require('fs');
const path = require('path');

const uploadPreset = "dwquuisuj_preset";
const cloudName = "dwquuisuj";
const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dwquuisuj/auto/upload";

// Create a simple text file/dummy buffer to upload as raw or image
const dummyFilePath = path.join(__dirname, 'dummy.txt');
fs.writeFileSync(dummyFilePath, 'Hello Cloudinary!');

const run = async () => {
    try {
        console.log("Starting test upload to Cloudinary...");
        // In Node, we can use form-data or standard fetch if available (Node 18+ has fetch)
        const FormData = require('form-data');
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        
        const form = new FormData();
        form.append('file', fs.createReadStream(dummyFilePath));
        form.append('upload_preset', uploadPreset);
        form.append('cloud_name', cloudName);
        
        const res = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: form
        });
        
        const data = await res.json();
        console.log("Cloudinary Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error during upload:", e);
    } finally {
        if (fs.existsSync(dummyFilePath)) {
            fs.unlinkSync(dummyFilePath);
        }
    }
};

run();
