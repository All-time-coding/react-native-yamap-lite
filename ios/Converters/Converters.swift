func coordsConverter(_ object: NSObject) -> Coordinate? {
    guard let latitude = object.value(forKey: "lat") as? Double,
          let longitude = object.value(forKey: "lon") as? Double
    else {
        return nil
    }
    let tilt = object.value(forKey: "tilt") as? Float
    let zoom = object.value(forKey: "zoom") as? Float
    let azimuth = object.value(forKey: "azimuth") as? Float

    return Coordinate(latitude: latitude, longitude: longitude, zoom: zoom, azimuth: azimuth, tilt: tilt)
}

func resolveUIImage(uri: String, completion: @escaping (UIImage?) -> Void) {
    if !uri.contains("http://"), !uri.contains("https://") {
        var icon: UIImage?
        if uri.contains("file://") {
            let filePath = String(uri.dropFirst(7))
            if let fileURL = URL(string: filePath),
               let data = try? Data(contentsOf: fileURL)
            {
                icon = UIImage(data: data)
            }
        } else {
            icon = UIImage(named: uri)
        }
        completion(icon)
    } else {
        guard let url = URL(string: uri) else {
            return
        }

        let task = URLSession.shared.dataTask(with: url) { data, _, error in
            guard let data = data, error == nil else {
                completion(nil)
                return
            }
            completion(UIImage(data: data))
        }
        task.resume()
    }
}
