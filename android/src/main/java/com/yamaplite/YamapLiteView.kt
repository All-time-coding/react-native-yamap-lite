package com.yamaplite

import android.content.Context
import android.graphics.Color
import android.util.Log
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTModernEventEmitter
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.yandex.mapkit.Animation
import com.yandex.mapkit.MapKitFactory
import com.yandex.mapkit.geometry.Point
import com.yandex.mapkit.geometry.BoundingBox
import com.yandex.mapkit.geometry.Geometry
import com.yandex.mapkit.mapview.MapView
import com.yandex.mapkit.user_location.UserLocationLayer
import com.yandex.runtime.image.ImageProvider
import android.view.View
import android.os.Looper
import android.os.Handler
import com.yandex.mapkit.map.MapLoadedListener
import com.yandex.mapkit.map.MapLoadStatistics
import com.yandex.mapkit.map.CameraListener
import com.yandex.mapkit.map.CameraPosition
import com.yandex.mapkit.map.Map as YMap
import com.yandex.mapkit.map.CameraUpdateReason

class YamapLiteView(context: Context) : FrameLayout(context), MapLoadedListener, CameraListener {
  private val mapView: MapView = MapView(context)
  private val reactChildren = mutableListOf<View>()

  private var userLocationLayer: UserLocationLayer? = null
  private var isUserLocationEnabled = false
  private var isNightMode = false
  private var mapStyle: String? = null
  private var userLocationIcon: String? = null
  private var userLocationIconScale = 1.0f
  private var userLocationAccuracyFillColor: String? = null
  private var userLocationAccuracyStrokeColor: String? = null
  private var userLocationAccuracyStrokeWidth = 2.0f
  private var scrollGesturesEnabled = true
  private var zoomGesturesEnabled = true
  private var tiltGesturesEnabled = true
  private var rotateGesturesEnabled = true
  private var fastTapEnabled = true
  private var maxFps = 60.0f
  private var mapType: String = "map"
  private var followUser = false
  private var logoPosition: Map<String, Any>? = null
  private var logoPadding: Map<String, Any>? = null
  
  init {
    setupMap()
    mapView.mapWindow.map.setMapLoadedListener(this)
    mapView.mapWindow.map.addCameraListener(this)
  }
  
  private fun setupMap() {
    addView(
      mapView,
      LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    )
  }
  
  private fun setupUserLocation() {

  }
  
  private fun setupLogo() {

  }
  
  private fun addMapListeners() {

  }
  
  fun setUserLocationIcon(icon: String?) {

  }
  
  fun setUserLocationIconScale(scale: Float) {

  }
  
  fun setShowUserPosition(show: Boolean) {

  }
  
  fun setNightMode(nightMode: Boolean) {

  }
  
  fun setMapStyle(style: String?) {

  }
  
  fun setUserLocationAccuracyFillColor(color: String?) {

  }
  
  fun setUserLocationAccuracyStrokeColor(color: String?) {

  }
  
  fun setUserLocationAccuracyStrokeWidth(width: Float) {

  }
  
  fun setScrollGesturesEnabled(enabled: Boolean) {

  }
  
  fun setZoomGesturesEnabled(enabled: Boolean) {

  }
  
  fun setTiltGesturesEnabled(enabled: Boolean) {

  }
  
  fun setRotateGesturesEnabled(enabled: Boolean) {

  }
  
  fun setFastTapEnabled(enabled: Boolean) {

  }
  
  fun setInitialRegion(region: Map<String, Any>?) {
    if (region == null) return
    val latitude = region["latitude"] as? Double ?: return
    val longitude = region["longitude"] as? Double ?: return
    val zoom = (region["zoom"] as? Double ?: 10.0).toFloat()
    val azimuth = (region["azimuth"] as? Double ?: 0.0).toFloat()
    val tilt = (region["tilt"] as? Double ?: 0.0).toFloat()
    
    val point = Point(latitude, longitude)
    val cameraPosition = CameraPosition(point, zoom, azimuth, tilt)
    mapView.getMapWindow().map.move(cameraPosition)
  }
  
  fun setMaxFps(fps: Float) {
  }
  
  fun setMapType(type: String?) {
  }
  
  fun setFollowUser(follow: Boolean) {
  }
  
  fun setLogoPosition(position: Map<String, Any>?) {
  }
  
  fun setLogoPadding(padding: Map<String, Any>?) {
  }
  
  fun getCameraPosition(): WritableMap? {
    try {
      val map = mapView.mapWindow.map
      val cameraPosition = map.cameraPosition
      val result = Arguments.createMap()
      result.putDouble("latitude", cameraPosition.target.latitude)
      result.putDouble("longitude", cameraPosition.target.longitude)
      result.putDouble("zoom", cameraPosition.zoom.toDouble())
      result.putDouble("azimuth", cameraPosition.azimuth.toDouble())
      result.putDouble("tilt", cameraPosition.tilt.toDouble())
      return result
    } catch (e: Exception) {
      Log.e("YamapLiteView", "Failed to get camera position", e)
      return null
    }
  }
  
  private fun calculateBoundingBox(points: ArrayList<Point?>): BoundingBox {
      var minLat = Double.MAX_VALUE
      var maxLat = -Double.MAX_VALUE
      var minLon = Double.MAX_VALUE
      var maxLon = -Double.MAX_VALUE
      
      for (point in points) {
          if (point != null) {
              minLat = minOf(minLat, point.latitude)
              maxLat = maxOf(maxLat, point.latitude)
              minLon = minOf(minLon, point.longitude)
              maxLon = maxOf(maxLon, point.longitude)
          }
      }
      
      return BoundingBox(Point(minLat, minLon), Point(maxLat, maxLon))
  }

