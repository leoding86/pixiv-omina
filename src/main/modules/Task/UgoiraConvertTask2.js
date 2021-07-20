import path from 'path';
import fs from 'fs-extra';
import { fork } from 'child_process';
import { app } from 'electron';
import { debug } from '@/global';
import BaseTask from './BaseTask';
import Jimp from 'jimp';
import Zip from 'jszip';
import SettingStorage from '@/modules/SettingStorage';

/**
 * @class
 * @member {void} generateGif
 */
class UgoiraConvertTask2 extends BaseTask {
  /**
   * @var {string}
   */
  static name = 'ugoira-convert-task'

  constructor() {
    super();

    /**
     * Stored generation params
     * @type {Array.<{file:string, saveFile:string}>}
     */
    this.taskSources = [];

    /**
     * @type {any[]}
     */
    this.freeWorkers = [];

    /**
     * @type {any[]}
     */
    this.activeWorkers = [];

    /**
     * @type {number}
     */
    this.maxWorkerNumber = SettingStorage.getSetting('gifConvertWorkers') || 3;

    /**
     * @type {number}
     */
    this.width = 0;

    /**
     * @type {number}
     */
    this.height = 0;

    /**
     * @type {string[]}
     */
    this.frames = [];

    /**
     * @type {number}
     */
    this.currentIndex = 0;

    /**
     * @type {string}
     */
    this.saveFile = '';

    /**
     * @type {object} frames information
     */
    this.dataParts = {};

    /**
     * @type {number}
     */
    this.convertedFrameLen = 0;

    this.zipObj = null;

    this.spawnWorkers();
  }

  /**
   * @returns {String}
   */
  getName() {
    return UgoiraConvertTask2.name;
  }

  /**
   * @inheritdoc
   * @returns {String}
   */
  getStatusMessage() {
    if (this.taskSources.length > 0) {
      return `Current: ${this.taskSources[0].file}`;
    } else {
      return `No task`;
    }
  }

  /**
   * @override
   */
  getJobsLeft() {
    return this.taskSources.length;
  }

  /**
   * Get script file
   * @returns {string}
   */
  getWorkerScript() {
    let script = path.join(app.getAppPath(), 'UgoiraDownloaderGifEncoderFrameWorker.js');

    if (fs.existsSync(script)) {
      return script;
    } else {
      return path.join(process.resourcesPath, 'app.asar', 'UgoiraDownloaderGifEncoderFrameWorker.js');
    }
  }

  /**
   *
   * @param {{index: number, data: Buffer}} frame
   */
  bufferData(frame) {
    this.dataParts[frame.index] = frame.data;
  }

  /**
   * @returns {void}
   */
  writeFile() {
    return new Promise((resolve, reject) => {
      let writeStream = fs.createWriteStream(this.saveFile);

      writeStream.on('error', err => {
        reject(err);
      });

      writeStream.on('finish', () => {
        writeStream.close();
        resolve();
      });

      Object.keys(this.dataParts).forEach(index => {
        writeStream.write(Buffer.from(this.dataParts[index].data));
      });

      writeStream.end();
    });
  }

  /**
   * @returns {void}
   */
  addFrames() {
    if (this.freeWorkers.length > 0) {
      let gifConvertWorkers = SettingStorage.getSetting('gifConvertWorkers');

      if (!gifConvertWorkers || gifConvertWorkers < 1) {
        gifConvertWorkers = 1;
      }

      if (this.freeWorkers.length > gifConvertWorkers) {
        this.freeWorkers.splice(gifConvertWorkers).forEach(worker => {
          worker.kill();
        });
      }

      this.freeWorkers.forEach((worker, i) => {
        if (this.currentIndex < this.frames.length) {
          /**
           * Create a scope index variable is only avaliable in this function.
           * DO NOT use currentIndex as current index in this function because we need use Jimp to read
           * image's informations and the call of Jimp.read() is async, the this.currentIndex may be
           * changed when we need to use it in this callback function. So we create a sopced variable for
           * the callback function
           */
          let index = this.currentIndex;
          // console.log('add frame', this.currentIndex, this.frames.length);

          this.freeWorkers.splice(i, 1);

          this.activeWorkers.push(worker);

          this.zipObj.file(this.frames[index].file).async('nodebuffer').then(buffer => {
            return Jimp.read(buffer);
          }).then(image => {
            worker.send({
              width: this.width,
              height: this.height,
              index,
              totalFrames: this.frames.length,
              delay: this.frames[index].delay,
              data: Array.prototype.slice.call(image.bitmap.data, 0)
            });
          });

          this.currentIndex++;
        }
      });
    }
  }

