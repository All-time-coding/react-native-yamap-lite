import Foundation
import React
import YandexMapsMobile

class MapInputListener: NSObject, YMKMapInputListener {
    private weak var delegate: YamapViewComponentDelegate?
    
    init(delegate: YamapViewComponentDelegate?) {
        self.delegate = delegate
        super.init()
    }
    
    func onMapTap(with map: YMKMap, point: YMKPoint) {
        let coords: [String: Any] = [
            "lat": point.latitude,
            "lon": point.longitude
        ]
        
        DispatchQueue.main.async { [weak self] in
            self?.delegate?.handleOnMapPress(coords: coords)
        }
    }
    
    func onMapLongTap(with map: YMKMap, point: YMKPoint) {
        let coords: [String: Any] = [
            "lat": point.latitude,
            "lon": point.longitude
        ]
        
        DispatchQueue.main.async { [weak self] in
            self?.delegate?.handleOnMapLongPress(coords: coords)
        }
    }
}

