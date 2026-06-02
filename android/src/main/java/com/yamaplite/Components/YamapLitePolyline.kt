package com.yamaplite.components

import android.content.Context
import android.graphics.Color
import android.view.ViewGroup
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.yamaplite.events.PressEvent
import com.yandex.mapkit.geometry.Point
import com.yandex.mapkit.geometry.Polyline
import com.yandex.mapkit.map.MapObject
import com.yandex.mapkit.map.MapObjectTapListener
import com.yandex.mapkit.map.PolylineMapObject
import com.yandex.mapkit.mapview.MapView

class YamapPolyline(context: Context?) : ViewGroup(context), MapObjectTapListener {
    var polyline: Polyline

    var rnMapObject: MapObject? = null

    private var mapView: MapView? = null

    private var strokeColor = Color.BLACK

    private var strokeWidth = 1f

    private var outlineColor = Color.BLACK

    private var zIndex = 1f

    private var dashLength = 1f

    private var gapLength = 0f

    private var outlineWidth = 0f

    private var dashOffset = 0f

    private var points: ArrayList<Point> = ArrayList()

    private var handled = true

    init {
        polyline = Polyline(points)
    }

    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {}

    fun setStrokeColor(_color: Int) {
        strokeColor = _color
        updatePolyline()
    }

    fun setStrokeWidth(_width: Float) {
        strokeWidth = _width
        updatePolyline()
    }

    fun setOutlineColor(_color: Int) {
        outlineColor = _color
        updatePolyline()
    }

    fun setZIndex(_zIndex: Float) {
        zIndex = _zIndex
        updatePolyline()
    }

    fun setDashLength(_dashLength: Float) {
        dashLength = _dashLength
        updatePolyline()
    }

    fun setGapLength(_gapLength: Float) {
        gapLength = _gapLength
        updatePolyline()
    }

    fun setOutlineWidth(_outlineWidth: Float) {
        outlineWidth = _outlineWidth
        updatePolyline()
    }

    fun setDashOffset(_dashOffset: Float) {
        dashOffset = _dashOffset
        updatePolyline()
    }

    fun setPoints(_points: ArrayList<Point>) {
        points = _points
        updateGeometry()
        if (rnMapObject == null && mapView != null && isGeometryValid()) {
            addToMap(mapView!!)
        } else {
            updatePolyline()
        }
    }

    private fun isGeometryValid(): Boolean =
            points.size >= 2 && points.all { it.latitude.isFinite() && it.longitude.isFinite() }

    fun setHandled(_handled: Boolean) {
        handled = _handled
    }

    private fun updatePolyline() {
        if (rnMapObject != null) {
            val polylineMapObject = rnMapObject as PolylineMapObject
            polylineMapObject.geometry = polyline
            polylineMapObject.zIndex = zIndex
            polylineMapObject.setStrokeColor(strokeColor)
            polylineMapObject.strokeWidth = strokeWidth
            polylineMapObject.dashLength = dashLength
            polylineMapObject.gapLength = gapLength
            polylineMapObject.dashOffset = dashOffset
            polylineMapObject.outlineWidth = outlineWidth
            if (outlineWidth > 0) {
                polylineMapObject.outlineColor = outlineColor
            }
        }
    }

    private fun updateGeometry() {
        if (isGeometryValid()) {
            polyline = Polyline(points)
        }
    }

    fun setMapObject(obj: MapObject) {
        if (obj is PolylineMapObject) {
            rnMapObject = obj
            rnMapObject!!.addTapListener(this)
            updatePolyline()
        }
    }

    override fun onMapObjectTap(mapObject: MapObject, point: Point): Boolean {
        val reactContext = context as? ReactContext
        if (reactContext == null) {
            return false
        }
        val viewId = getId()
        val surfaceId = UIManagerHelper.getSurfaceId(reactContext)
        val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, viewId)
        if (eventDispatcher != null) {
            val event = PressEvent(surfaceId, viewId, "onPolylinePress", point)
            eventDispatcher.dispatchEvent(event)
        }
        return handled
    }

    fun addToMap(mapView: MapView) {
        this.mapView = mapView
        if (!isGeometryValid()) {
            return
        }
        val polylineObject = mapView.mapWindow.map.mapObjects.addPolyline(polyline)
        rnMapObject = polylineObject
        polylineObject.addTapListener(this)
        updatePolyline()
    }

    fun removeFromMap(mapView: MapView) {
        rnMapObject?.let {
            if (it.isValid) {
                mapView.mapWindow.map.mapObjects.remove(it)
            }
        }
        rnMapObject = null
    }
}
