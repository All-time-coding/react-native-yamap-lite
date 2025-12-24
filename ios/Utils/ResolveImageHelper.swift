import Foundation
import UIKit
import YandexMapsMobile

public class ResolveImageHelper {
    // MARK: - Singleton
    public static let shared = ResolveImageHelper()
    
    // MARK: - Properties
    var iconSize: NSNumber?
    var source: String?
    var lastSource: String?
    
    private init() {}
    
    
    func resolveUIImage(uri: NSString, completion: ((UIImage?) -> Void)? = nil) -> UIImage? {
      guard !uri.isEqual(to: "") else {
            print("URI is nil or empty")
            completion?(nil)
            return nil
        }
        
        // Локальные файлы загружаем синхронно
        if uri.hasPrefix("file://") || uri.hasPrefix("/") {
          var url = URL(string: uri as String)
            if url == nil {
              url = URL(fileURLWithPath: uri as String)
            }
            guard let fileURL = url else {
                print("Failed to create URL from URI: \(uri)")
                completion?(nil)
                return nil
            }
            
            guard let imageData = try? Data(contentsOf: fileURL) else {
                print("Failed to load image data from URL: \(uri)")
                completion?(nil)
                return nil
            }
            
            guard let icon = UIImage(data: imageData) else {
                print("Failed to create image from data: \(uri)")
                completion?(nil)
                return nil
            }
            
            let width: CGFloat = (iconSize?.floatValue ?? 0) > 0 ? CGFloat(iconSize!.floatValue) : icon.size.width
            let resized = self.resizeImage(icon, toSize: CGSize(width: width, height: width))
            
            // Помещаем в кэш
            let cost = Int(resized.size.width * resized.size.height * resized.scale * resized.scale * 4)
            ImageCache.shared.setObject(resized, forKey: uri, cost: cost)
            completion?(resized)
            return resized
        }
        
        // Проверяем кэш
        if let cached = ImageCache.shared.objectForKey(uri) {
            completion?(cached)
            return cached
        }
        
        // Асинхронная загрузка (если нет в кэше)
        print("[ResolveImageHelper] Attempting to create URL from: \(uri)")
        var url = URL(string: uri as String)
        if url == nil {
            // попробовать как file path
            print("[ResolveImageHelper] Failed to create URL from string, trying fileURLWithPath")
            url = URL(fileURLWithPath: uri as String)
        }
        guard let imageURL = url else {
            print("[ResolveImageHelper] Failed to create URL from URI: \(uri)")
            completion?(nil)
            return nil
        }
        
        print("[ResolveImageHelper] Created URL: \(imageURL.absoluteString), scheme: \(imageURL.scheme ?? "nil")")
        loadImageAsync(uri: uri, withURL: imageURL, completion: completion)
        
        return nil // пока загружается
    }
    
    func loadImageAsync(uri: NSString, withURL url: URL, completion: ((UIImage?) -> Void)? = nil) {
        guard !uri.isEqual(to: "") else {
            print("[ResolveImageHelper] URI is empty")
            completion?(nil)
            return
        }
        // Если уже в кэше — не грузим
        if let cached = ImageCache.shared.objectForKey(uri) {
            print("[ResolveImageHelper] Image found in cache for: \(uri)")
            completion?(cached)
            return
        }

        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = 30.0
        config.timeoutIntervalForResource = 60.0
        config.requestCachePolicy = .reloadIgnoringLocalCacheData
        
        let session = URLSession(configuration: config)
        let task = session.dataTask(with: url) { data, response, error in
            
            if let error = error {
                completion?(nil)
                return
            }
            
            // Проверяем HTTP код, если это HTTP response
            if let httpResponse = response as? HTTPURLResponse {
                let status = httpResponse.statusCode
                print("[ResolveImageHelper] HTTP status code: \(status) for \(uri)")
                if status < 200 || status >= 300 {
                    print("[ResolveImageHelper] HTTP error \(status) while loading image \(uri)")
                    completion?(nil)
                    return
                }
            }
            
            guard let imageData = data else {
                print("[ResolveImageHelper] No data received from URL: \(uri)")
                completion?(nil)
                return
            }
            
            print("[ResolveImageHelper] Received \(imageData.count) bytes for \(uri)")
            
            guard let image = UIImage(data: imageData) else {
                print("[ResolveImageHelper] Failed to create image from loaded data: \(uri)")
                print("[ResolveImageHelper] Data size: \(imageData.count) bytes")
                completion?(nil)
                return
            }
            
            let cost = Int(image.size.width * image.size.height * image.scale * image.scale * 4)
            ImageCache.shared.setObject(image, forKey: uri, cost: cost)
            
            print("[ResolveImageHelper] Image cached and ready, calling completion for: \(uri)")
            
            // Вызываем completion в главном потоке
            DispatchQueue.main.async {
                completion?(image)
            }
        }
        
        task.resume()
    }
    
    func resizeImage(_ image: UIImage, toSize size: CGSize) -> UIImage {
        guard image.size.width > 0 && image.size.height > 0 else {
            return image
        }
        return image
//        // Сохраняем пропорции: ширина = size.width, высота рассчитывается пропорционально
//        let scaleFactor = size.width / image.size.width
//        let targetHeight = image.size.height * scaleFactor
//        let newSize = CGSize(width: size.width, height: targetHeight)
//        
//        UIGraphicsBeginImageContextWithOptions(newSize, false, 0.0)
//        image.draw(in: CGRect(origin: .zero, size: newSize))
//        let newImage = UIGraphicsGetImageFromCurrentImageContext()
//        UIGraphicsEndImageContext()
//        
//        return newImage ?? image
    }
}
