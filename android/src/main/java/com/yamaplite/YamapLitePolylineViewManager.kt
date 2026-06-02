package com.yamaplite

import android.graphics.Color
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.YamapLitePolylineViewManagerInterface
import com.yamaplite.components.YamapPolyline
import com.yamaplite.utils.PointParser

class YamapLitePolylineViewManager :
        SimpleViewManager<YamapPolyline>(), YamapLitePolylineViewManagerInterface<YamapPolyline> {
    override fun getName(): String {
        return NAME
    }

    override fun createViewInstance(context: ThemedReactContext): YamapPolyline {
        return YamapPolyline(context)
    }

    @ReactProp(name = "strokeColor")
    override fun setStrokeColor(view: YamapPolyline, color: Int?) {
        view.setStrokeColor(color ?: Color.BLACK)
    }

    @ReactProp(name = "strokeWidth")
    override fun setStrokeWidth(view: YamapPolyline, width: Float) {
        view.setStrokeWidth(width)
    }

    @ReactProp(name = "outlineColor")
    override fun setOutlineColor(view: YamapPolyline, color: Int?) {
        view.setOutlineColor(color ?: Color.BLACK)
    }

    @ReactProp(name = "zInd")
    override fun setZInd(view: YamapPolyline, zIndex: Int) {
        view.setZIndex(zIndex.toFloat())
    }

    @ReactProp(name = "dashLength")
    override fun setDashLength(view: YamapPolyline, length: Float) {
        view.setDashLength(length)
    }

    @ReactProp(name = "gapLength")
    override fun setGapLength(view: YamapPolyline, length: Float) {
        view.setGapLength(length)
    }

    @ReactProp(name = "outlineWidth")
    override fun setOutlineWidth(view: YamapPolyline, width: Float) {
        view.setOutlineWidth(width)
    }

    @ReactProp(name = "dashOffset")
    override fun setDashOffset(view: YamapPolyline, offset: Float) {
        view.setDashOffset(offset)
    }

    @ReactProp(name = "points")
    override fun setPoints(view: YamapPolyline, points: ReadableArray?) {
        view.setPoints(PointParser.parsePoints(points))
    }

    @ReactProp(name = "handled")
    override fun setHandled(view: YamapPolyline, handled: Boolean) {
        view.setHandled(handled)
    }

    companion object {
        const val NAME = "YamapLitePolylineView"
    }
}
