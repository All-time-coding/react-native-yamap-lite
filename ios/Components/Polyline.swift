import Foundation
import React
import YandexMapsMobile

@objc(YamapLitePolylineComponentDelegate)
public protocol YamapLitePolylineComponentDelegate {
    func onPolylinePress(point: [String: Double])
}

@objc(YamapLitePolyline)
public final class YamapLitePolyline: UIView, MapObjectTapHandler {
    @objc public weak var delegate: YamapLitePolylineComponentDelegate? = nil
    public var mapObject: YMKMapObject?
    @objc var listener: MarkerTapListener?

    @objc public var strokeColor: UIColor = .black {
        didSet {
            updatePolyline()
        }
    }

    @objc public var strokeWidth: Float = 1 {
        didSet {
            updatePolyline()
        }
    }

    @objc public var outlineColor: UIColor = .black {
        didSet {
            updatePolyline()
        }
    }

    @objc public var zIndex: Float = 1 {
        didSet {
            updatePolyline()
        }
    }

    @objc public var dashLength: Float = 1 {
        didSet {
            updatePolyline()
        }
    }

    @objc public var gapLength: Float = 0 {
        didSet {
            updatePolyline()
        }
    }

    @objc public var outlineWidth: Float = 0 {
        didSet {
            updatePolyline()
        }
    }

    @objc public var dashOffset: Float = 0 {
        didSet {
            updatePolyline()
        }
    }

    @objc public var points: [YMKPoint] = [] {
        didSet {
            updateGeometry()
            updatePolyline()
        }
    }

    @objc public var handled = true

    @objc public var polyline: YMKPolyline

    override init(frame: CGRect) {
        polyline = YMKPolyline(points: points)
        super.init(frame: frame)
    }

    @available(*, unavailable)
    required init?(coder _: NSCoder) {
        fatalError("init(coder:) is not implemented.")
    }

    @objc public func updatePolyline() {
        if let polylineObject = mapObject as? YMKPolylineMapObject, polylineObject.isValid {
            polylineObject.geometry = polyline
            polylineObject.zIndex = zIndex
            polylineObject.setStrokeColorWith(strokeColor)
            polylineObject.strokeWidth = strokeWidth
            polylineObject.dashLength = dashLength
            polylineObject.gapLength = gapLength
            polylineObject.dashOffset = dashOffset
            polylineObject.outlineWidth = outlineWidth
            if outlineWidth > 0 {
                polylineObject.outlineColor = outlineColor
            }
        }
    }

    @objc public func updateGeometry() {
        if points.count >= 2,
            points.allSatisfy({ $0.latitude.isFinite && $0.longitude.isFinite })
        {
            polyline = YMKPolyline(points: points)
        }
    }

    @objc public func setMapObject(object: YMKMapObject) {
        if let polylineObject = object as? YMKPolylineMapObject {
            mapObject = polylineObject
            mapObject?.userData = self
            listener = MarkerTapListener()
            mapObject?.addTapListener(with: listener!)
            updatePolyline()
        }
    }

    public func onMapObjectTap(point: YMKPoint) {
        delegate?.onPolylinePress(point: [
            "lat": point.latitude,
            "lon": point.longitude,
        ])
    }
}
