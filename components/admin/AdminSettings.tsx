import React, { useState, useEffect } from 'react';
import { getApiKeys, updateApiKeys } from '../../services/firebase';
import type { ApiKeys } from '../../types';

const AdminSettings: React.FC = () => {
    const [keys, setKeys] = useState<Partial<ApiKeys>>({
        imgbb: '',
        cloudinaryCloudName: '',
        cloudinaryUploadPreset: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('loading');

    useEffect(() => {
        const fetchKeys = async () => {
            setStatus('loading');
            const fetchedKeys = await getApiKeys();
            if (fetchedKeys) {
                setKeys(fetchedKeys);
            }
            setStatus('idle');
        };
        fetchKeys();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('saving');
        try {
            await updateApiKeys(keys as ApiKeys);
            setStatus('saved');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeys(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (status === 'loading') {
        return <div className="p-8 text-center">Loading settings...</div>;
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">API Key Management</h2>
            <p className="text-secondary dark:text-gray-400 mb-6 max-w-xl">Update the API credentials for the third-party services used for media uploads. Incorrect keys will cause image and video uploads to fail.</p>
            <form onSubmit={handleSave} className="space-y-6 max-w-lg">
                <InputField
                    label="ImgBB API Key"
                    name="imgbb"
                    value={keys.imgbb || ''}
                    onChange={handleChange}
                    helpText="Used for all image uploads."
                />
                <InputField
                    label="Cloudinary Cloud Name"
                    name="cloudinaryCloudName"
                    value={keys.cloudinaryCloudName || ''}
                    onChange={handleChange}
                    helpText="Used for video and audio uploads."
                />
                <InputField
                    label="Cloudinary Upload Preset"
                    name="cloudinaryUploadPreset"
                    value={keys.cloudinaryUploadPreset || ''}
                    onChange={handleChange}
                    helpText="The name of your unsigned upload preset in Cloudinary."
                />
                <div>
                    <button type="submit" disabled={status === 'saving'} className="px-6 py-2 bg-accent text-white font-bold rounded-md disabled:bg-blue-300 hover:bg-blue-700 transition-colors">
                        {status === 'saving' ? 'Saving...' : 'Save Settings'}
                    </button>
                    {status === 'saved' && <span className="ml-4 text-green-500 font-semibold">Settings saved successfully!</span>}
                    {status === 'error' && <span className="ml-4 text-red-500 font-semibold">Failed to save settings.</span>}
                </div>
            </form>
        </div>
    );
};

interface InputFieldProps {
    label: string;
    name: keyof ApiKeys;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    helpText: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, helpText }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-bold mb-2 text-secondary dark:text-gray-400">{label}</label>
        <input
            id={name}
            name={name}
            type="text"
            value={value}
            onChange={onChange}
            className="w-full p-3 border dark:border-gray-700 rounded-md bg-background dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent"
            required
        />
        <p className="text-xs text-secondary dark:text-gray-500 mt-1">{helpText}</p>
    </div>
);

export default AdminSettings;