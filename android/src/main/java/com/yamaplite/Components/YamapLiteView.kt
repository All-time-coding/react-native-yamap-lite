package com.yamaplite.components

import android.content.Context
import android.graphics.Color
import android.graphics.PointF
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerHelper
import com.yamaplite.events.CameraPositionChangeEvent
import com.yamaplite.events.MapLoadEvent
import com.yamaplite.events.PressEvent
import com.yamaplite.utils.ResolveImageHelper
import com.yandex.mapkit.Animation
import com.yandex.mapkit.MapKitFactory
import com.yandex.mapkit.ScreenPoint
import com.yandex.mapkit.geometry.BoundingBox
import com.yandex.mapkit.geometry.Geometry
import com.yandex.mapkit.geometry.Point
import com.yandex.mapkit.layers.ObjectEvent
import com.yandex.mapkit.logo.Alignment
import com.yandex.mapkit.logo.HorizontalAlignment
import com.yandex.mapkit.logo.Padding
import com.yandex.mapkit.logo.VerticalAlignment
import com.yandex.mapkit.map.CameraListener
import com.yandex.mapkit.map.CameraPosition
import com.yandex.mapkit.map.CameraUpdateReason
import com.yandex.mapkit.map.CircleMapObject
import com.yandex.mapkit.map.ClusterizedPlacemarkCollection
import com.yandex.mapkit.map.IconStyle
import com.yandex.mapkit.map.InputListener
import com.yandex.mapkit.map.Map as YMap
import com.yandex.mapkit.map.MapLoadStatistics
import com.yandex.mapkit.map.MapLoadedListener
import com.yandex.mapkit.map.MapObjectCollection
import com.yandex.mapkit.map.MapObjectVisitor
import com.yandex.mapkit.map.MapType
import com.yandex.mapkit.map.PlacemarkMapObject
import com.yandex.mapkit.map.PolygonMapObject
import com.yandex.mapkit.map.PolylineMapObject
import com.yandex.mapkit.mapview.MapView
import com.yandex.mapkit.user_location.UserLocationLayer
import com.yandex.mapkit.user_location.UserLocationObjectListener
import com.yandex.mapkit.user_location.UserLocationView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

