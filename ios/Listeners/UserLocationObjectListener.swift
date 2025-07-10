import Foundation
import React
import YandexMapsMobile

@objc(UserLocationObjectListener)
class UserLocationObjectListener: NSObject, YMKUserLocationObjectListener {
    var userLocationView: YMKUserLocationView?

    var cb: (() -> Void)?

    init(callback: @escaping () -> Void) {
        cb = callback
        super.init()
    }

    func onObjectAdded(with view: YMKUserLocationView) {
        userLocationView = view
        cb?()
    }

    func onObjectRemoved(with _: YMKUserLocationView) {
        //
    }

    func onObjectUpdated(with view: YMKUserLocationView, event _: YMKObjectEvent) {
        userLocationView = view
        cb?()
    }
}
