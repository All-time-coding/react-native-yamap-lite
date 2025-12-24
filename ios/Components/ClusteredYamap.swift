import Foundation
import React
import UIKit
import YandexMapsMobile

@objc(ClusteredYamapView)
public class ClusteredYamapView: YamapView {
  @objc public var placemarks: [YMKPlacemarkMapObject] = []
  @objc public var clusterCollection: YMKClusterizedPlacemarkCollection?
  @objc public var clusterColor: UIColor = .red
  private var clusterListener: ClusterListener?
  
  private let FONT_SIZE: CGFloat = 45
  private let MARGIN_SIZE: CGFloat = 9
  private let STROKE_SIZE: CGFloat = 9

  override init(frame: CGRect) {
    super.init(frame: frame)
    self.clusterListener = ClusterListener(callback: nil, delegate: self.delegate)
    DispatchQueue.main.async { [weak self] in
      guard let self = self else { return }
      self.clusterListener?.setClusteredView(self)
    }
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  private func initImpl() {
    runOnMainThread {
      self.initMapView()
      self.initializeClusterCollection()
    }
  }
  
  private func initializeClusterCollection() {
    guard let map = mapView?.mapWindow?.map else {
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
        self?.initializeClusterCollection()
      }
      return
    }
    
    if clusterListener == nil {
      clusterListener = ClusterListener(callback: nil, delegate: self.delegate)
    }
    clusterListener?.setClusteredView(self)
    clusterCollection = map.mapObjects.addClusterizedPlacemarkCollection(with: clusterListener!)
  }
  
  private func initMapView() {
    mapView = YMKMapView(frame: bounds, vulkanPreferred: YamapView.isM1Simulator())
    mapView.mapWindow.map.mapType = .map
    applyProperties()
    insertSubview(mapView, at: 0)
  }
  
  @objc override public func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
  let isMarker = !(subview is YMKMapView) && 
                 subview.responds(to: Selector(("contentView"))) &&
                 (subview.value(forKey: "contentView") as? YamapLiteMarker) != nil
  
  let isCircle = !(subview is YMKMapView) &&
                 subview.responds(to: Selector(("contentView"))) &&
                 (subview.value(forKey: "contentView") as? YamapLiteCircle) != nil
  
  if isMarker {
    let safeIndex = min(atIndex, subviews.count)
    insertSubview(subview, at: safeIndex)
    
    
    if let markerView = subview.value(forKey: "contentView") as? YamapLiteMarker {
      
      if atIndex < placemarks.count {
        markerView.setClusterMapObject(placemarks[atIndex])
      }
    }
  } else if isCircle {
    let safeIndex = min(atIndex, subviews.count)
    super.insertReactSubview(subview, at: safeIndex)
  } else {
    let safeIndex = min(atIndex, subviews.count)
    super.insertReactSubview(subview, at: safeIndex)
  }
}
  
  
  @objc public func setupClusteredMarkers(markers: [YMKPoint]?) {
  guard let unwrappedMarkers = markers else { return }
  placemarks.removeAll()
  
  
  guard let map = mapView?.mapWindow?.map else {
    print("ERROR: mapView.mapWindow.map is nil, cannot setup clustered markers")
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
      self?.setupClusteredMarkers(markers: unwrappedMarkers)
    }
    return
  }
  
  if clusterCollection == nil {
    if clusterListener == nil {
      clusterListener = ClusterListener(callback: nil, delegate: self.delegate)
    }
    clusterListener?.setClusteredView(self)
    clusterCollection = map.mapObjects.addClusterizedPlacemarkCollection(with: clusterListener!)
  }
  
  guard let collection = clusterCollection else {
    print("ERROR: clusterCollection is nil after initialization attempt")
    return
  }
  
  collection.clear()
  
  
  let newPlacemarks: [YMKPlacemarkMapObject] = collection.addEmptyPlacemarks(with: unwrappedMarkers)
  placemarks.append(contentsOf: newPlacemarks)
  
  
  let markerSubviews = subviews.filter { subview in
    !(subview is YMKMapView) && 
    subview.responds(to: Selector(("contentView")))
  }
  
  
  for i in 0..<min(placemarks.count, markerSubviews.count) {
    let subview = markerSubviews[i]
    if let markerView = subview.value(forKey: "contentView") as? YamapLiteMarker {
      markerView.setClusterMapObject(placemarks[i])
    }
  }
  
  
  collection.clusterPlacemarks(withClusterRadius: 50, minZoom: 12)
}
  
  @objc public func clusterImage(clusterSize: Int) -> UIImage? {
    let text = NSString(string: String(clusterSize))
    let font: UIFont = UIFont.systemFont(ofSize: FONT_SIZE)
    let attributes: [NSAttributedString.Key: Any] = [.font: font]
    let size = text.size(withAttributes: attributes)
    
    let textRadius = sqrt(size.height * size.height + size.width * size.width) / 2
    let internalRadius = textRadius + MARGIN_SIZE
    let externalRadius = internalRadius + STROKE_SIZE
    let imageSize = CGSize(width: externalRadius * 2, height: externalRadius * 2)
    
    
    let renderer = UIGraphicsImageRenderer(size: imageSize)
    
    return renderer.image { context in
      let cgContext = context.cgContext
      
      
      cgContext.setFillColor(clusterColor.cgColor)
      cgContext.fillEllipse(in: CGRect(x: 0, y: 0, width: externalRadius * 2, height: externalRadius * 2))
      
      
      cgContext.setFillColor(UIColor.white.cgColor)
      cgContext.fillEllipse(in: CGRect(x: STROKE_SIZE, y: STROKE_SIZE, width: internalRadius * 2, height: internalRadius * 2))
      
      
      let textRect = CGRect(
        x: externalRadius - size.width / 2,
        y: externalRadius - size.height / 2,
        width: size.width,
        height: size.height
      )
      text.draw(in: textRect, withAttributes: [
        .font: font,
        .foregroundColor: UIColor.black
      ])
    }
  }
}
