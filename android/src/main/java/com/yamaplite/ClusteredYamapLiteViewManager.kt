package com.yamaplite

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.ClusteredYamapLiteViewManagerInterface
import com.facebook.react.viewmanagers.ClusteredYamapLiteViewManagerDelegate
import android.view.View
import android.graphics.Color
import com.yamaplite.components.ClusteredYamapLiteView

class ClusteredYamapLiteViewManager : ViewGroupManager<ClusteredYamapLiteView>(), ClusteredYamapLiteViewManagerInterface<ClusteredYamapLiteView> {
  private val mDelegate: ViewManagerDelegate<ClusteredYamapLiteView>

  init {
    mDelegate = ClusteredYamapLiteViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<ClusteredYamapLiteView> = mDelegate

  override fun createViewInstance(context: ThemedReactContext): ClusteredYamapLiteView {
    return ClusteredYamapLiteView(context)
  }

  override fun addView(parent: ClusteredYamapLiteView, child: View, index: Int) {
    parent.addReactChild(child, index)
  }

  override fun getChildAt(parent: ClusteredYamapLiteView, index: Int): View {
    return parent.getReactChildAt(index) ?: throw IndexOutOfBoundsException("Index $index is out of bounds for child count ${parent.getReactChildCount()}")
  }

  override fun getChildCount(parent: ClusteredYamapLiteView): Int {
    return parent.getReactChildCount()
  }

  override fun removeViewAt(parent: ClusteredYamapLiteView, index: Int) {
    val childCount = parent.getReactChildCount()
    if (index >= 0 && index < childCount) {
      parent.removeReactChildAt(index)
    }
  }

  override fun getName() = "ClusteredYamapLiteView"

  @ReactProp(name = "userLocationIcon")
  override fun setUserLocationIcon(view: ClusteredYamapLiteView, value: String?) {
    view.setUserLocationIcon(value)
  }

  @ReactProp(name = "userLocationIconScale")
  override fun setUserLocationIconScale(view: ClusteredYamapLiteView, value: Float) {
    view.setUserLocationIconScale(value)
  }

  @ReactProp(name = "showUserPosition")
  override fun setShowUserPosition(view: ClusteredYamapLiteView, value: Boolean) {
    view.setShowUserPosition(value)
  }

  @ReactProp(name = "nightMode")
  override fun setNightMode(view: ClusteredYamapLiteView, value: Boolean) {
    view.setNightMode(value)
  }

  @ReactProp(name = "mapStyle")
  override fun setMapStyle(view: ClusteredYamapLiteView, value: String?) {
    view.setMapStyle(value)
  }

  @ReactProp(name = "scrollGesturesEnabled")
  override fun setScrollGesturesEnabled(view: ClusteredYamapLiteView, value: Boolean) {
    view.setScrollGesturesEnabled(value)
  }

  @ReactProp(name = "zoomGesturesEnabled")
  override fun setZoomGesturesEnabled(view: ClusteredYamapLiteView, value: Boolean) {
    view.setZoomGesturesEnabled(value)
  }

  @ReactProp(name = "tiltGesturesEnabled")
  override fun setTiltGesturesEnabled(view: ClusteredYamapLiteView, value: Boolean) {
    view.setTiltGesturesEnabled(value)
  }

  @ReactProp(name = "rotateGesturesEnabled")
  override fun setRotateGesturesEnabled(view: ClusteredYamapLiteView, value: Boolean) {
    view.setRotateGesturesEnabled(value)
  }

  @ReactProp(name = "fastTapEnabled")
  override fun setFastTapEnabled(view: ClusteredYamapLiteView, value: Boolean) {
    view.setFastTapEnabled(value)
  }

  @ReactProp(name = "initialRegion")
  override fun setInitialRegion(view: ClusteredYamapLiteView, value: ReadableMap?) {
    if (value != null) {
      val region = mutableMapOf<String, Any>()
      if (value.hasKey("lat")) region["lat"] = value.getDouble("lat")
      if (value.hasKey("lon")) region["lon"] = value.getDouble("lon")
      if (value.hasKey("zoom")) region["zoom"] = value.getDouble("zoom")
      if (value.hasKey("azimuth")) region["azimuth"] = value.getDouble("azimuth")
      if (value.hasKey("tilt")) region["tilt"] = value.getDouble("tilt")
      view.setInitialRegion(region)
    }
  }

  @ReactProp(name = "maxFps")
  override fun setMaxFps(view: ClusteredYamapLiteView, value: Float) {
    view.setMaxFps(value)
  }

  @ReactProp(name = "mapType")
  override fun setMapType(view: ClusteredYamapLiteView, value: String?) {
    view.setMapType(value)
  }

  @ReactProp(name = "logoPosition")
  override fun setLogoPosition(view: ClusteredYamapLiteView, value: ReadableMap?) {
    if (value != null) {
      val position = mutableMapOf<String, Any>()
      if (value.hasKey("vertical")) position["vertical"] = value.getString("vertical") ?: "bottom"
      if (value.hasKey("horizontal")) position["horizontal"] = value.getString("horizontal") ?: "left"
      view.setLogoPosition(position)
    }
  }

  @ReactProp(name = "logoPadding")
  override fun setLogoPadding(view: ClusteredYamapLiteView, value: ReadableMap?) {
    if (value != null) {
      val horizontalPadding =
        if ((value.hasKey("horizontal") && !value.isNull("horizontal"))) value.getInt("horizontal") else 0
      val verticalPadding =
        if ((value.hasKey("vertical") && !value.isNull("vertical"))) value.getInt("vertical") else 0
      view.setLogoPadding(horizontalPadding, verticalPadding)
    }
  }

  @ReactProp(name = "userLocationAccuracyFillColor")
  override fun setUserLocationAccuracyFillColor(view: ClusteredYamapLiteView, value: String?) {
    view.setUserLocationAccuracyFillColor(value)
  }

  @ReactProp(name = "userLocationAccuracyStrokeColor")
  override fun setUserLocationAccuracyStrokeColor(view: ClusteredYamapLiteView, value: String?) {
    view.setUserLocationAccuracyStrokeColor(value)
  }

  @ReactProp(name = "userLocationAccuracyStrokeWidth")
  override fun setUserLocationAccuracyStrokeWidth(view: ClusteredYamapLiteView, value: Float) {
    view.setUserLocationAccuracyStrokeWidth(value)
  }

  @ReactProp(name = "clusteredMarkers")
  override fun setClusteredMarkers(view: ClusteredYamapLiteView, points: ReadableArray?) {
    view.setClusteredMarkers(points?.toArrayList()?.filterNotNull() as ArrayList<Any>)
  }

  @ReactProp(name = "clusterColor")
  override fun setClusterColor(view: ClusteredYamapLiteView, value: String?) {
    view.setClusterColor(Color.parseColor(value ?: "#000000"))
  }

  @ReactProp(name = "followUser")
  override fun setFollowUser(view: ClusteredYamapLiteView, value: Boolean) {
    view.setFollowUser(value)
  }
}
