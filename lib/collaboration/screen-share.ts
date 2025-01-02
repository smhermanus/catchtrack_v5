import { Room, LocalParticipant, RemoteParticipant, Track, TrackPublication } from 'livekit-client';
import { EventEmitter } from 'events';

interface ScreenShareOptions {
  room: Room;
  quality?: 'low' | 'medium' | 'high';
  frameRate?: number;
  audio?: boolean;
  onStart?: () => void;
  onStop?: () => void;
  onError?: (error: Error) => void;
}

export class ScreenShare extends EventEmitter {
  private mediaStream?: MediaStream;
  private videoTrack?: MediaStreamTrack;
  private audioTrack?: MediaStreamTrack;
  private preferredDisplaySurface?: 'monitor' | 'window' | 'browser';
  private isSharing: boolean = false;
  private recordedChunks: Blob[] = [];
  private mediaRecorder?: MediaRecorder;

  constructor(private options: ScreenShareOptions) {
    super();
    this.setupRoomListeners();
  }

  private setupRoomListeners() {
    this.options.room
      .on('trackSubscribed', this.handleTrackSubscribed.bind(this))
      .on('trackUnsubscribed', this.handleTrackUnsubscribed.bind(this))
      .on('participantDisconnected', this.handleParticipantDisconnected.bind(this));
  }

  public async startSharing(displaySurface: 'monitor' | 'window' | 'browser' = 'monitor') {
    if (this.isSharing) {
      throw new Error('Screen sharing is already active');
    }

    try {
      this.preferredDisplaySurface = displaySurface;
      const constraints = this.getConstraints();
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia(constraints);

      this.mediaStream.getVideoTracks()[0].onended = () => {
        this.stopSharing();
      };

      this.videoTrack = this.mediaStream.getVideoTracks()[0];
      if (this.options.audio) {
        this.audioTrack = this.mediaStream.getAudioTracks()[0];
      }

      await this.publishTracks();
      this.startRecording();

      this.isSharing = true;
      this.options.onStart?.();
      this.emit('shareStarted');
    } catch (error) {
      this.options.onError?.(error as Error);
      throw error;
    }
  }

  private getConstraints(): MediaStreamConstraints {
    const videoConstraints: MediaTrackConstraints = {
      frameRate: this.options.frameRate || 30,
    };

    switch (this.options.quality) {
      case 'low':
        Object.assign(videoConstraints, {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        });
        break;
      case 'medium':
        Object.assign(videoConstraints, {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        });
        break;
      case 'high':
        Object.assign(videoConstraints, {
          width: { ideal: 2560 },
          height: { ideal: 1440 },
        });
        break;
    }

    return {
      video: videoConstraints,
      audio: this.options.audio
        ? {
            echoCancellation: true,
            noiseSuppression: true,
          }
        : false,
    };
  }

  private async publishTracks() {
    const localParticipant = this.options.room.localParticipant;

    if (this.videoTrack) {
      await localParticipant.publishTrack(this.videoTrack, {
        name: 'screen_share',
        simulcast: true,
        videoCodec: 'vp8', // or 'h264'
        source: Track.Source.ScreenShare,
        ...(this.options.quality && {
          videoQuality: this.options.quality,
        }),
      });
    }

    if (this.options.audio && this.audioTrack) {
      await localParticipant.publishTrack(this.audioTrack, {
        name: 'screen_share_audio',
        source: Track.Source.ScreenShareAudio,
      });
    }
  }

  private getStreamConstraints() {
    const constraints: MediaTrackConstraints = {
      frameRate: this.options.frameRate || 30,
    };

    switch (this.options.quality) {
      case 'low':
        Object.assign(constraints, {
          width: { max: 1280 },
          height: { max: 720 },
        });
        break;
      case 'medium':
        Object.assign(constraints, {
          width: { max: 1920 },
          height: { max: 1080 },
        });
        break;
      case 'high':
        Object.assign(constraints, {
          width: { max: 2560 },
          height: { max: 1440 },
        });
        break;
    }

    return constraints;
  }

  private startRecording() {
    if (!this.mediaStream) return;

    const options = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 3000000,
    };

    this.mediaRecorder = new MediaRecorder(this.mediaStream, options);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(1000);
  }

  public async stopSharing() {
    if (!this.isSharing) return;

    this.mediaStream?.getTracks().forEach((track) => track.stop());

    if (this.mediaRecorder?.state !== 'inactive') {
      this.mediaRecorder?.stop();
    }

    const localParticipant = this.options.room.localParticipant;
    if (this.videoTrack) {
      await localParticipant.unpublishTrack(this.videoTrack);
    }
    if (this.audioTrack) {
      await localParticipant.unpublishTrack(this.audioTrack);
    }

    this.isSharing = false;
    this.options.onStop?.();
    this.emit('shareStopped');
  }

  public async getRecording(): Promise<Blob> {
    if (this.recordedChunks.length === 0) {
      throw new Error('No recording available');
    }

    return new Blob(this.recordedChunks, {
      type: 'video/webm',
    });
  }

  public isScreenSharing(): boolean {
    return this.isSharing;
  }

  private handleTrackSubscribed(
    track: Track,
    publication: TrackPublication,
    participant: RemoteParticipant
  ) {
    if (track.source === Track.Source.ScreenShare) {
      this.emit('remoteShareStarted', {
        participant,
        track,
      });
    }
  }

  private handleTrackUnsubscribed(
    track: Track,
    publication: TrackPublication,
    participant: RemoteParticipant
  ) {
    if (track.source === Track.Source.ScreenShare) {
      this.emit('remoteShareStopped', {
        participant,
        track,
      });
    }
  }

  private handleParticipantDisconnected(participant: RemoteParticipant) {
    this.emit('participantDisconnected', participant);
  }

  public async takeScreenshot(): Promise<Blob> {
    if (!this.mediaStream) {
      throw new Error('No active screen share');
    }

    if (!('ImageCapture' in window)) {
      throw new Error('ImageCapture API is not supported in this browser');
    }

    const videoTrack = this.mediaStream.getVideoTracks()[0];
    const imageCapture = new (window as any).ImageCapture(videoTrack);
    const bitmap = await imageCapture.grabFrame();

    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    context.drawImage(bitmap, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create blob from canvas');
        }
        resolve(blob);
      }, 'image/png');
    });
  }
}
