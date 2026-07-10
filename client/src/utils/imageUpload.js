import { postDataAPI } from './fetchData'

export const checkImage = (file) => {
    let err = ""
    if(!file) return err = "File does not exist."

    if(file.size > 1024 * 1024 * 5) // 5mb to support larger files
    err = "The largest image size is 5mb."

    if(file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/webp')
    err = "Image format is incorrect."
    
    return err;
}

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

export const imageUpload = async (images, token) => {
    let imgArr = [];
    for(const item of images){
        try {
            const base64Data = item.camera ? item.camera : await fileToBase64(item);
            
            const res = await postDataAPI('upload_media', { file: base64Data }, token);
            
            imgArr.push({ 
                public_id: res.data.public_id, 
                url: res.data.secure_url,
                resource_type: item.type 
            });
        } catch (err) {
            console.error("Upload error:", err);
            throw new Error(err.response?.data?.msg || err.message || "Failed to upload media.");
        }
    }
    return imgArr;
}