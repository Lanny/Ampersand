import Foundation

@objc(AmpHelpers)
class AmpHelpers: NSObject {
  func sha256(plaintext: String) -> String {
    let data = plaintext.data(using: String.Encoding.utf8)!
    var hash = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
    data.withUnsafeBytes {
      CC_SHA256($0, UInt32(data.count), &hash)
    }
    let hashData = NSData(bytes: hash, length: Int(CC_SHA256_DIGEST_LENGTH))
    
    var bytes = [UInt8](repeating: 0, count: hashData.length)
    hashData.getBytes(&bytes, length: hashData.length)
    
    var hexString = ""
    for byte in bytes {
      hexString += String(format:"%02x", UInt8(byte))
    }
    
    return hexString
  }
  
  @objc func getTokenParams(_ password:String, resolve:RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock) {
    let time = Int(NSDate().timeIntervalSince1970)
    let key = sha256(plaintext: password)
    let passphrase = sha256(plaintext: String(format: "%d%@", time, key))
    
    resolve([passphrase, String(format: "%d", time)])
  }
}
