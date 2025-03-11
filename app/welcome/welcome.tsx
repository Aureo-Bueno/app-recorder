import { useRef, useState } from "react";

export function Welcome() {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const requestPermissions = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
  
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 200, height: 150 },
        audio: true,
      });

      screenStreamRef.current = screenStream;
      cameraStreamRef.current = cameraStream;

      return { screenStream, cameraStream };
    } catch (error) {
      console.error("Error requesting media permissions:", error);
      return null;
    }
  };

  const startRecording = async () => {
    if (recording || loading) return;
    setLoading(true);
  
    const streams = await requestPermissions();
    if (!streams) {
      setLoading(false);
      return;
    }
  
    try {
      const combinedStream = new MediaStream();

      streams.screenStream.getTracks().forEach((track) => {
        combinedStream.addTrack(track);
      });

      streams.cameraStream.getTracks().forEach((track) => {
        combinedStream.addTrack(track);
      });

      mediaRecorder.current = new MediaRecorder(combinedStream, {
        mimeType: "video/webm",
      });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "video/webm" });
        setVideoUrl(URL.createObjectURL(blob));
        chunks.current = [];
      };

      mediaRecorder.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    } finally {
      setLoading(false);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorder.current || !recording) return;

    mediaRecorder.current.stop();
    setRecording(false);
  
    screenStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
    cameraStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });
  };

  return (
    <main>
      <div className="p-4 text-center">
        <h2 className="text-xl font-bold mb-4">Screen and Camera Recorder</h2>
        <button
          className={`px-4 py-2 text-white rounded ${
            recording ? "bg-red-500" : "bg-green-500"
          }`}
          onClick={recording ? stopRecording : startRecording}
          disabled={loading}
        >
          {loading
            ? "Preparing..."
            : recording
            ? "Stop Recording"
            : "Start Recording"}
        </button>

        {videoUrl && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Recorded Video:</h3>
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full max-w-md mt-2"
            />
            <a
              href={videoUrl}
              download="recording.webm"
              className="block mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Download Video
            </a>
          </div>
        )}
      </div>
    </main>
  );
}