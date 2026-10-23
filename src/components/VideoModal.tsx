import { useState, useRef } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  title?: string;
}

export default function VideoModal({ isOpen, onClose, videoSrc, title = 'J & A Pools Drone Footage' }: VideoModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 600, height: 337 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('video')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: Math.max(0, e.clientX - dragOffset.x),
      y: Math.max(0, e.clientY - dragOffset.y),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    }
  };

  const handleClose = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    onClose();
  };

  if (isFullscreen) {
    return (
      <>
        <video
          ref={videoRef}
          src={videoSrc}
          title={title}
          controls
          autoPlay
          className="w-full"
          onFullscreenChange={() => setIsFullscreen(false)}
        />
      </>
    );
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        ref={containerRef}
        className={`pointer-events-auto absolute rounded-lg bg-black/95 shadow-2xl backdrop-blur-sm transition-all ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height + 48}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-black/50 px-4 py-3">
          <h3 className="text-sm font-semibold text-white select-none">{title}</h3>
          <div className="flex gap-2">
            <button
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
              className="rounded p-2 hover:bg-white/10 transition text-white/70 hover:text-white"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              onClick={handleClose}
              aria-label="Close video"
              className="rounded p-2 hover:bg-white/10 transition text-white/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative bg-black overflow-hidden" style={{ height: `${size.height}px` }}>
          <video
            ref={videoRef}
            src={videoSrc}
            title={title}
            controls
            autoPlay
            className="h-full w-full object-cover"
          />
        </div>

        {/* Resize Handle */}
        <div
          className="absolute -bottom-1 -right-1 h-4 w-4 cursor-se-resize bg-amber-400/40 hover:bg-amber-400/60 rounded-tl transition"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = size.width;
            const startHeight = size.height;

            const handleMove = (moveEvent: MouseEvent) => {
              const newWidth = Math.max(300, startWidth + (moveEvent.clientX - startX));
              const newHeight = Math.max(169, startHeight + (moveEvent.clientY - startY));
              setSize({ width: newWidth, height: newHeight });
            };

            const handleUp = () => {
              document.removeEventListener('mousemove', handleMove);
              document.removeEventListener('mouseup', handleUp);
            };

            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleUp);
          }}
        />
      </div>
    </div>
  );
}
