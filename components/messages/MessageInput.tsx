import React, { useState, useRef } from 'react';
import type { User, Conversation } from '../../types';
import { sendMessage } from '../../services/firebase';
import { uploadMedia } from '../../services/mediaUpload';
import { PlusIcon, MicrophoneIcon, TrashIcon } from '../Icons';

interface MessageInputProps {
  currentUser: User;
  conversation: Conversation;
}

const MessageInput: React.FC<MessageInputProps> = ({ currentUser, conversation }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (text.trim()) {
      await sendMessage(conversation.id, currentUser.id, { text: text.trim() });
      setText('');
    }
    if (audioBlob) {
        // First upload, then send
        // FIX: Convert Blob to File, call uploadMedia with one argument, and use the returned URL.
        const audioFile = new File([audioBlob], "voice-message.webm", { type: audioBlob.type });
        const uploadedMedia = await uploadMedia(audioFile);
        await sendMessage(conversation.id, currentUser.id, { mediaUrl: uploadedMedia.url, mediaType: 'audio' });
        setAudioBlob(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        try {
            const { url, type } = await uploadMedia(file);
            // FIX: Ensure mediaType is one of 'image', 'video', or 'audio'. The sendMessage function now accepts 'video'.
            await sendMessage(conversation.id, currentUser.id, { mediaUrl: url, mediaType: type });
        } catch (error) {
            console.error("Failed to upload and send media:", error);
            alert("Could not send media file.");
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }
  }

  const handleStartRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setAudioBlob(audioBlob);
            stream.getTracks().forEach(track => track.stop()); // Stop microphone access
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
    } catch (err) {
        console.error("Microphone access denied:", err);
        alert("Microphone access is required to record voice messages.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const handleRecordButtonClick = () => {
    if (isRecording) {
        handleStopRecording();
    } else {
        handleStartRecording();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleMediaUpload} />
      <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
        <PlusIcon className="w-6 h-6 text-accent"/>
      </button>

      {audioBlob ? (
        <div className="flex-1 flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2">
            <span className="text-sm text-secondary dark:text-gray-300">Voice message ready</span>
            <button onClick={() => setAudioBlob(null)}>
                <TrashIcon className="w-5 h-5 text-red-500" />
            </button>
        </div>
      ) : (
        <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2 resize-none focus:outline-none text-sm text-primary dark:text-gray-100 placeholder-secondary dark:placeholder-gray-400"
            rows={1}
            style={{maxHeight: '100px'}}
        />
      )}
      
      <button onClick={isRecording ? handleStopRecording : (text || audioBlob ? handleSendMessage : handleStartRecording)} className="p-2 bg-accent text-white rounded-full">
        {isRecording ? (
            <div className="w-6 h-6 flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-sm animate-pulse"></div>
            </div>
        ) : (text || audioBlob) ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
        ) : (
            <MicrophoneIcon className="w-6 h-6"/>
        )}
      </button>
    </div>
  );
};

export default MessageInput;
