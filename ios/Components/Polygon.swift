import Foundation
import React
import YandexMapsMobile

@objc(YamapLitePolygonComponentDelegate)
public protocol YamapLitePolygonComponentDelegate {
  func onPolygonPress(point: [String: Double])
}

@objc(YamapLitePolygon)
public class YamapLitePolygon: UIView, MapObjectTapHandler {
  @objc public weak var delegate: YamapLitePolygonComponentDelegate? = nil
  public var mapObject: YMKMapObject?
  @objc var listener: MarkerTapListener?

  override init(frame: CGRect) {
    super.init(frame: frame)
  }

  @available(*, unavailable)
  required init?(coder _: NSCoder) {
    fatalError("init(coder:) is not implemented.")
  }

  @objc public var fillColor: UIColor = .black {
    didSet {
      updatePolygon()
    }

  }

  @objc public var strokeColor: UIColor = .black {
    didSet {
      updatePolygon()
    }
  }

  @objc public var strokeWidth: Float = 1 {
    didSet {
      updatePolygon()
    }
  }

  @objc public var zIndex: Float = 1 {
    didSet {
      updatePolygon()
    }
  }

  @objc public var points: [YMKPoint]? = [] {
    didSet {
      updateGeometry()
      updatePolygon()
    }
  }

  @objc public var innerRings: [[YMKPoint]]? = [] {
    didSet {
      updateGeometry()
      updatePolygon()
    }
  }

  @objc public var handled: Bool = true

  @objc public var polygon: YMKPolygon = YMKPolygon(
    outerRing: YMKLinearRing(points: []),
    innerRings: []
  )

  @objc public func updatePolygon() {
    if let polygonObject = mapObject as? YMKPolygonMapObject, polygonObject.isValid {
      polygonObject.geometry = polygon
      polygonObject.zIndex = zIndex
      polygonObject.fillColor = fillColor
      polygonObject.strokeColor = strokeColor
      polygonObject.strokeWidth = strokeWidth
    }
  }

  @objc public func updateGeometry() {
    if let points = points, points.count >= 4 {
      let ring = YMKLinearRing(points: points)
      let unwrappedInnerRings = (innerRings ?? []).map { YMKLinearRing(points: $0) }
      polygon = YMKPolygon(outerRing: ring, innerRings: unwrappedInnerRings)
    }
  }

  public func onMapObjectTap(point: YMKPoint) {
    delegate?.onPolygonPress(point: [
      "lat": point.latitude,
      "lon": point.longitude,
    ])
  }

  @objc public func setMapObject(object: YMKMapObject) {
    if let polygonObject = object as? YMKPolygonMapObject {
      mapObject = polygonObject
      mapObject?.userData = self
      listener = MarkerTapListener()
      mapObject?.addTapListener(with: listener!)
      updatePolygon()
    }
  }
}
