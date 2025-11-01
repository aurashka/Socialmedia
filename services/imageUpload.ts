const IMGBB_API_KEY = '5fd2a4346ac2e5485a916a5d734d508b';
const IMGBB_UPLOAD_URL = `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`;

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Image upload failed with status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      return result.data.url;
    } else {
      throw new Error(result.error.message || 'Image upload failed.');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
