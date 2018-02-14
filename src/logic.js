const {writeFileSync} = require('fs');
const {convertToPDF} = require('./libreoffice');
const uploadPDF = require('./s3-pdf');
const uploadOrig = require('./s3-orig');
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
  // console.log('filename inside convertFileToPDF: ', filename);
  // console.log(`[start][file:${filename}][buffer:${base64File.slice(0, 16)}...]`);
  const fileExt = getFileExtension(filename).toLowerCase();
  console.log('fileExt: ', fileExt);
  const fileBuffer = new Buffer(base64File, 'base64');
  // console.log(`[size:${fileBuffer.length}]`);

  if (!libreOfficeFormats.includes(`.${fileExt}`)) {
    writeAndUpload(filename, fileBuffer)
  } else {
    try {
      console.log('TRYING');
      validate(fileBuffer);

      return writeConvertAndUpload(filename, fileBuffer)
    } catch (err) {
      console.log('ERROR: ', err);
      return writeAndUpload(filename, fileBuffer);
    }
  }
};

function writeAndUpload(fileName, fileBuffer) {
  writeFileSync(`/tmp/${fileName}`, fileBuffer);
  // console.log(`[written]`);

  return uploadOrig(fileName, fileBuffer);
}

function writeConvertAndUpload(fileName, fileBuffer) {
  writeFileSync(`/tmp/${fileName}`, fileBuffer);
  // console.log(`[written]`);

  const {pdfFilename, pdfFileBuffer} = convertToPDF(fileName);

  return uploadPDF(pdfFilename, pdfFileBuffer);
}

function validate(fileBuffer) {
  if (fileBuffer.length > MAX_FILE_SIZE) {
    return Promise.reject(new Error('File is too large'));
  }

  if (fileBuffer.length < 4) {
    return Promise.reject(new Error('File is too small'));
  }
}
