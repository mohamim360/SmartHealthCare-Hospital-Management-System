import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(file: File) {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new Promise<{ secure_url: string } | null>((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    public_id: file.name.split('.')[0] + '-' + Date.now(),
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error)
                        reject(error)
                        return
                    }
                    resolve(result ? { secure_url: result.secure_url } : null)
                },
            )
            .end(buffer)
    })
}

export const fileUploader = {
    uploadToCloudinary,
}
