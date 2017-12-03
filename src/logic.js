const {writeFileSync} = require('fs');
const {convertToPDF} = require('./libreoffice');
const {uploadPDF} = require('./s3');

const mb = 5 * 1024 * 1024;

const MAX_FILE_SIZE = mb * 100;

/**
 * Validate, save, convert and uploads file
 * @param base64File {String} File in base64 format
 * @param filename {String} Name of file to convert
 * @return {Promise.<String>} URL of uploaded file on S3
 */
module.exports.convertFileToPDF = function convertFileToPDF(base64File, filename) {
  console.log(`[start][file:${filename}][buffer:${base64File.slice(0, 16)}...]`);

  const fileBuffer = new Buffer(base64File, 'base64');
  console.log(`[size:${fileBuffer.length}]`);

  validate(fileBuffer);

  writeFileSync(`/tmp/${filename}`, fileBuffer);
  console.log(`[written]`);

  const {pdfFilename, pdfFileBuffer} = convertToPDF(filename);

  return uploadPDF(pdfFilename, pdfFileBuffer);
};

function validate(fileBuffer) {
  if (fileBuffer.length > MAX_FILE_SIZE) {
    return Promise.reject(new Error('File is too large'));
  }

  if (fileBuffer.length < 4) {
    return Promise.reject(new Error('File is too small'));
  }
}
