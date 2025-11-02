import Foundation
import React
import YandexMapsMobile

class CameraListener: NSObject, YMKMapCameraListener {
    private let callback: RCTDirectEventBlock?
    private weak var delegate: YamapViewComponentDelegate?

    init(callback: RCTDirectEventBlock?, delegate: YamapViewComponentDelegate?) {
        self.callback = callback
        self.delegate = delegate
        super.init()
    }

    func onCameraPositionChanged(with _: YMKMap,
                                 cameraPosition: YMKCameraPosition,
                                 cameraUpdateReason : YMKCameraUpdateReason,
                                 finished: Bool)
    {
        let target = cameraPosition.target
        let reasonString: String
        switch cameraUpdateReason {
        case .gestures:
            reasonString = "GESTURES"
        case .application:
            reasonString = "APPLICATION"
        @unknown default:
            reasonString = "GESTURES"
        }
        let params: [String: Any] = [
            "lat": target.latitude,
            "lon": target.longitude,
            "zoom": Double(cameraPosition.zoom),
            "azimuth": Double(cameraPosition.azimuth),
            "tilt": Double(cameraPosition.tilt),
            "finished": finished,
            "target": 0.0,
            "reason": reasonString
        ]

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            if let callback = self.callback {
                callback(params)
                return
            } else if let delegate = self.delegate {
                delegate.handleOnCameraPositionChange(coords: params)
                if finished {
                    delegate.handleOnCameraPositionChangeEnd(coords: params)
                }
            }
        }
    }
}
