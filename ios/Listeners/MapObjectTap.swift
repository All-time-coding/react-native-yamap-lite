import Foundation
import YandexMapsMobile

@objc class MarkerTapListener: NSObject, YMKMapObjectTapListener {
    func onMapObjectTap(with mapObject: YMKMapObject, point: YMKPoint) -> Bool {
        if let handler = mapObject.userData as? MapObjectTapHandler {
            handler.onMapObjectTap(point: point)
            return handler.handled
        }
        return false
    }
}
