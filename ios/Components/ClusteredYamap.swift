import Foundation
import React
import UIKit
import YandexMapsMobile

@objc(ClusteredYamapView)
public class ClusteredYamapView: YamapView {
  @objc public var clusteredMarkers: [YMKPoint] = []
  @objc public var clusterColor: UIColor = .red
  
  override init(frame: CGRect) {
    super.init(frame: frame)
  }
}
