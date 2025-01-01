import {
  LiveKit,
  Room,
  RoomEvent,
  Participant,
  LocalParticipant,
  RemoteParticipant,
  Track,
} from 'livekit-client';
import { EventEmitter } from 'events';

interface VoiceChatOptions {
  roomName: string;
  token: string;
  userId: string;
  userName: string;
  onParticipantJoined?: (participant: RemoteParticipant) => void;
  onParticipantLeft?: (participant: RemoteParticipant) => void;
  onError?: (error: Error) => void;
}

class VoiceChat extends EventEmitter {
  private room: Room;
  private localParticipant?: LocalParticipant;
  private remoteParticipants: Map<string, RemoteParticipant>;
  private audioContext: AudioContext;
  private mediaStream?: MediaStream;
  private audioProcessor?: ScriptProcessorNode;
  private noiseReducer?: AudioWorkletNode;
  private gainNode?: GainNode;

  constructor(private options: VoiceChatOptions) {
    super();
    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
      audioPreset: { maxBitrate: 64000 },
    });
    this.remoteParticipants = new Map();
    this.audioContext = new AudioContext();
    this.setupRoomListeners();
  }

  private setupRoomListeners() {
    this.room
      .on(RoomEvent.ParticipantConnected, this.handleParticipantConnected.bind(this))
      .on(RoomEvent.ParticipantDisconnected, this.handleParticipantDisconnected.bind(this))
      .on(RoomEvent.TrackSubscribed, this.handleTrackSubscribed.bind(this))
      .on(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed.bind(this))
      .on(RoomEvent.Disconnected, this.handleDisconnected.bind(this))
      .on(RoomEvent.MediaDevicesError, this.handleMediaDevicesError.bind(this));
  }

  public async connect() {
    try {
      await this.room.connect(this.options.token, {
        identity: this.options.userId,
        name: this.options.userName,
      });

      this.localParticipant = this.room.localParticipant;
      await this.setupLocalAudio();
    } catch (error) {
      this.options.onError?.(error as Error);
      throw error;
    }
  }

  private async setupLocalAudio() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create and connect audio processing nodes
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Noise reduction
      await this.audioContext.audioWorklet.addModule('/audio-worklets/noise-reducer.js');
      this.noiseReducer = new AudioWorkletNode(this.audioContext, 'noise-reducer');

      // Gain control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.0;

      // Audio processing
      this.audioProcessor = this.audioContext.createScriptProcessor(2048, 1, 1);
      this.audioProcessor.onaudioprocess = this.handleAudioProcess.bind(this);

      // Connect nodes
      source
        .connect(this.noiseReducer)
        .connect(this.gainNode)
        .connect(this.audioProcessor)
        .connect(this.audioContext.destination);

      await this.localParticipant?.publishTrack(this.mediaStream.getAudioTracks()[0]);
    } catch (error) {
      this.options.onError?.(error as Error);
      throw error;
    }
  }

  private handleAudioProcess(event: AudioProcessingEvent) {
    const input = event.inputBuffer.getChannelData(0);
    const output = event.outputBuffer.getChannelData(0);

    // Apply audio processing (e.g., noise gate, compression)
    for (let i = 0; i < input.length; i++) {
      // Noise gate
      const threshold = 0.01;
      output[i] = Math.abs(input[i]) > threshold ? input[i] : 0;

      // Compression
      const threshold2 = 0.5;
      const ratio = 4;
      if (Math.abs(output[i]) > threshold2) {
        output[i] =
          threshold2 + ((Math.abs(output[i]) - threshold2) / ratio) * Math.sign(output[i]);
      }
    }
  }

  private handleParticipantConnected(participant: RemoteParticipant) {
    this.remoteParticipants.set(participant.identity, participant);
    this.options.onParticipantJoined?.(participant);
    this.emit('participantConnected', participant);
  }

  private handleParticipantDisconnected(participant: RemoteParticipant) {
    this.remoteParticipants.delete(participant.identity);
    this.options.onParticipantLeft?.(participant);
    this.emit('participantDisconnected', participant);
  }

  private handleTrackSubscribed(
    track: Track,
    publication: Track.Publication,
    participant: RemoteParticipant
  ) {
    if (track.kind === Track.Kind.Audio) {
      const audioElement = new Audio();
      audioElement.srcObject = new MediaStream([track.mediaStreamTrack]);
      audioElement.play();
    }
  }

  private handleTrackUnsubscribed(
    track: Track,
    publication: Track.Publication,
    participant: RemoteParticipant
  ) {
    // Cleanup track resources
  }

  private handleDisconnected() {
    this.cleanup();
    this.emit('disconnected');
  }

  private handleMediaDevicesError(error: Error) {
    this.options.onError?.(error);
    this.emit('error', error);
  }

  public setMuted(muted: boolean) {
    if (this.localParticipant) {
      this.localParticipant.setMicrophoneEnabled(!muted);
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  public getParticipants() {
    return Array.from(this.remoteParticipants.values());
  }

  public disconnect() {
    this.room.disconnect();
    this.cleanup();
  }

  private cleanup() {
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    if (this.audioProcessor) {
      this.audioProcessor.disconnect();
    }
    if (this.noiseReducer) {
      this.noiseReducer.disconnect();
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
    }
    this.audioContext.close();
  }
}

export const createVoiceChat = (options: VoiceChatOptions) => new VoiceChat(options);
