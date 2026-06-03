"use client";

type Props = {
  remoteStreams: Map<string, MediaStream>;
};

export default function VideoGrid({
  remoteStreams
}: Props) {
  return (
    <div
      data-test-id="remote-video-container"
      className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full"
    >
      {[...remoteStreams.entries()].map(
        ([socketId, stream]) => (
          <RemoteVideo
            key={socketId}
            stream={stream}
          />
        )
      )}
    </div>
  );
}

function RemoteVideo({
  stream
}: {
  stream: MediaStream;
}) {
  return (
    <video
      autoPlay
      playsInline
      ref={(video) => {
        if (video) {
          video.srcObject = stream;
        }
      }}
      className="w-full rounded-lg bg-black"
    />
  );
}