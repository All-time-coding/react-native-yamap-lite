package com.yamaplite

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.YamapLiteMarkerViewManagerInterface
import com.facebook.react.viewmanagers.YamapLiteMarkerViewManagerDelegate

class YamapLiteMarkerViewManager : SimpleViewManager<YamapLiteMarkerView>(), YamapLiteMarkerViewManagerInterface<YamapLiteMarkerView> {
  private val mDelegate: ViewManagerDelegate<YamapLiteMarkerView>

  init {
    mDelegate = YamapLiteMarkerViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<YamapLiteMarkerView> = mDelegate

  override fun getName(): String = "YamapLiteMarkerView"

  override fun createViewInstance(context: ThemedReactContext): YamapLiteMarkerView {
    return YamapLiteMarkerView(context)
  }

  @ReactProp(name = "point")
  override fun setPoint(view: YamapLiteMarkerView, value: ReadableMap?) {
    if (value == null) return
    val lat = if (value.hasKey("lat")) value.getDouble("lat") else 0.0
    val lon = if (value.hasKey("lon")) value.getDouble("lon") else 0.0
    view.setPoint(lat, lon)
  }

  @ReactProp(name = "source")
  override fun setSource(view: YamapLiteMarkerView, value: String?) {
    view.setIconSource(value)
  }

  @ReactProp(name = "scale")
  override fun setScale(view: YamapLiteMarkerView, value: Double) {
    view.setScale(value)
  }

  @ReactProp(name = "zInd")
  override fun setZInd(view: YamapLiteMarkerView, value: Int) {
    view.setZInd(value)
  }

  @ReactProp(name = "visible")
  override fun setVisible(view: YamapLiteMarkerView, value: Boolean) {
    view.setVisible(value)
  }

  @ReactProp(name = "anchor")
  override fun setAnchor(view: YamapLiteMarkerView, value: ReadableMap?) {
    if (value == null) return
    val x = if (value.hasKey("x")) value.getDouble("x") else 0.5
    val y = if (value.hasKey("y")) value.getDouble("y") else 0.5
    view.setAnchor(x, y)
  }
  
  @ReactProp(name = "rotated")
  override fun setRotated(view: YamapLiteMarkerView, value: Boolean) {
    view.setRotated(value)
  }
  
  @ReactProp(name = "handled")
  override fun setHandled(view: YamapLiteMarkerView, value: Boolean) {
    view.setHandled(value)
  }

  @ReactProp(name = "size")
  override fun setSize(view: YamapLiteMarkerView, size: Int) {
    view.setSize(size)
  }
}