import React, { useState, useRef, useEffect } from 'react';
import type { User, Conversation, Message } from '../../types';
import { sendMessage } from '../../services/firebase';
import { uploadMedia } from '../../services/mediaUpload';
import { PlusIcon, MicrophoneIcon, TrashIcon, XIcon } from '../Icons';
import AudioPlayer from './AudioPlayer';

interface MessageInputProps {
  currentUser: User;
  conversation: Conversation;
  replyingTo: Message | null;
  onCancelReply: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ currentUser, conversation, replyingTo, onCancelReply }) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
    }
  }, [audioUrl]);

  const handleSendMessage = async () => {
    const messagePayload: { text?: string; mediaUrl?: string; mediaType?: 'image' | 'audio' | 'video', replyTo?: Message['replyTo'] } = {};
    
    if (replyingTo) {
        messagePayload.replyTo = {
            messageId: replyingTo.id,
            senderId: replyingTo.senderId,
            text: replyingTo.text,
            mediaType: replyingTo.mediaType
        };
    }

    if (text.trim()) {
        messagePayload.text = text.trim();
    }
    
    if (audioBlob) {
        try {
            const audioFile = new File([audioBlob], "voice-message.webm", { type: audioBlob.type });
            const uploadedMedia = await uploadMedia(audioFile);
            messagePayload.mediaUrl = uploadedMedia.url;
            messagePayload.mediaType = 'audio';
        } catch (error) {
            console.error("Failed to upload audio:", error);
            alert("Could not send voice message.");
            return;
        }
    }
    
    if (messagePayload.text || messagePayload.mediaUrl) {
         await sendMessage(conversation.id, currentUser.id, messagePayload);
    }
    
    setText('');
    setAudioBlob(null);
    if(audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    onCancelReply();
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
            await sendMessage(conversation.id, currentUser.id, { mediaUrl: url, mediaType: type as 'image' | 'video' });
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
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setAudioBlob(blob);
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
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

  const clearAudio = () => {
      setAudioBlob(null);
      if(audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
  }
  
  return (
    <div>
        {replyingTo && (
             <div className="bg-gray-100 dark:bg-gray-700 rounded-t-lg p-2 text-sm text-secondary dark:text-gray-300 flex justify-between items-center">
                <div>
                    <p className="font-semibold">Replying to {replyingTo.senderId === currentUser.id ? 'yourself' : 'them'}</p>
                    <p className="truncate opacity-80">{replyingTo.text || 'Media'}</p>
                </div>
                <button onClick={onCancelReply} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                    <XIcon className="w-4 h-4"/>
                </button>
            </div>
        )}
        <div className={`flex items-end gap-2 ${replyingTo ? 'bg-gray-100 dark:bg-gray-700 rounded-b-lg p-2' : ''}`}>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleMediaUpload} />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <PlusIcon className="w-6 h-6 text-accent"/>
          </button>

          <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center px-2">
              {audioUrl ? (
                <div className="flex items-center w-full gap-2 p-1">
                    <AudioPlayer src={audioUrl} isCompact={true} />
                    <button onClick={clearAudio} className="p-1">
                        <TrashIcon className="w-5 h-5 text-red-500" />
                    </button>
                </div>
              ) : (
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="w-full bg-transparent px-2 py-2 resize-none focus:outline-none text-sm text-primary dark:text-gray-100 placeholder-secondary dark:placeholder-gray-400"
                    rows={1}
                    style={{maxHeight: '100px'}}
                />
              )}
          </div>
          
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
    </div>
  );
};

export default MessageInput;
