import Foundation
import YandexMapsMobile

@objc public protocol MapObject {
    var zIndex: Float { get }
    var handled: Bool { get }
}

@objc public protocol MapObjectTapHandler: AnyObject {
    var handled: Bool { get }
    var mapObject: YMKMapObject? { get }
    func setMapObject(object: YMKMapObject)
    var zIndex: Float { get }
    func onMapObjectTap(point: YMKPoint)
}

struct Point {
    let lat: Double
    let lon: Double

    init(lat: Double = 0.0, lon: Double = 0.0) {
        self.lat = lat
        self.lon = lon
    }
}

struct Anchor {
    let x: Double
    let y: Double

    init(x: Double = 0.5, y: Double = 0.5) {
        self.x = x
        self.y = y
    }
}

struct Coordinate {
    let latitude: Double
    let longitude: Double
    let zoom: Float?
    let azimuth: Float?
    let tilt: Float?

    init(latitude: Double = 0.0, longitude: Double = 0.0, zoom: Float?, azimuth: Float?, tilt: Float?) {
        self.latitude = latitude
        self.longitude = longitude
        self.zoom = zoom
        self.azimuth = azimuth
        self.tilt = tilt
    }
}

struct LogoPosition {
    var horizontal = YMKLogoHorizontalAlignment.right
    var vertical = YMKLogoVerticalAlignment.bottom
    init(position: NSObject) {
        guard let horizontalPosition = position.value(forKey: "horizontal") as? String,
              let verticalPosition = position.value(forKey: "vertical") as? String
        else {
            return
        }
        switch horizontalPosition {
        case "left":
            horizontal = YMKLogoHorizontalAlignment.left
        case "center":
            horizontal = YMKLogoHorizontalAlignment.center
        default:
            horizontal = YMKLogoHorizontalAlignment.right
        }
        switch verticalPosition {
        case "top":
            vertical = YMKLogoVerticalAlignment.top
        default:
            vertical = YMKLogoVerticalAlignment.bottom
        }
    }
}
