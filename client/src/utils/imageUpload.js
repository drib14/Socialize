export const checkImage = (file) => {
    let err = ""
    if(!file) return err = "File does not exist."

    if(file.size > 1024 * 1024) // 1mb
    err = "The largest image size is 1mb."

    if(file.type !== 'image/jpeg' && file.type !== 'image/png' )
    err = "Image format is incorrect."
    
    return err;
}


export const imageUpload = async (images) => {
    let imgArr = [];
    for(const item of images){
        const formData = new FormData()

        if(item.camera){
            formData.append("file", item.camera)
        }else{
            formData.append("file", item)
        }
        
        const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET || "dwquuisuj_preset";
        const cloudName = process.env.REACT_APP_CLOUD_NAME || "dwquuisuj";
        const cloudinaryUrl = process.env.REACT_APP_CLOUDINARY_URL || "https://api.cloudinary.com/v1_1/dwquuisuj/auto/upload";

        formData.append("upload_preset", uploadPreset)
        formData.append("cloud_name", cloudName)

        const res = await fetch(cloudinaryUrl, {
            method: "POST",
            body: formData
        })
        
        if(!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData?.error?.message || `Upload failed with status ${res.status}`);
        }

        const data = await res.json()
        if(data.error) {
            throw new Error(data.error.message);
        }

        imgArr.push({public_id: data.public_id, url: data.secure_url})
    }
    return imgArr;
}