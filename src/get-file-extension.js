const getFileExtension = (filename) => {
  const arr = filename.split('.');

  if (arr.length === 1 || (arr[0] === '' && arr.length === 2)) {
    return '';
  }
  return arr.pop().toLowerCase();
}

module.exports = getFileExtension;
