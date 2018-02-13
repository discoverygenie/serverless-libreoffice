const {writeFileSync} = require('fs');
const {convertToPDF} = require('./libreoffice');
const {uploadPDF} = require('./s3');
const libreOfficeFormats = require('./lo-formats');
const getFileExtension = require('./get-file-extension');

const mb = 5 * 1024 * 1024;

const MAX_FILE_SIZE = mb * 100;

/**
 * Validate, save, convert and uploads file
 * @param base64File {String} File in base64 format
 * @param filename {String} Name of file to convert
 * @return {Promise.<String>} URL of uploaded file on S3
 */
module.exports.convertFileToPDF = function convertFileToPDF(base64File, filename) {
  console.log('filename inside convertFileToPDF: ', filename);
  console.log(`[start][file:${filename}][buffer:${base64File.slice(0, 16)}...]`);
  const fileExt = getFileExtension(filename);
  console.log('fileExt: ', fileExt);
  const fileBuffer = new Buffer(base64File, 'base64');
  console.log(`[size:${fileBuffer.length}]`);


  if (libreOfficeFormats.includes(`.${fileExt}`)){
    console.log('MATCHING FILE EXTENSION');
    validate(fileBuffer);

    writeFileSync(`/tmp/${filename}`, fileBuffer);
    console.log(`[written]`);

    const {pdfFilename, pdfFileBuffer} = convertToPDF(filename);

    return uploadPDF(pdfFilename, pdfFileBuffer, 'application/pdf');
  } else {
    console.log('NO MATCHING FILE EXTENSION');
    writeFileSync(`/tmp/${filename}`, fileBuffer);
    console.log(`[written]`);

    return uploadPDF(filename, fileBuffer, 'unknown');
  }
};

function validate(fileBuffer) {
  if (fileBuffer.length > MAX_FILE_SIZE) {
    return Promise.reject(new Error('File is too large'));
  }

  if (fileBuffer.length < 4) {
    return Promise.reject(new Error('File is too small'));
  }
}
