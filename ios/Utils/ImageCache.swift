import Foundation
import UIKit

public class ImageCache {
  static let shared = ImageCache()
  private let cache = NSCache<NSString, UIImage>()
  private let cacheSize = 50 * 1024 * 1024  // 50 МБ в байтах

  private init() {
    cache.totalCostLimit = cacheSize
  }

  func setObject(_ image: UIImage, forKey key: NSString, cost: Int) {
    cache.setObject(image, forKey: key, cost: cost)
  }

  func objectForKey(_ key: NSString) -> UIImage? {
    return cache.object(forKey: key)
  }
}
