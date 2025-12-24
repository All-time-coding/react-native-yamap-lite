package com.yamaplite

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.YamapLiteViewManagerInterface
import com.facebook.react.viewmanagers.YamapLiteViewManagerDelegate
import com.yamaplite.components.YamapLiteView
import android.view.View

class YamapLiteViewManager : ViewGroupManager<YamapLiteView>(), YamapLiteViewManagerInterface<YamapLiteView> {
  private val mDelegate: ViewManagerDelegate<YamapLiteView>

  init {
    mDelegate = YamapLiteViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<YamapLiteView> = mDelegate

  override fun createViewInstance(context: ThemedReactContext): YamapLiteView {
    return YamapLiteView(context)
  }

  override fun addView(parent: YamapLiteView, child: View, index: Int) {
    parent.addReactChild(child, index)
  }

  override fun getChildAt(parent: YamapLiteView, index: Int): View {
    return parent.getReactChildAt(index) ?: throw IndexOutOfBoundsException("Index $index is out of bounds for child count ${parent.getReactChildCount()}")
  }

  override fun getChildCount(parent: YamapLiteView): Int {
    return parent.getReactChildCount()
  }

  override fun removeViewAt(parent: YamapLiteView, index: Int) {
    val childCount = parent.getReactChildCount()
    if (index >= 0 && index < childCount) {
      parent.removeReactChildAt(index)
    }
  }

  override fun getName() = "YamapLiteView"

  @ReactProp(name = "userLocationIcon")
  override fun setUserLocationIcon(view: YamapLiteView, value: String?) {
    view.setUserLocationIcon(value)
  }

  @ReactProp(name = "userLocationIconScale")
  override fun setUserLocationIconScale(view: YamapLiteView, value: Float) {
    view.setUserLocationIconScale(value)
  }

  @ReactProp(name = "showUserPosition")
  override fun setShowUserPosition(view: YamapLiteView, value: Boolean) {
    view.setShowUserPosition(value)
  }

  @ReactProp(name = "nightMode")
  override fun setNightMode(view: YamapLiteView, value: Boolean) {
    view.setNightMode(value)
  }

  @ReactProp(name = "mapStyle")
  override fun setMapStyle(view: YamapLiteView, value: String?) {
    view.setMapStyle(value)
  }

  @ReactProp(name = "scrollGesturesEnabled")
  override fun setScrollGesturesEnabled(view: YamapLiteView, value: Boolean) {
    view.setScrollGesturesEnabled(value)
  }

  @ReactProp(name = "zoomGesturesEnabled")
  override fun setZoomGesturesEnabled(view: YamapLiteView, value: Boolean) {
    view.setZoomGesturesEnabled(value)
  }

  @ReactProp(name = "tiltGesturesEnabled")
  override fun setTiltGesturesEnabled(view: YamapLiteView, value: Boolean) {
    view.setTiltGesturesEnabled(value)
  }

  @ReactProp(name = "rotateGesturesEnabled")
  override fun setRotateGesturesEnabled(view: YamapLiteView, value: Boolean) {
    view.setRotateGesturesEnabled(value)
  }

  @ReactProp(name = "fastTapEnabled")
  override fun setFastTapEnabled(view: YamapLiteView, value: Boolean) {
    view.setFastTapEnabled(value)
  }

  @ReactProp(name = "initialRegion")
  override fun setInitialRegion(view: YamapLiteView, value: ReadableMap?) {
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
  override fun setMaxFps(view: YamapLiteView, value: Float) {
    view.setMaxFps(value)
  }

  @ReactProp(name = "mapType")
  override fun setMapType(view: YamapLiteView, value: String?) {
    view.setMapType(value)
  }

  @ReactProp(name = "logoPosition")
  override fun setLogoPosition(view: YamapLiteView, value: ReadableMap?) {
    if (value != null) {
      val position = mutableMapOf<String, Any>()
      if (value.hasKey("vertical")) position["vertical"] = value.getString("vertical") ?: "bottom"
      if (value.hasKey("horizontal")) position["horizontal"] = value.getString("horizontal") ?: "left"
      view.setLogoPosition(position)
    }
  }

  @ReactProp(name = "logoPadding")
  override fun setLogoPadding(view: YamapLiteView, value: ReadableMap?) {
    if (value != null) {
      val horizontalPadding =
        if ((value.hasKey("horizontal") && !value.isNull("horizontal"))) value.getInt("horizontal") else 0
      val verticalPadding =
        if ((value.hasKey("vertical") && !value.isNull("vertical"))) value.getInt("vertical") else 0
      view.setLogoPadding(horizontalPadding, verticalPadding)
    }
  }

  @ReactProp(name = "userLocationAccuracyFillColor")
  override fun setUserLocationAccuracyFillColor(view: YamapLiteView, value: String?) {
    view.setUserLocationAccuracyFillColor(value)
  }

  @ReactProp(name = "userLocationAccuracyStrokeColor")
  override fun setUserLocationAccuracyStrokeColor(view: YamapLiteView, value: String?) {
    view.setUserLocationAccuracyStrokeColor(value)
  }

  @ReactProp(name = "userLocationAccuracyStrokeWidth")
  override fun setUserLocationAccuracyStrokeWidth(view: YamapLiteView, value: Float) {
    view.setUserLocationAccuracyStrokeWidth(value)
  }

  @ReactProp(name = "followUser")
  override fun setFollowUser(view: YamapLiteView, value: Boolean) {
    view.setFollowUser(value)
  }
}
