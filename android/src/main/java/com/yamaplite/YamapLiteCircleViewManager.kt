package com.yamaplite

import android.graphics.Color
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.YamapLiteCircleViewManagerInterface
import com.yamaplite.components.YamapCircle
import com.yandex.mapkit.geometry.Point

@ReactModule(name = YamapLiteCircleViewManager.NAME)
class YamapLiteCircleViewManager :
        SimpleViewManager<YamapCircle>(), YamapLiteCircleViewManagerInterface<YamapCircle> {

    override fun getName(): String {
        return NAME
    }

    override fun createViewInstance(context: ThemedReactContext): YamapCircle {
        return YamapCircle(context)
    }

    @ReactProp(name = "fillColor")
    override fun setFillColor(view: YamapCircle, color: Int?) {
        view.setFillColor(color ?: Color.BLACK)
    }

    @ReactProp(name = "strokeColor")
    override fun setStrokeColor(view: YamapCircle, color: Int?) {
        view.setStrokeColor(color ?: Color.BLACK)
    }

    @ReactProp(name = "strokeWidth", defaultFloat = 1f)
    override fun setStrokeWidth(view: YamapCircle, width: Float) {
        view.setStrokeWidth(width)
    }

    @ReactProp(name = "zInd", defaultInt = 0)
    override fun setZInd(view: YamapCircle, zInd: Int) {
        view.setZInd(zInd)
    }

    @ReactProp(name = "center")
    override fun setCenter(view: YamapCircle, center: ReadableMap?) {
        if (center != null) {
            val lat = if (center.hasKey("lat")) center.getDouble("lat") else 0.0
            val lon = if (center.hasKey("lon")) center.getDouble("lon") else 0.0
            view.setCenter(Point(lat, lon))
        }
    }

    @ReactProp(name = "radius", defaultFloat = 0f)
    override fun setRadius(view: YamapCircle, radius: Float) {
        view.setRadius(radius)
    }

    @ReactProp(name = "handled", defaultBoolean = false)
    override fun setHandled(view: YamapCircle, handled: Boolean) {
        view.setHandled(handled)
    }

    companion object {
        const val NAME = "YamapLiteCircleView"
    }
}
