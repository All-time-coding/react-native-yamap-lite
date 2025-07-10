
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

    @objc public var icon: UIImage? {
        didSet {
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
                self.icon = image
            } else {
                print("Failed to load image from URI: \(uri)")
            }
        }
        updateMarker()
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

            if let icon = icon {
                obj.setIconWith(icon)
                obj.setIconStyleWith(iconStyle)
            }
        }
    }
}

extension YamapLiteMarker {
    // TODO: for clustered markers
}
