// NOTE: The Cloudinary configuration assumes an unsigned upload preset named 'connectsphere_preset'
// has been created in your Cloudinary account for the cloud name 'creadit-loan-5203b'.
// Admin panel functionality to change these keys can be added in the future.

const IMGBB_API_KEY = '5fd2a4346ac2e5485a916a5d734d508b';
const CLOUDINARY_CLOUD_NAME = 'creadit-loan-5203b';
const CLOUDINARY_UPLOAD_PRESET = 'connectsphere_preset';

interface UploadedMedia {
    url: string;
    type: 'image' | 'video' | 'audio';
}

export const uploadMedia = async (file: File): Promise<UploadedMedia> => {
    const fileType = file.type.split('/')[0];

    if (fileType === 'image') {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Image upload failed');
        }

        const data = await response.json();
        if (data.success) {
            return { url: data.data.url, type: 'image' };
        } else {
            throw new Error(data.error.message || 'Image upload failed on ImgBB');
        }
    } else if (fileType === 'video' || fileType === 'audio') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        // FIX: Explicitly set resource_type to 'video' for both audio and video uploads,
        // as required by Cloudinary for these file types.
        formData.append('resource_type', 'video');

        // FIX: Use the generic '/upload' endpoint which is more robust when resource_type is specified.
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Cloudinary error:', errorData);
            throw new Error(`${fileType} upload failed`);
        }

        const data = await response.json();
        return { url: data.secure_url, type: fileType as 'video' | 'audio' };
    } else {
        throw new Error('Unsupported file type');
    }
};