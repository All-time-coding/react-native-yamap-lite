package com.yamaplite.components

import android.content.Context
import android.graphics.Color
import android.view.ViewGroup
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.yamaplite.events.PressEvent
import com.yandex.mapkit.geometry.LinearRing
import com.yandex.mapkit.geometry.Point
import com.yandex.mapkit.geometry.Polygon
import com.yandex.mapkit.map.MapObject
import com.yandex.mapkit.map.MapObjectTapListener
import com.yandex.mapkit.map.PolygonMapObject
import com.yandex.mapkit.mapview.MapView

class YamapPolygon(context: Context?) : ViewGroup(context), MapObjectTapListener {
    var polygon = Polygon()

    var rnMapObject: MapObject? = null

    private var mapView: MapView? = null

    private var fillColor = Color.BLACK

    private var strokeColor = Color.BLACK

    private var strokeWidth = 1f

    private var zIndex = 1f

    private var points: ArrayList<Point> = ArrayList()

    private var innerRings: ArrayList<ArrayList<Point>>? = ArrayList()

    private var handled = true

    init {
        polygon = Polygon(LinearRing(points), emptyList())
    }

    fun setFillColor(_color: Int) {
        fillColor = _color
        updatePolygon()
    }

    fun setStrokeColor(_color: Int) {
        strokeColor = _color
        updatePolygon()
    }

    fun setStrokeWidth(_width: Float) {
        strokeWidth = _width
        updatePolygon()
    }

    fun setZIndex(_zIndex: Float) {
        zIndex = _zIndex
        updatePolygon()
    }

    fun setPoints(_points: ArrayList<Point>) {
        points = _points
        updateGeometry()
        if (rnMapObject == null && mapView != null && isGeometryValid()) {
            addToMap(mapView!!)
        } else {
            updatePolygon()
        }
    }

    fun setInnerRings(_innerRings: ArrayList<ArrayList<Point>>) {
        innerRings = _innerRings
        updateGeometry()
        updatePolygon()
    }

    private fun List<Point>.isValidRing(): Boolean =
            size >= 3 && all { it.latitude.isFinite() && it.longitude.isFinite() }

    private fun isGeometryValid(): Boolean = points.isValidRing()

    fun setHandled(_handled: Boolean) {
        handled = _handled
    }

    override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {}

    private fun updatePolygon() {
        if (rnMapObject != null) {
            val polygonMapObject = rnMapObject as PolygonMapObject
            polygonMapObject.geometry = polygon
            polygonMapObject.zIndex = zIndex
            polygonMapObject.fillColor = fillColor
            polygonMapObject.strokeColor = strokeColor
            polygonMapObject.strokeWidth = strokeWidth
        }
    }
    private fun updateGeometry() {
        if (!isGeometryValid()) return
        val ring = LinearRing(points)
        val unwrappedInnerRings =
                (innerRings ?: ArrayList()).filter { it.isValidRing() }.map { LinearRing(it) }
        polygon = Polygon(ring, unwrappedInnerRings)
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
            val event = PressEvent(surfaceId, viewId, "onPolygonPress", point)
            eventDispatcher.dispatchEvent(event)
        }
        return handled
    }

    fun setMapObject(obj: MapObject) {
        if (obj is PolygonMapObject) {
            rnMapObject = obj
            rnMapObject!!.addTapListener(this)
            updatePolygon()
        }
    }

    fun addToMap(mapView: MapView) {
        this.mapView = mapView
        if (!isGeometryValid()) {
            return
        }
        val polygonObject = mapView.mapWindow.map.mapObjects.addPolygon(polygon)
        rnMapObject = polygonObject
        polygonObject.addTapListener(this)
        updatePolygon()
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
