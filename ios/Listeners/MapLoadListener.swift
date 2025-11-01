import Foundation
import React
import YandexMapsMobile

class MapLoadListener: NSObject, YMKMapLoadedListener {
    private var callback: RCTDirectEventBlock?
    private weak var mapDelegate: YamapViewComponentDelegate?
    init(callback: RCTDirectEventBlock?, mapDelegate: YamapViewComponentDelegate?) {
        self.callback = callback
        self.mapDelegate = mapDelegate
        super.init()
    }

    func onMapLoaded(with statistics: YMKMapLoadStatistics) {
        let params: [String: Any] = [
            "renderObjectCount": statistics.renderObjectCount,
            "curZoomModelsLoaded": statistics.curZoomModelsLoaded,
            "curZoomPlacemarksLoaded": statistics.curZoomPlacemarksLoaded,
            "curZoomLabelsLoaded": statistics.curZoomLabelsLoaded,
            "curZoomGeometryLoaded": statistics.curZoomGeometryLoaded,
            "tileMemoryUsage": statistics.tileMemoryUsage,
            "delayedGeometryLoaded": statistics.delayedGeometryLoaded,
            "fullyAppeared": statistics.fullyAppeared,
            "fullyLoaded": statistics.fullyLoaded,
        ]

        DispatchQueue.main.async { [weak self] in
            if let callback = self?.callback {
                callback(params)
            } else if let delegate = self?.mapDelegate {
                delegate.handleOnMapLoaded(result: params)
            }
        }
    }
}
