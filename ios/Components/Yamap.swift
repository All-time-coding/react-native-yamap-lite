import Foundation
import React
import UIKit
import YandexMapsMobile
import os.log

private let yamapLogger = OSLog(subsystem: "com.yamaplite", category: "YamapView")

@objc(YamapViewComponentDelegate)
public protocol YamapViewComponentDelegate {
  func handleOnMapLoaded(result: [String: Any])
  func handleOnCameraPositionChange(coords: [String: Any])
  func handleOnCameraPositionChangeEnd(coords: [String: Any])
  func handleOnMapPress(coords: [String: Any])
  func handleOnMapLongPress(coords: [String: Any])
}

@objc(YamapView)
public class YamapView: UIView {
  @objc public weak var delegate: YamapViewComponentDelegate? = nil {
    didSet {
      if delegate != nil && mapView != nil {
        runOnMainThread {
          self.setupListeners()
        }
      }
    }
  }

  @objc private var mapObjects: [YamapLiteMarker] = []

  // MARK: LISTENERS

  ////////////////////////
  ///////LISTENERS////////
  ////////////////////////

  private var cameraListener: CameraListener?
  private var loadListener: MapLoadListener?
  private var mapInputListener: MapInputListener?
  private var userLocationListener: UserLocationObjectListener?
  private var userLocationLayer: YMKUserLocationLayer!
  private var userLocationImage: UIImage?

  // MARK: CALLBACKS

  ////////////////////////
  ///////CALLBACKS////////
  ////////////////////////

  @objc public var onCameraPositionChangeCallback: RCTDirectEventBlock?
  @objc public var onCameraPositionChangeEndCallback: RCTDirectEventBlock?
  @objc public var onStop: RCTDirectEventBlock?
  @objc public var onMapLoaded: RCTBubblingEventBlock?

  @objc public var mapView: YMKMapView!

  // MARK: PROPERTIES

  ////////////////////////
  ///////PROPERTIES///////
  ////////////////////////

  @objc public var mapType: String = "map" {
    didSet {
      guard let map = mapView?.mapWindow?.map else {
        return
      }
      switch mapType {
      case "satellite":
        map.mapType = .satellite
      case "hybrid":
        map.mapType = .hybrid
      default:
        map.mapType = .map
      }
    }
  }

  @objc public var nightMode: Bool = false
  @objc public var scrollGesturesEnabled: Bool = true
  @objc public var userLocationIconScale: Float = 1.0
  @objc public var showUserPosition = false
  @objc public var userLocationAccuracyFillColor: UIColor = UIColor.green
  @objc public var userLocationAccuracyStrokeColor: UIColor = UIColor.black
  @objc public var userLocationAccuracyStrokeWidth: Float = 2.0
  @objc public var zoomGesturesEnabled: Bool = true
  @objc public var tiltGesturesEnabled: Bool = true
  @objc public var rotateGesturesEnabled: Bool = true
  @objc public var fastTapEnabled: Bool = true

  @objc public func applyProperties() {
    runOnMainThread {
      self.updateMapProperties()
    }
  }

  private func updateMapProperties() {
    guard let map = mapView?.mapWindow?.map else { return }
    switch mapType {
    case "satellite": map.mapType = .satellite
    case "hybrid": map.mapType = .hybrid
    default: map.mapType = .map
    }

    map.isNightModeEnabled = nightMode
    map.isScrollGesturesEnabled = scrollGesturesEnabled
    map.isZoomGesturesEnabled = zoomGesturesEnabled
    map.isTiltGesturesEnabled = tiltGesturesEnabled
    map.isRotateGesturesEnabled = rotateGesturesEnabled
    map.isFastTapEnabled = fastTapEnabled

    self.updateUserIcon()
  }

