/* eslint-disable no-await-in-loop */
import { v4 as uuidv4 } from "uuid";

import "./cameraPolyfill";

type OnCallbackCamera = (
  canvasElement: HTMLCanvasElement,
  container: HTMLElement
) => void;

class Camera {
  private currentStream: MediaStream | null;
  private canvasElement: HTMLCanvasElement;
  private cameraStarted = false;
  private container: HTMLElement;
  private video: HTMLVideoElement;
  private fps = 0;
  private frameNumber = 0;
  private id: string;

  constructor(element: HTMLElement | string) {
    this.video = document.createElement("video");
    this.canvasElement = document.createElement("canvas");
    this.currentStream = null;
    this.id = uuidv4();

    if (typeof element === "string") {
      if (document.getElementById(element)) {
        this.container = document.getElementById(element) as HTMLElement;
      } else {
        throw new Error("Element not found");
      }
    } else {
      this.container = element;
    }
  }

  static isAccessible() {
    return Boolean(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );
  }

  stopCurrentCamera() {
    if (this.currentStream !== null) {
      this.currentStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }

  stopCamera() {
    this.stopCurrentCamera();
    this.cameraStarted = false;
    this.video.pause();
    this.container.classList.remove("zxing-camera-container");
    this.canvasElement.remove();
  }

  tick(onCallback: OnCallbackCamera) {
    const { video, canvasElement, container } = this;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvasElement.hidden = false;
      const canvas = canvasElement.getContext("2d", {
        willReadFrequently: true,
      }) as CanvasRenderingContext2D;

      const width = container.clientWidth;
      const ratioVideo = video.videoWidth / video.videoHeight;
      canvasElement.width = container.clientHeight * ratioVideo;
      canvas.drawImage(
        video,
        width / 2 - canvasElement.width / 2,
        0,
        canvasElement.width,
        canvasElement.height
      );
      if (this.frameNumber === this.fps) {
        onCallback(canvasElement, container);
        this.frameNumber = 0;
      }
    }

    this.frameNumber += 1;
    requestAnimationFrame(() => {
      this.tick(onCallback);
    });
  }

  async getStream(
    facingMode: ConstrainDOMString | undefined
  ): Promise<MediaStream> {
    let stream: MediaStream | null = null;
    const limit = 10;
    let count = 0;

    const wait = (duration: number) =>
      new Promise((resolve) => {
        setTimeout(resolve, duration);
      });

    while (count < limit && stream === null) {
      try {
        stream = await window.navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
      } catch (e) {
        console.error((e as Error).name);
      }

      count += 1;
      await wait(200);
    }

    if (stream === null) {
      throw new Error("No camera found");
    }

    return stream;
  }

  async startCamera(
    onCallback: OnCallbackCamera,
    fps: number,
    cameraFacing?: string
  ) {
    if (
      this.cameraStarted ||
      this.container.classList.contains("zxing-camera-container")
    ) {
      return;
    }
    this.fps = fps;
    this.cameraStarted = true;
    this.container.classList.add("zxing-camera-container");
    this.container.style.overflow = "hidden";
    this.container.append(this.canvasElement);
    this.canvasElement.width = this.container.clientWidth;
    this.canvasElement.height = this.container.clientHeight;

    window.addEventListener("resize", () => {
      this.canvasElement.height = this.container.clientHeight;
    });

    this.stopCurrentCamera();
    const facingMode = cameraFacing ? { exact: cameraFacing } : "environment";

    const stream = await this.getStream(facingMode);

    this.currentStream = stream;
    if (this.cameraStarted) {
      this.video.srcObject = stream;
      this.video.setAttribute("playsinline", "true"); // required to tell iOS safari we don't want fullscreen
      this.video.play();

      requestAnimationFrame(() => {
        this.tick(onCallback);
      });
    } else {
      this.stopCamera();
    }
  }
}

export default Camera;
