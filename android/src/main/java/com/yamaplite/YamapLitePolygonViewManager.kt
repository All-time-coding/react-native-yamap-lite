package com.yamaplite

import android.graphics.Color
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.YamapLitePolygonViewManagerInterface
import com.yamaplite.components.YamapPolygon
import com.yamaplite.utils.PointParser

class YamapLitePolygonViewManager :
        SimpleViewManager<YamapPolygon>(), YamapLitePolygonViewManagerInterface<YamapPolygon> {

    override fun getName(): String {
        return NAME
    }

    override fun createViewInstance(context: ThemedReactContext): YamapPolygon {
        return YamapPolygon(context)
    }

    @ReactProp(name = "fillColor")
    override fun setFillColor(view: YamapPolygon, color: Int?) {
        view.setFillColor(color ?: Color.BLACK)
    }

    @ReactProp(name = "strokeColor")
    override fun setStrokeColor(view: YamapPolygon, color: Int?) {
        view.setStrokeColor(color ?: Color.BLACK)
    }

    @ReactProp(name = "strokeWidth")
    override fun setStrokeWidth(view: YamapPolygon, width: Float) {
        view.setStrokeWidth(width)
    }

    @ReactProp(name = "zInd")
    override fun setZInd(view: YamapPolygon, zIndex: Int) {
        view.setZIndex(zIndex.toFloat())
    }

    @ReactProp(name = "points")
    override fun setPoints(view: YamapPolygon, points: ReadableArray?) {
        view.setPoints(PointParser.parsePoints(points))
    }

    @ReactProp(name = "innerRings")
    override fun setInnerRings(view: YamapPolygon, innerRings: ReadableArray?) {
        view.setInnerRings(PointParser.parseRings(innerRings))
    }

    @ReactProp(name = "handled")
    override fun setHandled(view: YamapPolygon, handled: Boolean) {
        view.setHandled(handled)
    }

    companion object {
        const val NAME = "YamapLitePolygonView"
    }
}
