package com.yamaplite

import android.content.Context
import android.graphics.Color
import android.util.Log
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTModernEventEmitter
import com.yandex.mapkit.Animation
import com.yandex.mapkit.MapKitFactory
import com.yandex.mapkit.geometry.Point
import com.yandex.mapkit.geometry.BoundingBox
import com.yandex.mapkit.geometry.Geometry
import com.yandex.mapkit.map.*
import com.yandex.mapkit.mapview.MapView
import com.yandex.mapkit.user_location.UserLocationLayer
import com.yandex.runtime.image.ImageProvider
import android.view.View

class YamapLiteView(context: Context) : FrameLayout(context) {
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
    return null
  }
  
  fun reload() {
  }
  
  fun setCenter(latitude: Double, longitude: Double, zoom: Float, azimuth: Float, tilt: Float, duration: Float) {
  }
  
  fun setZoom(zoom: Float) {
  }
  
  fun fitAllMarkers() {
    var points = ArrayList<Point?>();
    if (points.size == 0) {
          return
      }
      if (points.size == 1) {
          val center = Point(
              points[0]!!.latitude, points[0]!!.longitude
          )
          mapView.getMapWindow().map.move(CameraPosition(center, 15f, 0f, 0f))
          return
      }
      val boundingBox = calculateBoundingBox(points)
      var cameraPosition = mapView.getMapWindow().map.cameraPosition(Geometry.fromBoundingBox(boundingBox))
      cameraPosition = CameraPosition(
          cameraPosition.target,
          cameraPosition.zoom - 0.8f,
          cameraPosition.azimuth,
          cameraPosition.tilt
      )
      mapView.getMapWindow().map.move(cameraPosition, Animation(Animation.Type.SMOOTH, 0.7f), null)
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
}
