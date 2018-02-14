const {unpackArchive} = require('./libreoffice');
const {convertFileToPDF} = require('./logic');
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
});

const s3 = new AWS.S3({region: 'us-east-2'});

unpackArchive();

const getAttachmentFromS3 = (s3Str) => {
  console.log('typeof s3Str: ', typeof s3Str);
  console.log('s3Str: ', s3Str);

  const s3Obj = JSON.parse(JSON.stringify(s3Str));

  console.log('typeof s3Obj: ', typeof s3Obj);
  console.log('s3Obj: ', s3Obj);

  const s3params = {
    Bucket: s3Obj.bucket.name,
    Key: s3Obj.object.key,
  };

  return new Promise((resolve, reject) => {
    s3.getObject(s3params, (err, data) => {
      console.log('getAttachmentFromS3 results:', err, data);
      if (data) { // successful response
        resolve([data.Body, s3Obj.object.key])
      } // an error occurred
      reject(err)
    });
  });
};

module.exports.handler = (event, context, cb) => {
  if (event.warmup) {
    return cb();
  }
  const s3Obj = event.Records[0].s3;

  // console.log('s3 Obj: ', s3Obj);
  // console.log('EVENT: ', event);
  // console.log('CONTEXT: ', context);
  return getAttachmentFromS3(s3Obj)
    .then((response) => {
      // const {filename, base64File} = JSON.parse(s3Obj);
      // const test = new Buffer(fs.readFileSync('./test.pptx'), 'base64');
      // console.log('response', response);

      const [buffer, filename] = response;

      // console.log('buffer filename', buffer, filename);

      return convertFileToPDF(buffer, filename)
        .then(pdfFileURL => {
          return cb(null, {body: JSON.stringify({pdfFileURL})});
        })
        .catch(cb);

    })
    .catch((err) => {
      console.log('getAttachmentFromS3 err: ', err);
    })
};
