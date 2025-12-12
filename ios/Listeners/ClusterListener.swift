import Foundation
import React
import YandexMapsMobile

class ClusterListener: NSObject, YMKClusterListener, YMKClusterTapListener {
    private let callback: RCTDirectEventBlock?
    private weak var delegate: YamapViewComponentDelegate?

    init(callback: RCTDirectEventBlock?, delegate: YamapViewComponentDelegate?) {
        self.callback = callback
        self.delegate = delegate
        super.init()    
    }

    func onClusterAdded(with cluster: YMKCluster) {
    }

    func onClusterTap(with cluster: YMKCluster) -> Bool {
        return true
    }
}