package com.yamaplite.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event
import com.yandex.mapkit.map.CameraPosition
import com.yandex.mapkit.map.CameraUpdateReason

class CameraPositionChangeEvent(
        surfaceId: Int,
        viewTag: Int,
        private val eventName: String,
        private val cameraPosition: CameraPosition,
        private val reason: CameraUpdateReason,
        private val finished: Boolean,
) : Event<CameraPositionChangeEvent>(surfaceId, viewTag) {

    override fun getEventName(): String = eventName

    override fun getEventData(): WritableMap =
            Arguments.createMap().apply {
                putMap(
                        "point",
                        Arguments.createMap().apply {
                            putDouble("lat", cameraPosition.target.latitude)
                            putDouble("lon", cameraPosition.target.longitude)
                        },
                )
                putDouble("zoom", cameraPosition.zoom.toDouble())
                putDouble("azimuth", cameraPosition.azimuth.toDouble())
                putDouble("tilt", cameraPosition.tilt.toDouble())
                putBoolean("finished", finished)
                putDouble("target", 0.0)
                putString("reason", reason.toString())
            }

    override fun getCoalescingKey(): Short = 0
}
