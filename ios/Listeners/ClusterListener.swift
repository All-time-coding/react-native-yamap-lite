import Foundation
import React
import YandexMapsMobile

class ClusterListener: NSObject, YMKClusterListener, YMKClusterTapListener {
    private let callback: RCTDirectEventBlock?
    private weak var delegate: YamapViewComponentDelegate?
    private weak var clusteredView: ClusteredYamapView?

    init(callback: RCTDirectEventBlock?, delegate: YamapViewComponentDelegate?) {
        self.callback = callback
        self.delegate = delegate
        super.init()
    }
    
    func setClusteredView(_ view: ClusteredYamapView) {
        self.clusteredView = view
    }

    func onClusterAdded(with cluster: YMKCluster) {
        if let view = clusteredView {
            let clusterSize = cluster.size
            if let image = view.clusterImage(clusterSize: Int(clusterSize)) {
                cluster.appearance.setIconWith(image)
            }
        }
        cluster.addClusterTapListener(with: self)
    }

    func onClusterTap(with cluster: YMKCluster) -> Bool {
        var lastKnownMarkers: [YMKPoint] = []
        for placemark in cluster.placemarks {
            lastKnownMarkers.append(placemark.geometry)
        }
        clusteredView?.fitMakers(lastKnownMarkers)
        return true
    }
}