open class YamapLiteView(context: Context) :
        FrameLayout(context),
        MapLoadedListener,
        CameraListener,
        UserLocationObjectListener,
        InputListener {
  protected val mapView: MapView = MapView(context)
  private val reactChildren = mutableListOf<View>()
  private val coroutineScope = CoroutineScope(Dispatchers.Main)

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
  private var userLocationView: UserLocationView? = null

  init {
    setupMap()
    mapView.mapWindow.map.setMapLoadedListener(this)
    mapView.mapWindow.map.addCameraListener(this)
    mapView.mapWindow.map.addInputListener(this)
  }

  private fun setupMap() {
    addView(mapView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
  }

  fun setUserLocationIcon(icon: String?) {
    userLocationIcon = icon
    if (userLocationView != null) {
      updateUserLocationIcon()
    }
  }

  fun setUserLocationIconScale(scale: Float) {
    userLocationIconScale = scale
    if (userLocationView != null) {
      updateUserLocationIcon()
    }
  }

  fun setShowUserPosition(show: Boolean) {
    if (userLocationLayer == null) {
      userLocationLayer = MapKitFactory.getInstance().createUserLocationLayer(mapView.mapWindow)
    }

    if (show) {
      userLocationLayer!!.setObjectListener(this)
      userLocationLayer!!.isVisible = true
      userLocationLayer!!.isHeadingModeActive = true
    } else {
      userLocationLayer!!.isVisible = false
      userLocationLayer!!.isHeadingModeActive = false
      userLocationLayer!!.setObjectListener(null)
    }
  }

  fun setNightMode(nightMode: Boolean) {
    mapView.mapWindow.map.isNightModeEnabled = nightMode
  }

  fun setMapStyle(style: String?) {
    mapStyle = style
    if (!style.isNullOrEmpty()) {
      mapView.mapWindow.map.setMapStyle(style)
    }
  }

  fun setScrollGesturesEnabled(enabled: Boolean) {
    mapView.mapWindow.map.isScrollGesturesEnabled = enabled
  }

  fun setZoomGesturesEnabled(enabled: Boolean) {
    mapView.mapWindow.map.isZoomGesturesEnabled = enabled
  }

  fun setTiltGesturesEnabled(enabled: Boolean) {
    mapView.mapWindow.map.isTiltGesturesEnabled = enabled
  }

  fun setRotateGesturesEnabled(enabled: Boolean) {
    mapView.mapWindow.map.isRotateGesturesEnabled = enabled
  }

  fun setFastTapEnabled(enabled: Boolean) {
    mapView.mapWindow.map.isFastTapEnabled = enabled
  }

  fun setInitialRegion(region: Map<String, Any>?) {
    if (region == null) return
    val latitude = region["lat"] as? Double ?: return
    val longitude = region["lon"] as? Double ?: return
    val zoom = (region["zoom"] as? Double ?: 10.0).toFloat()
    val azimuth = (region["azimuth"] as? Double ?: 0.0).toFloat()
    val tilt = (region["tilt"] as? Double ?: 0.0).toFloat()

    val point = Point(latitude, longitude)
    val cameraPosition = CameraPosition(point, zoom, azimuth, tilt)
    mapView.getMapWindow().map.move(cameraPosition)
  }

  fun setMaxFps(fps: Float) {
    maxFps = if (fps <= 0f || fps > 60f) 60f else fps
    mapView.mapWindow.setMaxFps(maxFps)
  }

  fun setMapType(type: String?) {
    mapType = type ?: "map"
    mapView.mapWindow.map.mapType =
            when (mapType) {
              "satellite" -> MapType.SATELLITE
              "hybrid" -> MapType.HYBRID
              else -> MapType.MAP
            }
  }

  fun setLogoPosition(position: Map<String, Any>) {
    var horizontalAlignment = HorizontalAlignment.RIGHT
    var verticalAlignment = VerticalAlignment.BOTTOM

    if (position.containsKey("horizontal")) {
      when (position.get("horizontal")) {
        "left" -> horizontalAlignment = HorizontalAlignment.LEFT
        "center" -> horizontalAlignment = HorizontalAlignment.CENTER
        else -> {}
      }
    }

    if (position.containsKey("vertical")) {
      when (position.get("vertical")) {
        "top" -> verticalAlignment = VerticalAlignment.TOP
        "bottom" -> verticalAlignment = VerticalAlignment.BOTTOM
        else -> {}
      }
    }

    mapView.getMapWindow().map.logo.setAlignment(Alignment(horizontalAlignment, verticalAlignment))
  }

  fun setLogoPadding(horizontalPadding: Int, verticalPadding: Int) {
    mapView.getMapWindow().map.logo.setPadding(Padding(horizontalPadding, verticalPadding))
  }

  fun getCameraPosition(): WritableMap? {
    try {
      val map = mapView.mapWindow.map
      val cameraPosition = map.cameraPosition
      val result = Arguments.createMap()
      result.putDouble("lat", cameraPosition.target.latitude)
      result.putDouble("lon", cameraPosition.target.longitude)
      result.putDouble("zoom", cameraPosition.zoom.toDouble())
      result.putDouble("azimuth", cameraPosition.azimuth.toDouble())
      result.putDouble("tilt", cameraPosition.tilt.toDouble())
      return result
    } catch (e: Exception) {
      Log.e("YamapLiteView", "Failed to get camera position", e)
      return null
    }
  }

  private fun moveCamera(cameraPosition: CameraPosition, duration: Int, animation: String) {
    val map = mapView.mapWindow.map
    if (duration > 0) {
      val animType = if (animation == "LINEAR") Animation.Type.LINEAR else Animation.Type.SMOOTH
      map.move(cameraPosition, Animation(animType, duration.toFloat() / 1000.0f), null)
    } else {
      map.move(cameraPosition)
    }
  }

  fun setCenter(
          latitude: Double,
          longitude: Double,
          zoom: Float,
          azimuth: Float,
          tilt: Float,
          duration: Int,
          animation: String
  ) {
    try {
      val point = Point(latitude, longitude)
      moveCamera(CameraPosition(point, zoom, azimuth, tilt), duration, animation)
    } catch (e: Exception) {
      Log.e("YamapLiteView", "Failed to set center", e)
    }
  }

  fun setZoom(zoom: Float, duration: Int, animation: String) {
    try {
      val currentPosition = mapView.mapWindow.map.cameraPosition
      val cameraPosition =
              CameraPosition(
                      currentPosition.target,
                      zoom,
                      currentPosition.azimuth,
                      currentPosition.tilt
              )
      moveCamera(cameraPosition, duration, animation)
    } catch (e: Exception) {
      Log.e("YamapLiteView", "Failed to set zoom", e)
    }
  }

  fun fitAllMarkers() {
    try {
      val map = mapView.mapWindow.map
      val markerPoints = mutableListOf<Point>()

      for (i in 0 until reactChildren.size) {
        val child = reactChildren[i]
        if (child is YamapLiteMarkerView) {
          markerPoints.add(Point(child.latitude, child.longitude))
        }
      }

      if (markerPoints.size == 0) {
        return
      }

      val boundingBox = calculateBoundingBox(ArrayList(markerPoints))
      val geometry = Geometry.fromBoundingBox(boundingBox)
      val cameraPosition = map.cameraPosition(geometry)
      map.move(cameraPosition, Animation(Animation.Type.SMOOTH, 0.7f), null)
    } catch (e: Exception) {
      Log.e("YamapLiteView", "Failed to fit all markers", e)
    }
  }

  fun setFollowUser(follow: Boolean) {
    if (userLocationLayer == null) {
      setShowUserPosition(true)
    }

    if (follow) {
      userLocationLayer!!.isAutoZoomEnabled = true
      userLocationLayer!!.setAnchor(
              PointF((width * 0.5).toFloat(), (height * 0.5).toFloat()),
              PointF((width * 0.5).toFloat(), (height * 0.83).toFloat())
      )
    } else {
      userLocationLayer!!.isAutoZoomEnabled = false
      userLocationLayer!!.resetAnchor()
    }
  }

  fun setUserLocationAccuracyFillColor(color: String?) {
    userLocationAccuracyFillColor = color ?: "#00FF00"
  }

  fun setUserLocationAccuracyStrokeColor(color: String?) {
    userLocationAccuracyStrokeColor = color ?: "#000000"
  }

  fun setUserLocationAccuracyStrokeWidth(width: Float) {
    userLocationAccuracyStrokeWidth = width
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

  protected fun addReactChildToList(child: View, index: Int) {
    if (index < 0 || index > reactChildren.size) {
      reactChildren.add(child)
    } else {
      reactChildren.add(index, child)
    }
  }

  protected fun removeReactChildFromListAt(index: Int): View? {
    if (index < 0 || index >= reactChildren.size) return null
    return reactChildren.removeAt(index)
  }

  fun addReactChild(child: View, index: Int) {
    addReactChildToList(child, index)
    if (child is YamapLiteMarkerView) {
      child.addToMap(mapView)
    } else if (child is YamapCircle) {
      child.addToMap(mapView)
    } else if (child is YamapPolyline) {
      child.addToMap(mapView)
    } else if (child is YamapPolygon) {
      child.addToMap(mapView)
    }
  }

  fun removeReactChildAt(index: Int) {
    val child = removeReactChildFromListAt(index) ?: return
    if (child is YamapLiteMarkerView) {
      child.removeFromMap(mapView)
    } else if (child is YamapCircle) {
      child.removeFromMap(mapView)
    } else if (child is YamapPolyline) {
      child.removeFromMap(mapView)
    } else if (child is YamapPolygon) {
      child.removeFromMap(mapView)
    }
  }

  open fun onDropViewInstance() {
    coroutineScope.cancel()
  }

  fun getReactChildAt(index: Int): View? {
    if (index < 0 || index >= reactChildren.size) {
      return null
    }
    return reactChildren[index]
  }

  fun getReactChildCount(): Int {
    return reactChildren.size
  }

  fun getMapObjectCount(): Int {
    val visitor = MapObjectCountVisitor()
    mapView.mapWindow.map.mapObjects.traverse(visitor)
    return visitor.count
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

    val viewId = getId()
    val surfaceId = UIManagerHelper.getSurfaceId(reactContext)
    val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, viewId)
    if (eventDispatcher != null) {
      eventDispatcher.dispatchEvent(MapLoadEvent(surfaceId, viewId, statistics))
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

    val viewId = getId()
    val surfaceId = UIManagerHelper.getSurfaceId(reactContext)

    val handler = Handler(Looper.getMainLooper())
    handler.post {
      val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, viewId)
      if (eventDispatcher != null) {
        try {
          eventDispatcher.dispatchEvent(
                  CameraPositionChangeEvent(
                          surfaceId,
                          viewId,
                          "onCameraPositionChange",
                          cameraPosition,
                          reason,
                          finished,
                  )
          )
        } catch (e: Exception) {
          Log.e("YamapLiteView", "Error dispatching CameraPositionChangeEvent event", e)
        }

        if (finished) {
          try {
            eventDispatcher.dispatchEvent(
                    CameraPositionChangeEvent(
                            surfaceId,
                            viewId,
                            "onCameraPositionChangeEnd",
                            cameraPosition,
                            reason,
                            finished,
                    )
            )
          } catch (e: Exception) {
            Log.e("YamapLiteView", "Error dispatching CameraPositionChangeEndEvent event", e)
          }
        }
      }
    }
  }

  override fun onMapTap(map: YMap, point: Point) {
    val reactContext = context as? ReactContext
    if (reactContext == null) {
      return
    }
    val viewId = getId()
    val surfaceId = UIManagerHelper.getSurfaceId(reactContext)
    val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, viewId)
    if (eventDispatcher != null) {
      eventDispatcher.dispatchEvent(PressEvent(surfaceId, viewId, "onMapPress", point))
    }
  }

  override fun onMapLongTap(map: YMap, point: Point) {
    val reactContext = context as? ReactContext
    if (reactContext == null) {
      return
    }
    val viewId = getId()
    val surfaceId = UIManagerHelper.getSurfaceId(reactContext)
    val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, viewId)
    if (eventDispatcher != null) {
      eventDispatcher.dispatchEvent(PressEvent(surfaceId, viewId, "onMapLongPress", point))
    }
  }

  private fun updateUserLocationIcon() {
    if (userLocationView == null || userLocationIcon == null) {
      return
    }

    val userIconStyle = IconStyle()
    userIconStyle.setScale(userLocationIconScale)

    val pin = userLocationView!!.pin
    val arrow = userLocationView!!.arrow
    coroutineScope.launch {
      val icon = ResolveImageHelper.getInstance().resolveImage(context, userLocationIcon!!, 50)
      icon?.let {
        pin.setIcon(it, userIconStyle)
        arrow.setIcon(it, userIconStyle)
      }
    }
    val circle = userLocationView!!.accuracyCircle
    if (userLocationAccuracyFillColor != null) {
      circle.fillColor = Color.parseColor(userLocationAccuracyFillColor)
    }
    if (userLocationAccuracyStrokeColor != null) {
      circle.strokeColor = Color.parseColor(userLocationAccuracyStrokeColor)
    }
    circle.strokeWidth = userLocationAccuracyStrokeWidth
  }

  fun fitMarkers(points: ArrayList<Point?>) {
    if (points.size == 0) {
      return
    }
    if (points.size == 1) {
      val center = Point(points[0]!!.latitude, points[0]!!.longitude)
      mapView.getMapWindow().map.move(CameraPosition(center, 15f, 0f, 0f))
      return
    }
    var cameraPosition =
            mapView.getMapWindow()
                    .map
                    .cameraPosition(Geometry.fromBoundingBox(calculateBoundingBox(points)))
    cameraPosition =
            CameraPosition(
                    cameraPosition.target,
                    cameraPosition.zoom - 0.8f,
                    cameraPosition.azimuth,
                    cameraPosition.tilt
            )
    mapView.getMapWindow().map.move(cameraPosition, Animation(Animation.Type.SMOOTH, 0.7f), null)
  }

  fun getVisibleRegion(): WritableMap? {
    val map = mapView.mapWindow.map
    val visibleRegion = map.visibleRegion
    val result = Arguments.createMap()
    result.putMap(
            "bottomLeft",
            Arguments.createMap().apply {
              putDouble("lat", visibleRegion.bottomLeft.latitude)
              putDouble("lon", visibleRegion.bottomLeft.longitude)
            }
    )
    result.putMap(
            "topLeft",
            Arguments.createMap().apply {
              putDouble("lat", visibleRegion.topLeft.latitude)
              putDouble("lon", visibleRegion.topLeft.longitude)
            }
    )
    result.putMap(
            "topRight",
            Arguments.createMap().apply {
              putDouble("lat", visibleRegion.topRight.latitude)
              putDouble("lon", visibleRegion.topRight.longitude)
            }
    )
    result.putMap(
            "bottomRight",
            Arguments.createMap().apply {
              putDouble("lat", visibleRegion.bottomRight.latitude)
              putDouble("lon", visibleRegion.bottomRight.longitude)
            }
    )
    return result
  }

  fun getScreenPoints(points: List<Point>): WritableArray {
    val result = Arguments.createArray()
    for (point in points) {
      val screenPoint = mapView.mapWindow.worldToScreen(point) ?: continue
      result.pushMap(
              Arguments.createMap().apply {
                putDouble("x", screenPoint.x.toDouble())
                putDouble("y", screenPoint.y.toDouble())
              }
      )
    }
    return result
  }

  fun getWorldPoints(points: ArrayList<ScreenPoint?>): WritableArray {
    val result = Arguments.createArray()
    for (screenPoint in points) {
      if (screenPoint == null) continue
      val worldPoint = mapView.mapWindow.screenToWorld(screenPoint) ?: continue
      result.pushMap(
              Arguments.createMap().apply {
                putDouble("lat", worldPoint.latitude)
                putDouble("lon", worldPoint.longitude)
              }
      )
    }
    return result
  }

  override fun onObjectAdded(_userLocationView: UserLocationView) {
    userLocationView = _userLocationView
    updateUserLocationIcon()
  }

  override fun onObjectRemoved(userLocationView: UserLocationView) {}

  override fun onObjectUpdated(_userLocationView: UserLocationView, objectEvent: ObjectEvent) {
    userLocationView = _userLocationView
    updateUserLocationIcon()
  }

  private class MapObjectCountVisitor : MapObjectVisitor {
    var count = 0

    override fun onPlacemarkVisited(placemark: PlacemarkMapObject) {
      count++
    }

    override fun onPolylineVisited(polyline: PolylineMapObject) {
      count++
    }

    override fun onPolygonVisited(polygon: PolygonMapObject) {
      count++
    }

    override fun onCircleVisited(circle: CircleMapObject) {
      count++
    }

    override fun onCollectionVisitStart(collection: MapObjectCollection): Boolean {
      return true
    }

    override fun onCollectionVisitEnd(collection: MapObjectCollection) {}

    override fun onClusterizedCollectionVisitStart(
            collection: ClusterizedPlacemarkCollection
    ): Boolean {
      return true
    }

    override fun onClusterizedCollectionVisitEnd(collection: ClusterizedPlacemarkCollection) {}
  }
}