  @objc public func setFollowUser(_ follow: Bool) {
    if userLocationLayer == nil {
      setupListeners()
    }

    if follow {
      userLocationLayer.isAutoZoomEnabled = true
      guard let mapView = mapView else { return }
      let width = mapView.bounds.width
      let height = mapView.bounds.height
      userLocationLayer.setAnchorWithAnchorNormal(
        CGPoint(x: 0.5 * width, y: 0.5 * height),
        anchorCourse: CGPoint(x: 0.5 * width, y: 0.83 * height))
    } else {
      userLocationLayer.isAutoZoomEnabled = false
      userLocationLayer.resetAnchor()
    }
  }
  @objc public var maxFps: Float = 60 {
    didSet {
      if maxFps <= 0 || maxFps > 60 {
        maxFps = 60
      }
      guard let map = mapView?.mapWindow else { return }
      map.setMaxFpsWithFps(maxFps)
    }
  }

  override init(frame: CGRect) {
    super.init(frame: frame)
    initImpl()
  }

  @available(*, unavailable)
  required init?(coder _: NSCoder) {
    fatalError("init(coder:) is not implemented.")
  }

  private func initImpl() {
    runOnMainThread {
      self.initMapView()
    }
  }

  private func initMapView() {
    mapView = YMKMapView(frame: bounds, vulkanPreferred: YamapView.isM1Simulator())
    mapView.mapWindow.map.mapType = .map
    applyProperties()
    insertSubview(mapView, at: 0)
  }

  @objc private func setupListeners() {
    guard let delegate = delegate, let map = mapView?.mapWindow?.map else { return }

    if loadListener == nil {
      loadListener = MapLoadListener(callback: nil, mapDelegate: delegate)
      map.setMapLoadedListenerWith(loadListener!)
    }

    if cameraListener == nil {
      let cameraDelegate = CameraListener(callback: nil, delegate: delegate)
      cameraListener = cameraDelegate
      map.addCameraListener(with: cameraDelegate)
    }

    if mapInputListener == nil {
      mapInputListener = MapInputListener(delegate: delegate)
      map.addInputListener(with: mapInputListener!)
    }

    if userLocationListener == nil {
      userLocationListener = UserLocationObjectListener(callback: updateUserIcon)
    }

    if userLocationLayer == nil {
      userLocationLayer = YMKMapKit.sharedInstance().createUserLocationLayer(
        with: mapView.mapWindow)
      userLocationLayer.setObjectListenerWith(userLocationListener)
    }

    if userLocationLayer != nil {
      userLocationLayer.setVisibleWithOn(showUserPosition)
    }
  }

  ////////////////////////
  ///////METHODS//////////
  ////////////////////////

  @objc public func setLogoPosition(position: NSDictionary) {
    guard let map = mapView?.mapWindow?.map else { return }
    let logoPosition = LogoPosition(position: position)
    map.logo.setAlignmentWith(
      YMKLogoAlignment(
        horizontalAlignment: logoPosition.horizontal,
        verticalAlignment: logoPosition.vertical))
  }

  @objc public func setLogoPadding(vertical: Int, horizontal: Int) {
    guard let map = mapView?.mapWindow?.map else { return }
    map.logo.setPaddingWith(
      YMKLogoPadding(horizontalPadding: UInt(horizontal), verticalPadding: UInt(vertical)))
  }

  @objc public func setMapStyle(style: [String: Any]) {
    guard let map = mapView?.mapWindow?.map else { return }
    guard let data = try? JSONSerialization.data(withJSONObject: style, options: []),
      let styleString = String(data: data, encoding: .utf8)
    else {
      os_log("Failed to serialize style dictionary to JSON", log: yamapLogger, type: .error)
      return
    }
    map.setMapStyleWithStyle(styleString)
  }

  @objc func setLocale(_ locale: String) {
    YRTI18nManagerFactory.setLocaleWithLocale(locale)
  }

  @objc public func setShowUserPositionState(_ show: Bool) {
    showUserPosition = show
    if userLocationLayer != nil {
      userLocationLayer.setVisibleWithOn(show)
    }
    if show {
      updateUserIcon()
    }
  }

  @objc public func setUserLocationIcon(path: String) {
    let helper = ResolveImageHelper.shared
    let baseSize: CGFloat = 50.0

    let image = helper.resolveUIImage(uri: path as NSString) { [weak self] loadedImage in
      guard let self = self, let loadedImage = loadedImage else {
        os_log("Failed to load image from URI: %@", log: yamapLogger, type: .error, path)
        return
      }
      let resizedImage = helper.resizeImage(loadedImage, toWidth: baseSize)
      self.userLocationImage = resizedImage
      self.updateUserIcon()
    }

    if let image = image {
      let resizedImage = helper.resizeImage(image, toWidth: baseSize)
      userLocationImage = resizedImage
      updateUserIcon()
    }
  }

