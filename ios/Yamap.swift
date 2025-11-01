import Foundation
import React
import UIKit
import YandexMapsMobile

@objc(YamapViewComponentDelegate)
public protocol YamapViewComponentDelegate {
    func handleOnMapLoaded(result: [String: Any])
    func handleOnCameraPositionChange(coords: [String: Any])
    func handleOnCameraPositionChangeEnd(coords: [String: Any])
}

    @objc(YamapView)
    public class YamapView: UIView {
        @objc public weak var delegate: YamapViewComponentDelegate? = nil {
            didSet {
                if delegate != nil && mapView != nil {
                    setupListeners()
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
            guard let map = mapView?.mapWindow?.map else { return }
            print("mapType: \(mapType)")
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

    @objc public var nightMode: Bool = false {
        didSet {
            guard let map = mapView?.mapWindow?.map else { return }
            print("nightMode \(nightMode)")
            map.isNightModeEnabled = nightMode
            applyProperties()
        }
    }

    @objc public var scrollGesturesEnabled: Bool = true {
        didSet {
            guard let map = mapView?.mapWindow?.map else { return }
            map.isScrollGesturesEnabled = scrollGesturesEnabled
        }
    }

    @objc public var userLocationIconScale: Float = 1.0
    @objc public var showUserPosition = false
    @objc public var zoomGesturesEnabled: Bool = true {
        didSet {
            guard let map = mapView?.mapWindow?.map else { return }
            map.isZoomGesturesEnabled = zoomGesturesEnabled
        }
    }

    @objc public var tiltGesturesEnabled: Bool = true {
        didSet {
            guard let map = mapView?.mapWindow?.map else { return }
            map.isTiltGesturesEnabled = tiltGesturesEnabled
        }
    }

    @objc public var rotateGesturesEnabled: Bool = true {
        didSet {
            guard let map = mapView?.mapWindow?.map else { return }
            map.isRotateGesturesEnabled = rotateGesturesEnabled
        }
    }

    @objc public var fastTapEnabled: Bool = true {
        didSet {
            guard let map = mapView?.mapWindow?.map else { return }
            map.isFastTapEnabled = fastTapEnabled
        }
    }

    @objc public var maxFps: Float = 30 {
        didSet {
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
        
        if userLocationListener == nil {
            userLocationListener = UserLocationObjectListener(callback: updateUserIcon)
        }
        
        if userLocationLayer == nil {
            userLocationLayer = YMKMapKit.sharedInstance().createUserLocationLayer(with: mapView.mapWindow)
            userLocationLayer.setObjectListenerWith(userLocationListener)
        }
        
        if userLocationLayer != nil {
            userLocationLayer.setVisibleWithOn(showUserPosition)
        }
    }
    
    @objc private func applyProperties() {
        guard let map = mapView?.mapWindow?.map else { return }
        switch mapType {
        case "satellite": map.mapType = .satellite
        case "hybrid": map.mapType = .hybrid
        default: map.mapType = .map
        }

        map.isNightModeEnabled = nightMode
        map.isScrollGesturesEnabled = scrollGesturesEnabled
        map.isZoomGesturesEnabled = zoomGesturesEnabled
    }

    ////////////////////////
    ///////METHODS//////////
    ////////////////////////

    @objc public func setLogoPosition(position: NSDictionary) {
        guard let map = mapView?.mapWindow?.map else { return }
        let logoPosition = LogoPosition(position: position)
        map.logo.setAlignmentWith(YMKLogoAlignment(horizontalAlignment: logoPosition.horizontal, verticalAlignment: logoPosition.vertical))
    }

    @objc public func setLogoPadding(vertical: Int, horizontal: Int) {
        guard let map = mapView?.mapWindow?.map else { return }
        map.logo.setPaddingWith(YMKLogoPadding(horizontalPadding: UInt(horizontal), verticalPadding: UInt(vertical)))
    }

    @objc public func setMapStyle(style: [String: Any]) {
        guard let map = mapView?.mapWindow?.map else { return }
        guard let data = try? JSONSerialization.data(withJSONObject: style, options: []),
              let styleString = String(data: data, encoding: .utf8)
        else {
            print("Failed to serialize style dictionary to JSON")
            return
        }
        map.setMapStyleWithStyle(styleString)
    }

    @objc func setLocale(_ locale: String) {
        YMKMapKit.setLocale(locale)
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
        resolveUIImage(uri: path) { [weak self] image in
            guard let self = self else { return }
            DispatchQueue.main.async {
                self.userLocationImage = image
                self.updateUserIcon()
            }
        }
    }

    @objc public func updateUserIcon() {
        let userIconStyle = YMKIconStyle()
        userIconStyle.scale = userLocationIconScale as NSNumber
        if userLocationImage != nil {
            userLocationListener?.userLocationView?.pin.setIconWith(userLocationImage!, style: userIconStyle)
            userLocationListener?.userLocationView?.arrow.setIconWith(userLocationImage!, style: userIconStyle)
        }
        let circle: YMKCircleMapObject? = userLocationListener?.userLocationView?.accuracyCircle
        if circle == nil {
            circle?.fillColor = UIColor.green
            circle?.strokeColor = UIColor.red
            circle?.strokeWidth = 10.0
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
        map.move(with: YMKCameraPosition(
            target: camera.target,
            zoom: camera.zoom - 0.8,
            azimuth: camera.azimuth,
            tilt: camera.tilt
        ))
    }

    @objc public func getCameraPosition() -> [String: Any]? {
        guard let map = mapView?.mapWindow?.map else { return nil }
        let position = map.cameraPosition
        let result: [String: Any] = [
            "latitude": position.target.latitude,
            "longitude": position.target.longitude,
            "zoom": Double(position.zoom),
            "azimuth": Double(position.azimuth),
            "tilt": Double(position.tilt),
        ]
        return result
    }

    @objc public func move(_ latitude: Double, _ longitude: Double, _ zoom: Float, _ azimuth: Float, _ tilt: Float) {
        guard let m = mapView?.mapWindow?.map else { return }
        m.move(with: YMKCameraPosition(
            target: YMKPoint(latitude: latitude, longitude: longitude),
            zoom: zoom,
            azimuth: azimuth,
            tilt: tilt
        )
        )
    }

    static func isM1Simulator() -> Bool {
        return (TARGET_IPHONE_SIMULATOR & TARGET_CPU_ARM64) != 0
    }

    @objc public func setCenter(
        latitude: Double,
        longitude: Double,
        zoom: Float = 10.0,
        azimuth: Float = 0.0,
        tilt: Float = 0.0,
        duration _: Int = 500
    ) {
        guard let map = mapView?.mapWindow?.map else { return }
        map.move(with: YMKCameraPosition(
            target: YMKPoint(latitude: latitude, longitude: longitude),
            zoom: zoom,
            azimuth: azimuth,
            tilt: tilt
        ))
    }

    @objc func cleanMap() {
        guard let map = mapView?.mapWindow?.map else { return }
        map.mapObjects.clear()
    }

    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc override public func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
        print("10")
        let safeIndex = min(atIndex, subviews.count)
        super.insertReactSubview(subview, at: safeIndex)
        if let markerContainer = subview as? UIView,
           let markerView = markerContainer.value(forKey: "contentView") as? YamapLiteMarker
        {
            let point = YMKPoint(latitude: markerView.point?.lat ?? 0.0, longitude: markerView.point?.lon ?? 0.0)
            let viewPlacemark = mapView.mapWindow.map.mapObjects.addPlacemark()
            viewPlacemark.geometry = point
            markerView.setMapObject(object: viewPlacemark)
        }

        else if let circleContainer = subview as? UIView {
            let cv = circleContainer.value(forKey: "contentView")

            print("CVVV \(cv)")
            if let circleView = circleContainer.value(forKey: "contentView") as? YamapLiteCircle {
                let mapObjects = mapView.mapWindow.map.mapObjects
                let circleObject = mapObjects.addCircle(with: circleView.circle)
                circleView.setMapObject(object: circleObject)
            }
        }
    }
}
