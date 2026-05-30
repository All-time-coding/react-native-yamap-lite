import Foundation
import UIKit
import YandexMapsMobile
import os.log

private let logger = OSLog(subsystem: "com.yamaplite", category: "ResolveImageHelper")

public class ResolveImageHelper {
  // MARK: - Singleton
  public static let shared = ResolveImageHelper()

  // MARK: - Properties
  var iconSize: NSNumber?
  var source: String?
  var lastSource: String?

  private let session: URLSession = {
    let config = URLSessionConfiguration.default
    config.timeoutIntervalForRequest = 30.0
    config.timeoutIntervalForResource = 60.0
    config.requestCachePolicy = .reloadIgnoringLocalCacheData
    return URLSession(configuration: config)
  }()

  private init() {}

  func resolveUIImage(uri: NSString, completion: ((UIImage?) -> Void)? = nil) -> UIImage? {
    guard !uri.isEqual(to: "") else {
      os_log("URI is nil or empty", log: logger, type: .error)
      completion?(nil)
      return nil
    }

    if uri.hasPrefix("file://") || uri.hasPrefix("/") {
      var url = URL(string: uri as String)
      if url == nil {
        url = URL(fileURLWithPath: uri as String)
      }
      guard let fileURL = url else {
        os_log("Failed to create URL from URI: %@", log: logger, type: .error, uri)
        completion?(nil)
        return nil
      }

      guard let imageData = try? Data(contentsOf: fileURL) else {
        os_log("Failed to load image data from URL: %@", log: logger, type: .error, uri)
        completion?(nil)
        return nil
      }

      guard let icon = UIImage(data: imageData) else {
        os_log("Failed to create image from data: %@", log: logger, type: .error, uri)
        completion?(nil)
        return nil
      }

      let width: CGFloat =
        (iconSize?.floatValue ?? 0) > 0 ? CGFloat(iconSize!.floatValue) : icon.size.width
      let resized = self.resizeImage(icon, toWidth: width)

      let cost = Int(resized.size.width * resized.size.height * resized.scale * resized.scale * 4)
      ImageCache.shared.setObject(resized, forKey: uri, cost: cost)
      completion?(resized)
      return resized
    }

    if let cached = ImageCache.shared.objectForKey(uri) {
      completion?(cached)
      return cached
    }

    var url = URL(string: uri as String)
    if url == nil {
      url = URL(fileURLWithPath: uri as String)
    }
    guard let imageURL = url else {
      os_log("Failed to create URL from URI: %@", log: logger, type: .error, uri)
      completion?(nil)
      return nil
    }

    loadImageAsync(uri: uri, withURL: imageURL, completion: completion)
    return nil
  }

  func loadImageAsync(uri: NSString, withURL url: URL, completion: ((UIImage?) -> Void)? = nil) {
    guard !uri.isEqual(to: "") else {
      completion?(nil)
      return
    }
    if let cached = ImageCache.shared.objectForKey(uri) {
      completion?(cached)
      return
    }

    let task = session.dataTask(with: url) { data, response, error in
      if let error = error {
        os_log("Network error loading image %@: %@", log: logger, type: .error, uri, error.localizedDescription)
        completion?(nil)
        return
      }

      if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode < 200 || httpResponse.statusCode >= 300 {
        os_log("HTTP %d while loading image %@", log: logger, type: .error, httpResponse.statusCode, uri)
        completion?(nil)
        return
      }

      guard let imageData = data else {
        os_log("No data received from URL: %@", log: logger, type: .error, uri)
        completion?(nil)
        return
      }

      guard let image = UIImage(data: imageData) else {
        os_log("Failed to decode image data (%d bytes) from: %@", log: logger, type: .error, imageData.count, uri)
        completion?(nil)
        return
      }

      let cost = Int(image.size.width * image.size.height * image.scale * image.scale * 4)
      ImageCache.shared.setObject(image, forKey: uri, cost: cost)

      DispatchQueue.main.async {
        completion?(image)
      }
    }

    task.resume()
  }

  func resizeImage(_ image: UIImage, toWidth width: CGFloat) -> UIImage {
    guard image.size.width > 0 && image.size.height > 0 else { return image }
    let scaleFactor = width / image.size.width
    let newSize = CGSize(width: width, height: image.size.height * scaleFactor)
    UIGraphicsBeginImageContextWithOptions(newSize, false, 0.0)
    image.draw(in: CGRect(origin: .zero, size: newSize))
    let newImage = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()
    return newImage ?? image
  }
}
