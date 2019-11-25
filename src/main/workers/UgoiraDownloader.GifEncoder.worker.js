import Jimp from 'jimp';
import GifEncoder from 'gif-encoder';
import fs from 'fs-extra';
import Zip from 'jszip';

let frames, gifFile, gifEncoder;

function addFrame(zip, frames, index = 0) {
  return new Promise(resolve => {
    const frame = frames[index];

    if (!frame) {
      resolve();
    }

    zip.file(frame.file).async('nodebuffer').then(buffer => {
      return Jimp.read(buffer);
    }).then(image => {
      if (!gifEncoder) {
        gifEncoder = new GifEncoder(image.bitmap.width, image.bitmap.height);
        gifEncoder.pipe(gifFile);
        gifEncoder.writeHeader();
      }

      gifEncoder.addFrame(Array.prototype.slice.call(image.bitmap, 0), {
        delay: frame.delay
      });

      resolve(addFrame(zip, frames, ++index));
    });
  });
}

process.on('message', data => {
  fs.readFile(data.file).then(buffer => {
    return Zip.loadAsync(buffer);
  }).then(zip => {
    return zip.file('animation.json').async('string')
  }).then(data => {
    frames = data;

    gifFile = fs.createWriteStream(data.saveFile);

    return addFrame(zip, frames);
  }).then(() => {
    gifEncoder.on('end', () => {
      process.send({status: 'finish'});
    });

    gifEncoder.finish();
  });
});
