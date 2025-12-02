import Foundation
import React
import YandexMapsMobile

@objc(YamapLiteCircleComponentDelegate)
public protocol YamapLiteCircleComponentDelegate {
    func onCirclePress(point: [String: Double])
}

@objc(YamapLiteCircle)
public class YamapLiteCircle: UIView, MapObjectTapHandler {
    @objc public weak var delegate: YamapLiteCircleComponentDelegate? = nil
    public var mapObject: YMKMapObject?
    @objc public var radius: Float = 100 {
        didSet {
            updateGeometry()
            updateCircle()
        }
    }

    @objc public var fillColor: UIColor = .black {
        didSet {
            updateCircle()
        }
    }

    @objc public var strokeColor: UIColor = .black {
        didSet {
            updateCircle()
        }
    }

    @objc public var strokeWidth: Float = 1 {
        didSet {
            updateCircle()
        }
    }

    @objc public var zIndex: Float = 1 {
        didSet {
            updateCircle()
        }
    }

    @objc public var circleCenter = YMKPoint(latitude: 55.951244, longitude: 38.718423) {
        didSet {
            updateGeometry()
            updateCircle()
        }
    }

    @objc public var handled = true
    @objc public var circle: YMKCircle
    @objc var listener: MarkerTapListener?
    override init(frame: CGRect) {
        circleCenter = YMKPoint(latitude: 0, longitude: 0)
        radius = 0.0
        fillColor = UIColor.black
        strokeColor = UIColor.black
        zIndex = 1
        strokeWidth = 1
        handled = true
        circle = YMKCircle(center: circleCenter, radius: radius)
        super.init(frame: frame)
    }

    @available(*, unavailable)
    required init?(coder _: NSCoder) {
        fatalError("init(coder:) is not implemented.")
    }

    @objc public func updateGeometry() {
        if center != nil {
            circle = YMKCircle(center: circleCenter, radius: radius)
        }
    }

    public func onMapObjectTap(point _: YMKPoint) {
      delegate?.onCirclePress(point: [
            "lat": circleCenter.latitude,
            "lon": circleCenter.longitude,
        ])
    }

    @objc public func setMapObject(object: YMKMapObject) {
        if let polygonObject = object as? YMKCircleMapObject {
            mapObject = polygonObject
            mapObject?.userData = self
            listener = MarkerTapListener()
            mapObject?.addTapListener(with: listener!)
            updateCircle()
        }
    }

    @objc public func setCircleCenter(latitude: Double, longitude: Double) {
        circleCenter = YMKPoint(latitude: latitude, longitude: longitude)
    }

    @objc public func updateCircle() {
        if let circleObject = mapObject as? YMKCircleMapObject, circleObject.isValid {
            circleObject.geometry = circle
            circleObject.zIndex = zIndex
            circleObject.fillColor = fillColor
            circleObject.strokeColor = strokeColor
            circleObject.strokeWidth = strokeWidth
        }
    }
}
