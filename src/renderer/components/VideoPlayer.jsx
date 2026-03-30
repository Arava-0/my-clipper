export default function VideoPlayer({ src, videoRef, onDurationChange, onTimeUpdate }) {
  return (
    <div className="video-wrapper">
      <video
        ref={videoRef}
        src={src}
        controls
        onError={(e) => console.error('Video error:', e)}
        onLoadedMetadata={(e) => { onDurationChange(e.target.duration); }}
        onTimeUpdate={(e) => { onTimeUpdate(e.target.currentTime); }}
      />
    </div>
  )
}
