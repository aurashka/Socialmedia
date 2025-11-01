import { getApiKeys } from './firebase';
import type { ApiKeys } from '../types';

let apiKeysCache: ApiKeys | null = null;

const fetchAndCacheApiKeys = async (): Promise<ApiKeys> => {
    if (apiKeysCache) {
        return apiKeysCache;
    }
    const keys = await getApiKeys();
    if (!keys || !keys.imgbb || !keys.cloudinaryCloudName || !keys.cloudinaryUploadPreset) {
        console.warn("API keys for media upload are not configured in the admin panel. Using fallback keys. Please configure them for proper functionality.");
        const fallbackKeys: ApiKeys = {
            imgbb: '5fd2a4346ac2e5485a916a5d734d508b',
            cloudinaryCloudName: 'creadit-loan-5203b',
            cloudinaryUploadPreset: 'connectsphere_preset'
        };
        apiKeysCache = fallbackKeys;
        return fallbackKeys;
    }
    apiKeysCache = keys;
    return keys;
};


interface UploadedMedia {
    url: string;
    type: 'image' | 'video' | 'audio';
}

export const uploadMedia = async (file: File): Promise<UploadedMedia> => {
    const keys = await fetchAndCacheApiKeys();
    const fileType = file.type.split('/')[0];

    if (fileType === 'image') {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${keys.imgbb}`, {
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
        formData.append('upload_preset', keys.cloudinaryUploadPreset);
        formData.append('resource_type', 'video');

        const response = await fetch(`https://api.cloudinary.com/v1_1/${keys.cloudinaryCloudName}/upload`, {
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