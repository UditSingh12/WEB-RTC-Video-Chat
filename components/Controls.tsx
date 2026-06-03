"use client";

type Props = {
  audioEnabled: boolean;
  videoEnabled: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onHangup: () => void;
};

export default function Controls({
  audioEnabled,
  videoEnabled,
  onToggleMic,
  onToggleCamera,
  onHangup
}: Props) {
  return (
    <div className="flex gap-3 justify-center p-4">
      <button
        data-test-id="mute-mic-button"
        onClick={onToggleMic}
        className="px-4 py-2 bg-blue-600 rounded"
      >
        {audioEnabled
          ? "Mute Mic"
          : "Unmute Mic"}
      </button>

      <button
        data-test-id="toggle-camera-button"
        onClick={onToggleCamera}
        className="px-4 py-2 bg-green-600 rounded"
      >
        {videoEnabled
          ? "Disable Camera"
          : "Enable Camera"}
      </button>

      <button
        data-test-id="hangup-button"
        onClick={onHangup}
        className="px-4 py-2 bg-red-600 rounded"
      >
        Hang Up
      </button>
    </div>
  );
}