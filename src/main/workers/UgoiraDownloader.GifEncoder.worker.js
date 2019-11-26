import Jimp from 'jimp';
import GifEncoder from 'gif-encoder';
import fs from 'fs-extra';
import Zip from 'jszip';

let frames, zipFile, gifFile, gifEncoder;

function addFrame(zip, frames, index = 0) {
  return new Promise(resolve => {
    const frame = frames[index];

    if (!frame) {
      resolve();
      return;
    }

    zip.file(frame.file).async('nodebuffer').then(buffer => {
      return Jimp.read(buffer);
    }).then(image => {
      if (!gifEncoder) {
        gifEncoder = new GifEncoder(image.bitmap.width, image.bitmap.height);
        gifEncoder.setRepeat(0);
        gifEncoder.pipe(gifFile);
        gifEncoder.writeHeader();
      }

      gifEncoder.setDelay(frame.delay);
      gifEncoder.addFrame(Array.prototype.slice.call(image.bitmap.data, 0));

      resolve(addFrame(zip, frames, ++index));
    });
  });
}

process.on('message', args => {
  fs.readFile(args.file).then(buffer => {
    return Zip.loadAsync(buffer);
  }).then(zip => {
    zipFile = zip;

    return zip.file('animation.json').async('string')
  }).then(data => {
    frames = JSON.parse(data);

    gifFile = fs.createWriteStream(args.saveFile);

    return addFrame(zipFile, frames);
  }).then(() => {
    gifEncoder.on('end', () => {
      process.send({status: 'finish'});
    });

    gifEncoder.finish();
  });
});
