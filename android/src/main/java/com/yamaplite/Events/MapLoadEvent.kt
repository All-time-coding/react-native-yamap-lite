package com.yamaplite.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event
import com.yandex.mapkit.map.MapLoadStatistics

class MapLoadEvent(
        surfaceId: Int,
        viewTag: Int,
        private val statistics: MapLoadStatistics,
) : Event<MapLoadEvent>(surfaceId, viewTag) {

    override fun getEventName(): String = EVENT_NAME

    override fun getEventData(): WritableMap =
            Arguments.createMap().apply {
                putInt("renderObjectCount", statistics.renderObjectCount)
                putDouble("curZoomModelsLoaded", statistics.curZoomModelsLoaded.toDouble())
                putDouble("curZoomPlacemarksLoaded", statistics.curZoomPlacemarksLoaded.toDouble())
                putDouble("curZoomLabelsLoaded", statistics.curZoomLabelsLoaded.toDouble())
                putDouble("curZoomGeometryLoaded", statistics.curZoomGeometryLoaded.toDouble())
                putDouble("tileMemoryUsage", statistics.tileMemoryUsage.toDouble())
                putDouble("delayedGeometryLoaded", statistics.delayedGeometryLoaded.toDouble())
                putDouble("fullyAppeared", statistics.fullyAppeared.toDouble())
                putDouble("fullyLoaded", statistics.fullyLoaded.toDouble())
            }

    override fun getCoalescingKey(): Short = 0

    companion object {
        const val EVENT_NAME = "onMapLoaded"
    }
}
