var CryptoJS = require('aes.js');  //引用AES源码js
var key = CryptoJS.enc.Utf8.parse("4c5441494e463871556a69355a79544e");//十六位十六进制数作为秘钥
var iv = CryptoJS.enc.Utf8.parse('0000000000000000');//十六位十六进制数作为秘钥偏移量
//解密方法
function Decrypt(word) {
  // var encryptedHexStr = CryptoJS.enc.Hex.parse(word);
  // var srcs = CryptoJS.enc.Base64.parse(word);
  var decrypt = CryptoJS.AES.decrypt(word, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
}

//加密方法
function Encrypt(word) {
  var srcs = CryptoJS.enc.Utf8.parse(word);
  var encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  return encrypted.toString();
}

//暴露接口
module.exports.Decrypt = Decrypt  //解密
module.exports.Encrypt = Encrypt  //加密
