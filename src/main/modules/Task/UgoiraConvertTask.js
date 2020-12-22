import path from 'path';
import fs from 'fs';
import { fork } from 'child_process';
import { app } from 'electron';
import { debug } from '@/global';
import BaseTask from './BaseTask';

/**
 * @class
 * @member {void} generateGif
 */
class UgoiraConvertTask extends BaseTask {
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
    this.worker;
    this.progress = 0;
  }

  /**
   * @returns {String}
   */
  getName() {
    return UgoiraConvertTask.name;
  }

  /**
   * @inheritdoc
   * @returns {String}
   */
  getStatusMessage() {
    if (this.taskSources.length > 0) {
      return `Left: ${this.taskSources.length} - Current: ${this.taskSources[0].file}`;
    } else {
      return `No task`;
    }
  }

  /**
   * @returns {Number}
   */
  getProgress() {
    return this.progress;
  }

  /**
   *
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
    return this;
  }

  start() {
    if (this.status === UgoiraConvertTask.IDLE_STATUS && this.taskSources.length > 0) {
      this.setStart();
      this.generateGif(this.taskSources[0]);
    }
  }

  pause() {
    if (this.worker) {
      this.setPausing();
      this.worker.send({
        action: 'abort'
      });
    } else {
      this.setPause();
    }
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
    this.progress = progress;
    this.setProcess();
  }

  generateNext() {
    /**
     * Prouise task is complete
     */
    this.updateProgress(1);
    this.taskSources.splice(0, 1);

    if (this.taskSources.length > 0) {
      this.generateGif(this.taskSources[0]);
    } else {
      this.setFinish();
    }
  }

  generateGif({file, saveFile}) {
    debug.sendStatus(`Generating GIF`);

    /**
     * Check if the gif file has been generated, if file has been generated then start generating next file
     */
    if (fs.existsSync(saveFile)) {
      debug.sendStatus(`Gif has been generated, skip`);

      this.updateProgress(1);
      this.generateNext();
      return;
    }

    /**
     * Check if the worker has been created
     */
    if (!this.worker) {
      let workPath = path.join(app.getAppPath(), 'UgoiraDownloaderGifEncoderWorker.js');

      if (fs.existsSync(workPath)) {
        this.worker = fork(workPath);
      } else {
        this.worker = fork(path.join(process.resourcesPath, 'app.asar', 'UgoiraDownloaderGifEncoderWorker.js'));
      }

      this.worker.on('message', data => {
        if (data.status === 'finish') {
          debug.sendStatus(`Generate GIF complete`);

          this.updateProgress(1);
          this.generateNext();
        } else if (data.status === 'progress') {
          debug.sendStatus(`Generate GIF progress ${data.progress}`);

          this.updateProgress(data.progress);
        } else if (data.status === 'abort') {
          this.updateProgress(0);
          this.setPause();
        }
      });
    }

    this.worker.send({
      file,
      saveFile
    });
  }
}

export default UgoiraConvertTask;
