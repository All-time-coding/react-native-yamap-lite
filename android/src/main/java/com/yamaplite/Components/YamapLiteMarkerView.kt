package com.yamaplite.components

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.PointF
import android.view.View
import com.yandex.mapkit.geometry.Point
import com.yandex.mapkit.map.PlacemarkMapObject
import com.yandex.mapkit.mapview.MapView
import com.yandex.runtime.image.ImageProvider
import com.yandex.mapkit.map.IconStyle
import com.yandex.mapkit.map.RotationType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import com.yandex.mapkit.map.MapObjectTapListener
import com.yandex.mapkit.map.MapObject
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.EventDispatcher
import com.facebook.react.uimanager.events.Event
import com.yamaplite.utils.ResolveImageHelper

class YamapLiteMarkerView(context: Context) : View(context), MapObjectTapListener {
  var latitude: Double = 0.0
  var longitude: Double = 0.0
  private var iconSource: String? = null
  private var iconBitmap: Bitmap? = null
  var markerScale: Double = 1.0
  var zInd: Float = 0f
  var isVisibleFlag: Boolean = true
  var anchorX: Double = 0.5
  var anchorY: Double = 0.5
  private var _rotated: Boolean = false
  private var _handled: Boolean = false
  private var _size: Int = 25
  private var _childView: View? = null

  var placemark: PlacemarkMapObject? = null
  private val coroutineScope = CoroutineScope(Dispatchers.Main)
  private val inProgressRequests = mutableMapOf<String, MutableList<PlacemarkMapObject>>()

  private val childLayoutListener =
  OnLayoutChangeListener { _, _, _, _, _, _, _, _, _ -> applyStyle() }

  fun setMarkerMapObject(obj: PlacemarkMapObject?) {
    placemark = obj
    placemark?.userData = this
    placemark?.addTapListener(this)
    applyStyle()
  }

  fun addToMap(mapView: MapView) {
    if (placemark != null) {
      placemark?.addTapListener(this)
    }
    val point = Point(latitude, longitude)
    placemark = mapView.mapWindow.map.mapObjects.addPlacemark(point)
    placemark?.userData = this
    placemark?.addTapListener(this)
    applyStyle()
  }

  fun removeFromMap(mapView: MapView) {
    placemark?.let {
      mapView.mapWindow.map.mapObjects.remove(it)
      placemark = null
    }
  }

  fun setPoint(lat: Double, lon: Double) {
    latitude = lat
    longitude = lon
    placemark?.geometry = Point(lat, lon)
  }

  fun setIconSource(name: String?) {
    iconSource = name
    applyStyle()
  }

  fun setScale(value: Double) {
    markerScale = value
    applyStyle()
  }

  fun setZInd(value: Int) {
    zInd = value.toFloat()
    applyStyle()
  }

  fun setVisible(value: Boolean) {
    isVisibleFlag = value
    placemark?.isVisible = value
  }

  fun setAnchor(x: Double, y: Double) {
    anchorX = x
    anchorY = y
    applyStyle()
  }

  fun setRotated(value: Boolean) {
    _rotated = value
    applyStyle()
  }

  fun setHandled(value: Boolean) {
    _handled = value
  }
  
  fun getRotated(): Boolean = _rotated
  
  fun getHandled(): Boolean = _handled

  fun setSize(value: Int) {
    _size = value
    applyStyle()
  }

  fun setChildView(view: View?) {
    if (view == null) {
        _childView!!.removeOnLayoutChangeListener(childLayoutListener)
        _childView = null
        applyStyle()
        return
    }
    _childView = view
    _childView!!.addOnLayoutChangeListener(childLayoutListener)
  }

  private fun applyStyle() {
    if (placemark != null && placemark!!.isValid) {
      val iconStyle = IconStyle()
      iconStyle.setScale(markerScale.toFloat())
      iconStyle.setRotationType(if (_rotated) RotationType.ROTATE else RotationType.NO_ROTATION)
      iconStyle.setVisible(isVisibleFlag)
      iconStyle.setAnchor(PointF(anchorX.toFloat(), anchorY.toFloat()))
      (placemark as PlacemarkMapObject).geometry = Point(latitude, longitude)
      (placemark as PlacemarkMapObject).zIndex = zInd.toFloat()
      (placemark as PlacemarkMapObject).setIconStyle(iconStyle)

      if (_childView != null) {
        try {
          val b = Bitmap.createBitmap(
            _childView!!.width, _childView!!.height, Bitmap.Config.ARGB_8888
          )
          val c = Canvas(b)
          _childView!!.draw(c)
          val resizedBitmap = ResolveImageHelper.getInstance().resizeBitmap(context, b, _size)
          (placemark as PlacemarkMapObject).setIcon(ImageProvider.fromBitmap(resizedBitmap))
          (placemark as PlacemarkMapObject).setIconStyle(iconStyle)
        } catch (e: Exception) {
          e.printStackTrace()
        }
      }
      if (_childView == null && iconSource?.isNotEmpty() == true) {
        val currentIconStyle = iconStyle
        coroutineScope.launch {
          val icon = ResolveImageHelper.getInstance().resolveImage(context, iconSource!!, _size)
          icon?.let {
            placemark?.let { pm ->
              if (pm.isValid) {
                pm.setIcon(it)
                currentIconStyle.let { pm.setIconStyle(it) }
              }
            }
          }
        }
      }
    }
  }

  override fun onMapObjectTap(p0: MapObject, p1: Point): Boolean {
    val reactContext = context as? ReactContext
    if (reactContext == null) {
      return _handled
    }
    
    val viewId = getId()
    val surfaceId = UIManagerHelper.getSurfaceId(reactContext)
    val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, viewId)
    
    if (eventDispatcher != null) {
      val eventData = Arguments.createMap().apply {
        putDouble("lat", p1.latitude)
        putDouble("lon", p1.longitude)
      }
      val event = PressEvent(surfaceId, viewId, eventData)
      eventDispatcher.dispatchEvent(event)
    }
    return _handled
  }
  
  private class PressEvent(surfaceId: Int, viewTag: Int, private val eventData: WritableMap?) : Event<PressEvent>(surfaceId, viewTag) {
    override fun getEventName(): String {
      return "onMarkerPress"
    }
    override fun getEventData(): WritableMap? {
      return eventData
    }
    override fun getCoalescingKey(): Short {
      return 0
    }
  }
}