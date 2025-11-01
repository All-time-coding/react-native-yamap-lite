
import Foundation
import React
import YandexMapsMobile

@objc(YamapLiteMarkerComponentDelegate)
public protocol YamapLiteMarkerComponentDelegate {
    func onMarkerPress(point: [String: Double])
}

@objc(YamapLiteMarker)
public class YamapLiteMarker: UIView, MapObjectTapHandler {
    ////////////////////////
    ///////PROPERTIES///////
    ////////////////////////

    private var listener: MarkerTapListener?

    var point: Point? {
        didSet {
            updateMarker()
        }
    }

    @objc public weak var delegate: YamapLiteMarkerComponentDelegate? = nil

    @objc public var scale: Double = 1.0 {
        didSet {
            if scale < 0.1 {
                scale = 0.1
            }
            updateMarker()
        }
    }

    private var originalIcon: UIImage?
    
    @objc public var icon: UIImage? {
        get {
            return originalIcon
        }
        set {
            originalIcon = newValue
            updateMarker()
        }
    }

    @objc public var onPress: RCTBubblingEventBlock? = nil
    var anchor: Anchor?
    @objc public var zIndex: Float = 0 {
        didSet {
            updateMarker()
        }
    }

    @objc public var visible: Bool = true {
        didSet {
            updateMarker()
        }
    }

    @objc public var handled: Bool = true
    @objc public var mapObject: YMKMapObject? = nil
    @objc public var rotated: Int = 1 {
        didSet {
            updateMarker()
        }
    }

    @objc public var size: Int = 25 {
        didSet {
            updateMarker()
        }
    }

    @objc public var onPressHandler: RCTBubblingEventBlock? = nil

    override init(frame: CGRect) {
        super.init(frame: frame)
    }

    @available(*, unavailable)
    required init?(coder _: NSCoder) {
        fatalError("init(coder:) is not implemented.")
    }

    ////////////////////////
    ////////METHODS/////////
    ////////////////////////

    @objc public func onMapObjectTap(point: YMKPoint) {
        delegate?.onMarkerPress(point: [
            "lat": point.latitude,
            "lon": point.longitude,
        ])
    }

    @objc public func setPoint(lat: Double, lon: Double) {
        point = Point(lat: lat, lon: lon)
        updateMarker()
    }

    @objc public func setAnchor(x: Double, y: Double) {
        anchor = Anchor(x: x, y: y)
        updateMarker()
    }

    @objc public func setIcon(uri: String) {
        resolveUIImage(uri: uri) { image in
            if let image = image {
                self.originalIcon = image
                self.updateMarker()
            } else {
                print("Failed to load image from URI: \(uri)")
            }
        }
    }

    @objc public func setMapObject(object: YMKMapObject) {
        guard let placemark = object as? YMKPlacemarkMapObject else { return }
        if mapObject == nil {
            mapObject = placemark
            mapObject!.userData = self
            listener = MarkerTapListener()
            mapObject!.addTapListener(with: listener!)
            updateMarker()
        }
    }

    private func resizeImage(image: UIImage, targetSize: Int) -> UIImage? {
        guard targetSize > 0 else { return image }
        
        // Convert points to pixels based on screen scale
        // size comes from React Native in points, we need to convert to pixels
        let screenScale = UIScreen.main.scale
        let targetSizePx = CGFloat(targetSize) * screenScale
        
        // Get image size in pixels
        let width = image.size.width * image.scale
        let height = image.size.height * image.scale
        
        if abs(width - targetSizePx) < 1.0 && abs(height - targetSizePx) < 1.0 {
            return image
        }
        
        // Calculate scale to fit target size (maintain aspect ratio)
        let maxDimension = max(width, height)
        let scale = targetSizePx / maxDimension
        let scaledWidth = width * scale
        let scaledHeight = height * scale
        
        // Create new image with target size in pixels
        let size = CGSize(width: scaledWidth, height: scaledHeight)
        UIGraphicsBeginImageContextWithOptions(size, false, 1.0)
        image.draw(in: CGRect(origin: .zero, size: size))
        let resizedImage = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        
        // Return image with screen scale to ensure proper display
        return resizedImage?.withRenderingMode(.alwaysOriginal) ?? image
    }

    @objc public func updateMarker() {
        DispatchQueue.main.async { [self] in
            guard let obj = mapObject as? YMKPlacemarkMapObject, obj.isValid else { return }
            let geometryPoint = YMKPoint(latitude: self.point?.lat ?? 0.0, longitude: self.point?.lon ?? 0.0)
            obj.geometry = geometryPoint

            obj.zIndex = Float(zIndex)

            let iconStyle = YMKIconStyle()
            iconStyle.scale = NSNumber(value: scale)
            iconStyle.visible = NSNumber(value: visible)
            let anchorX = anchor?.x ?? 0.5
            let anchorY = anchor?.y ?? 0.5
            iconStyle.anchor = NSValue(cgPoint: CGPoint(x: CGFloat(anchorX), y: CGFloat(anchorY)))

            iconStyle.rotationType = NSNumber(value: YMKRotationType.rotate.rawValue)

            if let icon = originalIcon {
                let resizedIcon = resizeImage(image: icon, targetSize: size)
                obj.setIconWith(resizedIcon ?? icon)
                obj.setIconStyleWith(iconStyle)
            }
        }
    }
}

extension YamapLiteMarker {
    // TODO: for clustered markers
}