  /**
   * @returns {void}
   */
  spawnWorkers() {
    let workerNumberCanSpawn = this.maxWorkerNumber - this.freeWorkers.length - this.activeWorkers.length;

    console.log(`Spawn ${workerNumberCanSpawn} worker(s)`);

    while (workerNumberCanSpawn > 0) {
      workerNumberCanSpawn--;

      let worker = fork(this.getWorkerScript());

      worker.on('message', data => {
        this.convertedFrameLen++;
        this.bufferData(data);

        this.updateProgress((data.index + 1) / this.frames.length);

        let index = this.activeWorkers.indexOf(worker);

        this.activeWorkers.splice(index, 1);

        this.freeWorkers.push(worker);

        if (this.convertedFrameLen === this.frames.length) {
          this.writeFile().then(() => {
            //
          }).catch(err => {
            console.error(err);
          }).finally(() => {
            this.generateNext();
          });
        } else {
          this.addFrames();
        }
      });

      this.freeWorkers.push(worker);
    }
  }

  /**
   * @param {{file: string, saveFile: string}} payload
   */
  addPayload(payload) {
    for (let i = 0; i < this.taskSources.length; i++) {
      if (this.taskSources[i].file === payload.file &&
        this.taskSources[i].saveFile === payload.saveFile
      ) {
        return this;
      }
    }

    this.taskSources.push(payload);
    this.updateProgress();
    return this;
  }

  start() {
    if ((this.status === UgoiraConvertTask2.IDLE_STATUS || this.status === UgoiraConvertTask2.PAUSE_STATUS) && this.taskSources.length > 0) {
      this.setStart();
      this.generateGif(this.taskSources[0]);
    }
  }

  pause() {
    this.setPause();
  }

  stop() {
    this.pause();
  }

  /**
   *
   * @param {number} progress single generate task progress
   * @returns {void}
   */
  updateProgress(progress) {
    this.setProgress(progress);
  }

  generateNext() {
    /**
     * Prouise task is complete
     */
    this.updateProgress(1);
    this.taskSources.splice(0, 1);

    if (this.taskSources.length > 0) {
      /**
       * If the task is paused, the task status will be pausing or pause. Then the task shouldn't start
       * next job
       */
      if (this.getStatus() === UgoiraConvertTask2.PROCESS_STATUS) {
        this.generateGif(this.taskSources[0]);
      }
    } else {
      this.setFinish();
    }
  }

  generateGif({file, saveFile}) {
    this.currentIndex = 0;
    this.frames = [];
    this.dataParts = [];
    this.saveFile = saveFile;
    this.convertedFrameLen = 0;

    /**
     * Check if the gif file has been generated, if file has been generated then start generating next file
     */
    if (fs.existsSync(saveFile)) {
      debug.sendStatus(`Gif has been generated, skip`);

      this.updateProgress(1);
      this.generateNext();
      return;
    }

    fs.readFile(file).then(buffer => {
      return Zip.loadAsync(buffer);
    }).then(zipObj => {
      this.zipObj = zipObj;

      return this.zipObj.file('animation.json').async('string');
    }).then(content => {
      this.frames = JSON.parse(content);

      return this.zipObj.file(this.frames[0].file).async('nodebuffer');
    }).then(buffer => {
      return Jimp.read(buffer);
    }).then(image => {
      this.width = image.bitmap.width;
      this.height = image.bitmap.height;

      this.addFrames();
    });
  }
}

export default UgoiraConvertTask2;