  @objc public func updateUserIcon() {
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }

      let userIconStyle = YMKIconStyle()
      userIconStyle.scale = self.userLocationIconScale as NSNumber

      if let image = self.userLocationImage {
        self.userLocationListener?.userLocationView?.pin.setIconWith(
          image, style: userIconStyle)
        self.userLocationListener?.userLocationView?.arrow.setIconWith(
          image, style: userIconStyle)
      }

      if let circle = self.userLocationListener?.userLocationView?.accuracyCircle {
        circle.fillColor = self.userLocationAccuracyFillColor
        circle.strokeColor = self.userLocationAccuracyStrokeColor
        circle.strokeWidth = self.userLocationAccuracyStrokeWidth
      }
    }
  }

  @objc func getLocale(_ resolve: RCTPromiseResolveBlock, reject _: RCTPromiseRejectBlock) {
    resolve(YRTI18nManagerFactory.getLocale())
  }

  @objc func resetLocale(_ resolve: RCTPromiseResolveBlock, reject _: RCTPromiseRejectBlock) {
    YRTI18nManagerFactory.setLocaleWithLocale(nil)
    resolve(nil)
  }

  @objc func fitMakers(_ markers: [YMKPoint]) {
    guard let map = mapView?.mapWindow?.map else { return }
    if markers.isEmpty {
      return
    }
    let latitudes = markers.map { $0.latitude }
    let longitudes = markers.map { $0.longitude }
    if latitudes.isEmpty || longitudes.isEmpty {
      return
    }
    let minLatitude = latitudes.min() ?? 0
    let minLongitude = longitudes.min() ?? 0
    let maxLatitude = latitudes.max() ?? 0
    let maxLongitude = longitudes.max() ?? 0
    let southWest = YMKPoint(latitude: minLatitude, longitude: minLongitude)
    let northEast = YMKPoint(latitude: maxLatitude, longitude: maxLongitude)
    let box = YMKBoundingBox(southWest: southWest, northEast: northEast)

    let camera = map.cameraPosition(with: YMKGeometry(boundingBox: box))
    let paddingZoom: Float = 0.75
    let adjustedZoom = max(camera.zoom - paddingZoom, 0)

    let adjustedCamera = YMKCameraPosition(
      target: camera.target,
      zoom: adjustedZoom,
      azimuth: camera.azimuth,
      tilt: camera.tilt
    )

    let anim = YMKAnimation(type: .smooth, duration: 0.7)
    map.move(with: adjustedCamera, animation: anim)
  }

  @objc public func getCameraPosition() -> [String: Any]? {
    guard let map = mapView?.mapWindow?.map else { return nil }
    let position = map.cameraPosition
    let result: [String: Any] = [
      "lat": position.target.latitude,
      "lon": position.target.longitude,
      "zoom": Double(position.zoom),
      "azimuth": Double(position.azimuth),
      "tilt": Double(position.tilt),
    ]
    return result
  }

  @objc public func getMapObjectCount() -> NSNumber {
    guard let map = mapView?.mapWindow?.map else { return 0 }
    let visitor = MapObjectCountVisitor()
    map.mapObjects.traverse(with: visitor)
    return NSNumber(value: visitor.count)
  }

  @objc public func getVisibleRegion() -> [String: Any]? {
    guard let mapWindow = mapView?.mapWindow else { return nil }
    let region = mapWindow.map.visibleRegion
    return [
      "bottomLeft": ["lat": region.bottomLeft.latitude, "lon": region.bottomLeft.longitude],
      "bottomRight": ["lat": region.bottomRight.latitude, "lon": region.bottomRight.longitude],
      "topLeft": ["lat": region.topLeft.latitude, "lon": region.topLeft.longitude],
      "topRight": ["lat": region.topRight.latitude, "lon": region.topRight.longitude],
    ]
  }

  @objc public func getScreenPoints(_ points: [[String: Double]]) -> [[String: Double]] {
    guard let mapWindow = mapView?.mapWindow else { return [] }
    return points.compactMap { p -> [String: Double]? in
      guard let lat = p["lat"], let lon = p["lon"] else { return nil }
      guard
        let screenPoint = mapWindow.worldToScreen(
          withWorldPoint: YMKPoint(latitude: lat, longitude: lon))
      else { return nil }
      return ["x": Double(screenPoint.x), "y": Double(screenPoint.y)]
    }
  }

  @objc public func getWorldPoints(_ points: [[String: Double]]) -> [[String: Double]] {
    guard let mapWindow = mapView?.mapWindow else { return [] }
    return points.compactMap { p -> [String: Double]? in
      guard let x = p["x"], let y = p["y"] else { return nil }
      guard
        let worldPoint = mapWindow.screenToWorld(
          with: YMKScreenPoint(x: Float(x), y: Float(y)))
      else { return nil }
      return ["lat": worldPoint.latitude, "lon": worldPoint.longitude]
    }
  }

  @objc public func move(
    _ latitude: Double, _ longitude: Double, _ zoom: Float, _ azimuth: Float, _ tilt: Float
  ) {
    guard latitude.isFinite, longitude.isFinite, zoom.isFinite, azimuth.isFinite, tilt.isFinite
    else { return }
    guard let m = mapView?.mapWindow?.map else { return }
    m.move(
      with: YMKCameraPosition(
        target: YMKPoint(latitude: latitude, longitude: longitude),
        zoom: zoom,
        azimuth: azimuth,
        tilt: tilt
      )
    )
  }

  static func isM1Simulator() -> Bool {
    #if targetEnvironment(simulator) && arch(arm64)
      return true
    #else
      return false
    #endif
  }

  @objc public func setCenter(
    latitude: Double,
    longitude: Double,
    zoom: Float,
    azimuth: Float,
    tilt: Float,
    duration: Float,
    animation: String
  ) {
    guard latitude.isFinite, longitude.isFinite, zoom.isFinite, azimuth.isFinite, tilt.isFinite
    else { return }
    guard let map = mapView?.mapWindow?.map else { return }
    let animType: YMKAnimationType
    switch animation {
    case "LINEAR":
      animType = .linear
    default:
      animType = .smooth
    }
    let newPosition = YMKCameraPosition(
      target: YMKPoint(latitude: latitude, longitude: longitude), zoom: Float(zoom),
      azimuth: azimuth, tilt: tilt)
    if duration > 0 {
      let anim = YMKAnimation(type: animType, duration: Float(duration) / 1000.0)
      map.move(with: newPosition, animation: anim)
    } else {
      map.move(with: newPosition)
    }
  }

  @objc(setZoomWithZoom:duration:animation:)
  public func setZoom(
    zoom: Float,
    duration: Float,
    animation: String
  ) {
    guard zoom.isFinite else { return }
    guard let map = mapView?.mapWindow?.map else { return }
    let animType: YMKAnimationType
    switch animation {
    case "LINEAR":
      animType = .linear
    default:
      animType = .smooth
    }
    let prevPosition = map.cameraPosition
    let newPosition = YMKCameraPosition(
      target: prevPosition.target, zoom: Float(zoom), azimuth: prevPosition.azimuth,
      tilt: prevPosition.tilt)
    if duration > 0 {
      let anim = YMKAnimation(type: animType, duration: Float(duration) / 1000.0)
      map.move(with: newPosition, animation: anim)
    } else {
      map.move(with: newPosition)
    }
  }

  @objc public func fitAllMarkers() {
    var markerPoints: [YMKPoint] = []

    for marker in mapObjects {
      if marker.visible, let point = marker.point, point.lat.isFinite, point.lon.isFinite {
        markerPoints.append(YMKPoint(latitude: point.lat, longitude: point.lon))
      }
    }

    if markerPoints.isEmpty {
      return
    }

    fitMakers(markerPoints)
  }

  @objc func cleanMap() {
    guard let map = mapView?.mapWindow?.map else { return }
    map.mapObjects.clear()
    mapObjects.removeAll()
  }

  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc override public func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    let safeIndex = min(atIndex, subviews.count)
    insertSubview(subview, at: safeIndex)
    if let markerContainer = subview as? UIView,
      let markerView = markerContainer.value(forKey: "contentView") as? YamapLiteMarker
    {
      let lat = markerView.point?.lat ?? 0.0
      let lon = markerView.point?.lon ?? 0.0
      let viewPlacemark = mapView.mapWindow.map.mapObjects.addPlacemark()

      if lat.isFinite, lon.isFinite {
        viewPlacemark.geometry = YMKPoint(latitude: lat, longitude: lon)
      }
      markerView.setMapObject(object: viewPlacemark)
      if !mapObjects.contains(where: { $0 === markerView }) {
        mapObjects.append(markerView)
      }
    }

    else if let circleContainer = subview as? UIView,
      let circleView = circleContainer.value(forKey: "contentView") as? YamapLiteCircle
    {
      if circleView.radius > 0,
        circleView.circleCenter.latitude.isFinite,
        circleView.circleCenter.longitude.isFinite
      {
        let nativeMapObjects = mapView.mapWindow.map.mapObjects
        let circleObject = nativeMapObjects.addCircle(with: circleView.circle)
        circleView.setMapObject(object: circleObject)
      }
    } else if let polygonContainer = subview as? UIView,
      let polygonView = polygonContainer.value(forKey: "contentView") as? YamapLitePolygon
    {
      let nativeMapObjects = mapView.mapWindow.map.mapObjects
      let polygonObject = nativeMapObjects.addPolygon(with: polygonView.polygon)
      polygonView.setMapObject(object: polygonObject)
    } else if let polylineContainer = subview as? UIView,
      let polylineView = polylineContainer.value(forKey: "contentView") as? YamapLitePolyline
    {
      let nativeMapObjects = mapView.mapWindow.map.mapObjects
      let polylineObject = nativeMapObjects.addPolyline(with: polylineView.polyline)
      polylineView.setMapObject(object: polylineObject)
    }
  }

  @objc override public func removeReactSubview(_ subview: UIView!) {
    subview.removeFromSuperview()
    guard let container = subview as? UIView,
      let contentView = container.value(forKey: "contentView") as? UIView
    else { return }

    let nativeMapObjects = mapView.mapWindow.map.mapObjects

    if let markerView = contentView as? YamapLiteMarker {
      if let obj = markerView.mapObject, obj.isValid {
        nativeMapObjects.remove(with: obj)
      }
      mapObjects.removeAll { $0 === markerView }
    } else if let circleView = contentView as? YamapLiteCircle {
      if let obj = circleView.mapObject, obj.isValid {
        nativeMapObjects.remove(with: obj)
      }
    } else if let polygonView = contentView as? YamapLitePolygon {
      if let obj = polygonView.mapObject, obj.isValid {
        nativeMapObjects.remove(with: obj)
      }
    } else if let polylineView = contentView as? YamapLitePolyline {
      if let obj = polylineView.mapObject, obj.isValid {
        nativeMapObjects.remove(with: obj)
      }
    }
  }

  func runOnMainThread(_ block: @escaping () -> Void) {
    if Thread.isMainThread { block() } else { DispatchQueue.main.async { block() } }
  }
}

private final class MapObjectCountVisitor: NSObject, YMKMapObjectVisitor {
  var count = 0

  func onPlacemarkVisited(withPlacemark placemark: YMKPlacemarkMapObject) { count += 1 }
  func onPolylineVisited(withPolyline polyline: YMKPolylineMapObject) { count += 1 }
  func onPolygonVisited(withPolygon: YMKPolygonMapObject) { count += 1 }
  func onCircleVisited(withCircle: YMKCircleMapObject) { count += 1 }

  func onCollectionVisitStart(with collection: YMKMapObjectCollection) -> Bool { true }
  func onCollectionVisitEnd(with collection: YMKMapObjectCollection) {}
  func onClusterizedCollectionVisitStart(with collection: YMKClusterizedPlacemarkCollection) -> Bool
  {
    true
  }
  func onClusterizedCollectionVisitEnd(with collection: YMKClusterizedPlacemarkCollection) {}
}
