package com.yamaplite

import android.view.View
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.YamapLiteViewManagerDelegate
import com.facebook.react.viewmanagers.YamapLiteViewManagerInterface
import com.yamaplite.components.YamapLiteView

class YamapLiteViewManager :
        ViewGroupManager<YamapLiteView>(), YamapLiteViewManagerInterface<YamapLiteView> {
  private val mDelegate: ViewManagerDelegate<YamapLiteView>

  init {
    mDelegate = YamapLiteViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<YamapLiteView> = mDelegate

  override fun createViewInstance(context: ThemedReactContext): YamapLiteView {
    return YamapLiteView(context)
  }

  override fun onDropViewInstance(view: YamapLiteView) {
    view.onDropViewInstance()
    super.onDropViewInstance(view)
  }

  override fun addView(parent: YamapLiteView, child: View, index: Int) {
    parent.addReactChild(child, index)
    super.addView(parent, child, index)
  }

  override fun getChildAt(parent: YamapLiteView, index: Int): View {
    return parent.getReactChildAt(index)
            ?: throw IndexOutOfBoundsException(
                    "Index $index is out of bounds for child count ${parent.getReactChildCount()}"
            )
  }

  override fun getChildCount(parent: YamapLiteView): Int {
    return parent.getReactChildCount()
  }

  override fun removeViewAt(parent: YamapLiteView, index: Int) {
    val childCount = parent.getReactChildCount()
    if (index >= 0 && index < childCount) {
      parent.removeReactChildAt(index)
      super.removeViewAt(parent, index)
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
  override fun setScrollGesturesEnabled(view: YamapLiteView, _value: Boolean) {
    view.setScrollGesturesEnabled(_value)
  }

  @ReactProp(name = "zoomGesturesEnabled")
  override fun setZoomGesturesEnabled(view: YamapLiteView, _value: Boolean) {
    view.setZoomGesturesEnabled(_value)
  }

  @ReactProp(name = "tiltGesturesEnabled")
  override fun setTiltGesturesEnabled(view: YamapLiteView, _value: Boolean) {
    view.setTiltGesturesEnabled(_value)
  }

  @ReactProp(name = "rotateGesturesEnabled")
  override fun setRotateGesturesEnabled(view: YamapLiteView, _value: Boolean) {
    view.setRotateGesturesEnabled(_value)
  }

  @ReactProp(name = "fastTapEnabled")
  override fun setFastTapEnabled(view: YamapLiteView, _value: Boolean) {
    view.setFastTapEnabled(_value)
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
  override fun setMaxFps(view: YamapLiteView, _value: Float) {
    view.setMaxFps(_value)
  }

  @ReactProp(name = "mapType")
  override fun setMapType(view: YamapLiteView, _value: String?) {
    view.setMapType(_value)
  }

  @ReactProp(name = "logoPosition")
  override fun setLogoPosition(view: YamapLiteView, _value: ReadableMap?) {
    if (_value != null) {
      val position = mutableMapOf<String, Any>()
      if (_value.hasKey("vertical")) position["vertical"] = _value.getString("vertical") ?: "bottom"
      if (_value.hasKey("horizontal"))
              position["horizontal"] = _value.getString("horizontal") ?: "left"
      view.setLogoPosition(position)
    }
  }

  @ReactProp(name = "logoPadding")
  override fun setLogoPadding(view: YamapLiteView, _value: ReadableMap?) {
    if (_value != null) {
      val horizontalPadding =
              if ((_value.hasKey("horizontal") && !_value.isNull("horizontal")))
                      _value.getInt("horizontal")
              else 0
      val verticalPadding =
              if ((_value.hasKey("vertical") && !_value.isNull("vertical")))
                      _value.getInt("vertical")
              else 0
      view.setLogoPadding(horizontalPadding, verticalPadding)
    }
  }

  @ReactProp(name = "userLocationAccuracyFillColor")
  override fun setUserLocationAccuracyFillColor(view: YamapLiteView, _value: String?) {
    view.setUserLocationAccuracyFillColor(_value)
  }

  @ReactProp(name = "userLocationAccuracyStrokeColor")
  override fun setUserLocationAccuracyStrokeColor(view: YamapLiteView, _value: String?) {
    view.setUserLocationAccuracyStrokeColor(_value)
  }

  @ReactProp(name = "userLocationAccuracyStrokeWidth")
  override fun setUserLocationAccuracyStrokeWidth(view: YamapLiteView, _value: Float) {
    view.setUserLocationAccuracyStrokeWidth(_value)
  }

  @ReactProp(name = "followUser")
  override fun setFollowUser(view: YamapLiteView, _value: Boolean) {
    view.setFollowUser(_value)
  }
}
