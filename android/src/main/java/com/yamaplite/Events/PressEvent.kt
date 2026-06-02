package com.yamaplite.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event
import com.yandex.mapkit.geometry.Point

class PressEvent(
        surfaceId: Int,
        viewTag: Int,
        private val eventName: String,
        private val point: Point,
) : Event<PressEvent>(surfaceId, viewTag) {

    override fun getEventName(): String = eventName

    override fun getEventData(): WritableMap =
            Arguments.createMap().apply {
                putDouble("lat", point.latitude)
                putDouble("lon", point.longitude)
            }

    override fun getCoalescingKey(): Short = 0
}
