import Jimp from 'jimp';
import GifEncoder from 'gif-encoder';

/**
 * @class
 */
class FrameRenderer {
  /**
   * @constructor
   */
  constructor(args) {
    /**
     * @type {number}
     */
    this.width = args.width;

    /**
     * @type {number}
     */
    this.height = args.height;

    /**
     * @type {number}
     */
    this.index = args.index;

    /**
     * @type {number}
     */
    this.totalFrames = args.totalFrames;

    /**
     * @type {Buffer}
     */
    this.data = args.data;

    /**
     * @type {boolean}
     */
    this.repeat = args.repeat || false;

    /**
     * @type {number}
     */
    this.delay = args.delay || 100;

    /**
     * @type {number}
     */
    this.quality = args.quality || 1;

    /**
     * @type {GifEncoder}
     */
    this.encoder = null;
  }

  renderFrame() {
    this.encoder = new GifEncoder(this.width, this.height, {
      highWaterMark: 5 * 1024 * 1024
    });

    this.encoder.firstFrame = this.index === 0 ? true : false;

    if (this.encoder.firstFrame) {
      this.encoder.writeUTFBytes("GIF89a");
    }

    this.encoder.setRepeat(this.repeat);
    this.encoder.setQuality(this.quality);
    this.encoder.setDelay(this.delay);
    // this.encoder.addFrame(this.data);
    this.encoder.analyzeImage(this.data);
    this.encoder.writeImageInfo();
    this.encoder.outputImage();

    if (this.index === (this.totalFrames.length - 1)) {
      this.encoder.writeByte(0x3b);
    }
  }
}

process.on('message', data => {
  let frameRenderer = new FrameRenderer(data);
  frameRenderer.renderFrame();

  process.send({
    index: frameRenderer.index,
    data: Buffer.from(frameRenderer.encoder.data),
  });
});