  fun addReactChild(child: View, index: Int) {
    if (index < 0 || index > reactChildren.size) {
      reactChildren.add(child)
    } else {
      reactChildren.add(index, child)
    }
    if (child is YamapLiteMarkerView) {
      child.addToMap(mapView)
    }
  }

  fun removeReactChildAt(index: Int) {
    if (index < 0 || index >= reactChildren.size) return
    val child = reactChildren.removeAt(index)
    if (child is YamapLiteMarkerView) {
      child.removeFromMap(mapView)
    }
  }

  fun getReactChildAt(index: Int): View {
    return reactChildren[index]
  }

  fun getReactChildCount(): Int {
    return reactChildren.size
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    try {
      MapKitFactory.getInstance().onStart()
    } catch (e: Exception) {
      e.printStackTrace()
    }
    mapView.onStart()
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    mapView.onStop()
    try {
      MapKitFactory.getInstance().onStop()
    } catch (e: Exception) {
      e.printStackTrace()
    }
  }

  override fun onMapLoaded(statistics: MapLoadStatistics) {
    val reactContext = context as? ReactContext
    if (reactContext == null) {
      return
    }
    
    val data = Arguments.createMap()
    data.putInt("renderObjectCount", statistics.renderObjectCount)
    data.putDouble("curZoomModelsLoaded", statistics.curZoomModelsLoaded.toDouble())
    data.putDouble("curZoomPlacemarksLoaded", statistics.curZoomPlacemarksLoaded.toDouble())
    data.putDouble("curZoomLabelsLoaded", statistics.curZoomLabelsLoaded.toDouble())
    data.putDouble("curZoomGeometryLoaded", statistics.curZoomGeometryLoaded.toDouble())
    data.putDouble("tileMemoryUsage", statistics.tileMemoryUsage.toDouble())
    data.putDouble("delayedGeometryLoaded", statistics.delayedGeometryLoaded.toDouble())
    data.putDouble("fullyAppeared", statistics.fullyAppeared.toDouble())
    data.putDouble("fullyLoaded", statistics.fullyLoaded.toDouble())

    val viewId = getId()
    val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, viewId)
    if (eventDispatcher != null) {
      val event = MapLoadEvent(viewId, data)
      eventDispatcher.dispatchEvent(event)
    }
  }
  
  override fun onCameraPositionChanged(
    map: YMap,
    cameraPosition: CameraPosition,
    reason: CameraUpdateReason,
    finished: Boolean
  ) {
    val reactContext = context as? ReactContext
    if (reactContext == null) {
      return
    }

    val data = Arguments.createMap()
    data.putDouble("latitude", cameraPosition.target.latitude)
    data.putDouble("longitude", cameraPosition.target.longitude)
    data.putDouble("zoom", cameraPosition.zoom.toDouble())
    data.putDouble("azimuth", cameraPosition.azimuth.toDouble())
    data.putDouble("tilt", cameraPosition.tilt.toDouble())
    data.putBoolean("finished", finished)
    data.putDouble("target", 0.0)
    
    val viewId = getId()
    
    val handler = Handler(Looper.getMainLooper())
    handler.post {
      val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, viewId)
      if (eventDispatcher != null) {
        try {
          val event = CameraPositionChangeEvent(viewId, data)
          eventDispatcher.dispatchEvent(event)
        } catch (e: Exception) {
          Log.e("YamapLiteView", "Error dispatching CameraPositionChangeEvent event", e)
        }
        
        if (finished) {
          val endData  = Arguments.createMap()
          endData.putDouble("latitude", cameraPosition.target.latitude)
          endData.putDouble("longitude", cameraPosition.target.longitude)
          endData.putDouble("zoom", cameraPosition.zoom.toDouble())
          endData.putDouble("azimuth", cameraPosition.azimuth.toDouble())
          endData.putDouble("tilt", cameraPosition.tilt.toDouble())
          endData.putBoolean("finished", finished)
          endData.putDouble("target", 0.0)
          try {
            val endEvent = CameraPositionChangeEndEvent(viewId, endData)
            eventDispatcher.dispatchEvent(endEvent)
          } catch (e: Exception) {
            Log.e("YamapLiteView", "Error dispatching CameraPositionChangeEndEvent event", e)
          }
        }
      }
    }
  }

  private class CameraPositionChangeEvent(viewTag: Int, private val eventData: WritableMap?) : Event<CameraPositionChangeEvent>(viewTag) {
    override fun getEventName(): String {
      return "onCameraPositionChange"
    }
    override fun getEventData(): WritableMap? {
      return eventData
    }
    override fun getCoalescingKey(): Short {
      return 0
    }
  }

  private class CameraPositionChangeEndEvent(viewTag: Int, private val eventData: WritableMap?) : Event<CameraPositionChangeEndEvent>(viewTag) {
    override fun getEventName(): String {
      return "onCameraPositionChangeEnd"
    }
    override fun getEventData(): WritableMap? {
      return eventData
    }
    override fun getCoalescingKey(): Short {
      return 0
    }
  }

  private class MapLoadEvent(viewTag: Int, private val eventData: WritableMap?) : Event<MapLoadEvent>(viewTag) {
    override fun getEventName(): String {
      return "onMapLoaded"
    }
    override fun getEventData(): WritableMap? {
      return eventData
    }
    override fun getCoalescingKey(): Short {
      return 0
    }
  }
}
