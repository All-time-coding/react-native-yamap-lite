package com.yamaplite

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.bridge.ReadableMap
import com.yamaplite.Components.Circle

@ReactModule(name = YamapLiteCircleViewManager.NAME)
class YamapLiteCircleViewManager : SimpleViewManager<Circle>() {

    override fun getName(): String {
        return NAME
    }

    override fun createViewInstance(context: ThemedReactContext): Circle {
        return Circle(context)
    }

    @ReactProp(name = "fillColor")
    fun setFillColor(view: Circle, color: Int?) {
        view.setFillColor(color)
    }

    @ReactProp(name = "strokeColor")
    fun setStrokeColor(view: Circle, color: Int?) {
        view.setStrokeColor(color)
    }

    @ReactProp(name = "strokeWidth", defaultFloat = 1f)
    fun setStrokeWidth(view: Circle, width: Float) {
        view.setStrokeWidth(width)
    }

    @ReactProp(name = "zInd", defaultInt = 0)
    fun setZInd(view: Circle, zInd: Int) {
        // Z-index handling can be implemented here if needed
    }

    @ReactProp(name = "center")
    fun setCenter(view: Circle, center: ReadableMap?) {
        view.setCenter(center)
    }

    @ReactProp(name = "radius", defaultFloat = 0f)
    fun setRadius(view: Circle, radius: Float) {
        view.setRadius(radius)
    }

    @ReactProp(name = "handled", defaultBoolean = false)
    fun setHandled(view: Circle, handled: Boolean) {
        view.setHandled(handled)
    }

    companion object {
        const val NAME = "YamapLiteCircleView"
    }
}
