package com.yamaplite

import android.graphics.Color
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.bridge.ReadableMap
import com.yamaplite.components.YamapCircle
import com.yandex.mapkit.geometry.Point

@ReactModule(name = YamapLiteCircleViewManager.NAME)
class YamapLiteCircleViewManager : SimpleViewManager<YamapCircle>() {

    override fun getName(): String {
        return NAME
    }

    override fun createViewInstance(context: ThemedReactContext): YamapCircle {
        return YamapCircle(context)
    }

    @ReactProp(name = "fillColor")
    fun setFillColor(view: YamapCircle, color: Int?) {
        view.setFillColor(color!!)
    }

    @ReactProp(name = "strokeColor")
    fun setStrokeColor(view: YamapCircle, color: Int?) {
        view.setStrokeColor(color!!)
    }

    @ReactProp(name = "strokeWidth", defaultFloat = 1f)
    fun setStrokeWidth(view: YamapCircle, width: Float) {
        view.setStrokeWidth(width)
    }

    @ReactProp(name = "zInd", defaultInt = 0)
    fun setZInd(view: YamapCircle, zInd: Int) {
        view.setZInd(zInd)
    }

    @ReactProp(name = "center")
    fun setCenter(view: YamapCircle, center: ReadableMap?) {
        if (center != null) {
            val lat = if (center.hasKey("lat")) center.getDouble("lat") else 0.0
            val lon = if (center.hasKey("lon")) center.getDouble("lon") else 0.0
            view.setCenter(Point(lat, lon))
        }
    }

    @ReactProp(name = "radius", defaultFloat = 0f)
    fun setRadius(view: YamapCircle, radius: Float) {
        view.setRadius(radius)
    }

    @ReactProp(name = "handled", defaultBoolean = false)
    fun setHandled(view: YamapCircle, handled: Boolean) {
        view.setHandled(handled)
    }

    companion object {
        const val NAME = "YamapLiteCircleView"
    }
}
