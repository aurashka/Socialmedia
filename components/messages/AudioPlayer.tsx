import React, { useState, useRef, useEffect, useCallback } from 'react';

interface AudioPlayerProps {
  src: string;
  isCompact?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, isCompact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
        setDuration(audioRef.current.duration);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [handleTimeUpdate, handleLoadedMetadata]);
  
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeed(s => s === 1 ? 1.5 : s === 1.5 ? 2 : 1);
  };
  
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if(!audioRef.current || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (x / width) * duration;
    if(isFinite(newTime)) {
        audioRef.current.currentTime = newTime;
    }
  };
  
  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progress = duration > 0 && isFinite(duration) ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-2 ${isCompact ? 'w-full' : 'w-64'}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={togglePlayPause} className="p-2 rounded-full bg-accent text-white flex-shrink-0">
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5h-1A1.5 1.5 0 0 0 3 6.5v3A1.5 1.5 0 0 0 4.5 11h1A1.5 1.5 0 0 0 7 9.5v-3A1.5 1.5 0 0 0 5.5 5zm5 0h-1A1.5 1.5 0 0 0 8 6.5v3A1.5 1.5 0 0 0 9.5 11h1A1.5 1.5 0 0 0 12 9.5v-3A1.5 1.5 0 0 0 10.5 5z"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16"><path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z"/></svg>
        )}
      </button>
      <div className="flex-grow flex flex-col justify-center">
          <div ref={progressBarRef} className="w-full h-1.5 bg-gray-200 dark:bg-gray-500 rounded-full relative group cursor-pointer" onMouseDown={handleSeek}>
              <div style={{ width: `${progress}%` }} className="h-1.5 bg-accent rounded-full"></div>
              <div style={{ left: `${progress}%` }} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-accent rounded-full transition-opacity opacity-0 group-hover:opacity-100"></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-secondary dark:text-gray-400 tabular-nums">{formatTime(currentTime)}</span>
            <span className="text-xs text-secondary dark:text-gray-400 tabular-nums">{formatTime(duration)}</span>
          </div>
      </div>
       <button onClick={toggleSpeed} className="text-xs font-bold w-10 text-center text-accent">{speed === 1 ? '1x' : `${speed.toFixed(1)}x`}</button>
    </div>
  );
};

export default AudioPlayer;