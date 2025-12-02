package com.yamaplite.components

import android.content.Context
import android.graphics.Color
import android.view.ViewGroup
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.yandex.mapkit.geometry.Circle
import com.yandex.mapkit.geometry.Point
import com.yandex.mapkit.map.CircleMapObject
import com.yandex.mapkit.map.MapObject
import com.yandex.mapkit.map.MapObjectTapListener
import com.yandex.mapkit.mapview.MapView
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event

class YamapCircle(context: Context?) : ViewGroup(context), MapObjectTapListener {
  var circle: Circle

  var rnMapObject: MapObject? = null
  private var mapView: MapView? = null
  private var handled = true
  private var fillColor = Color.BLACK
  private var strokeColor = Color.BLACK
  private var zInd = 1
  private var strokeWidth = 1f
  private var center = Point(0.0, 0.0)
  private var radius = 0f

  init {
    circle = Circle(center, radius)
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
  }

  // PROPS
  fun setCenter(point: Point) {
    center = point
    updateGeometry()
    if (rnMapObject == null && mapView != null && radius > 0) {
      addToMap(mapView!!)
    } else {
      updateCircle()
    }
  }

  fun setRadius(_radius: Float) {
    radius = _radius
    updateGeometry()
    if (rnMapObject == null && mapView != null && radius > 0 && (center.latitude != 0.0 || center.longitude != 0.0)) {
      addToMap(mapView!!)
    } else {
      updateCircle()
    }
  }

  private fun updateGeometry() {
    circle = Circle(center, radius)
  }

  fun setZInd(_zInd: Int) {
    zInd = _zInd
    updateCircle()
  }

  fun setHandled(_handled: Boolean) {
    handled = _handled
  }

  fun setStrokeColor(_color: Int) {
    strokeColor = _color
    updateCircle()
  }

  fun setFillColor(_color: Int) {
    fillColor = _color
    updateCircle()
  }

  fun setStrokeWidth(width: Float) {
    strokeWidth = width
    updateCircle()
  }

  private fun updateCircle() {
    if (rnMapObject != null) {
      (rnMapObject as CircleMapObject).geometry = circle
      (rnMapObject as CircleMapObject).strokeWidth = strokeWidth
      (rnMapObject as CircleMapObject).strokeColor = strokeColor
      (rnMapObject as CircleMapObject).fillColor = fillColor
      (rnMapObject as CircleMapObject).zIndex = zInd.toFloat()
    }
  }

  fun setCircleMapObject(obj: MapObject?) {
    rnMapObject = obj as CircleMapObject?
    rnMapObject!!.addTapListener(this)
    updateCircle()
  }

  fun addToMap(mapView: MapView) {
    this.mapView = mapView
    updateGeometry()
    val circleObject = mapView.getMapWindow().map.mapObjects.addCircle(circle)
    rnMapObject = circleObject
    circleObject.addTapListener(this)
    updateCircle()
  }

  fun removeFromMap(mapView: MapView) {
    rnMapObject?.let {
      mapView.getMapWindow().map.mapObjects.remove(it)
      rnMapObject = null
    }
  }

  override fun onMapObjectTap(mapObject: MapObject, point: Point): Boolean {
    val reactContext = context as? ReactContext
    if (reactContext == null) {
      return false
    }
    
    val viewId = getId()
    val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, viewId)
    
    if (eventDispatcher != null) {
      val eventData = Arguments.createMap().apply {
        putDouble("lat", point.latitude)
        putDouble("lon", point.longitude)
      }
      val event = PressEvent(viewId, eventData)
      eventDispatcher.dispatchEvent(event as Event<*>)
    }
      return true
  }

  private class PressEvent(viewTag: Int, private val eventData: WritableMap?) : Event<PressEvent>(viewTag) {
    override fun getEventName(): String {
      return "onCirclePress"
    }
    override fun getEventData(): WritableMap? {
      return eventData
    }
    override fun getCoalescingKey(): Short {
      return 0
    }
  }
}