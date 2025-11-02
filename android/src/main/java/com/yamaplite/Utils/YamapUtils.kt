package com.yamaplite.utils

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.fbreact.specs.NativeYamapUtilsSpec
import com.yamaplite.YamapLiteView

@ReactModule(name = NativeYamapUtilsSpec.NAME)
class YamapUtils(reactContext: ReactApplicationContext): NativeYamapUtilsSpec(reactContext) {
    override fun getCameraPosition(viewId: Double, promise: Promise) { 
        UiThreadUtil.runOnUiThread {
            try {
                val uiManager = UIManagerHelper.getUIManager(reactApplicationContext, viewId.toInt())
                val view = uiManager?.resolveView(viewId.toInt()) as? YamapLiteView
                
                if (view != null) {
                    val cameraPosition = view.getCameraPosition()
                    if (cameraPosition != null) {
                        promise.resolve(cameraPosition)
                    } else {
                        promise.reject("YamapLite", "failed to get camera position")
                    }
                } else {
                    promise.reject("YamapLite", "failed to get view")
                }
            } catch (e: Exception) {
                promise.reject("YamapLite", "failed to get camera position", e)
            }
        }
    }

    override fun getScreenPoints(viewId: Double, points: ReadableArray, promise: Promise) {
        promise.reject("YamapLite", "getScreenPoints not implemented")
    }

    override fun getVisibleRegion(viewId: Double, promise: Promise) {
        promise.reject("YamapLite", "getVisibleRegion not implemented")
    }

    override fun fitAllMarkers(viewId: Double, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                val uiManager = UIManagerHelper.getUIManager(reactApplicationContext, viewId.toInt())
                val view = uiManager?.resolveView(viewId.toInt()) as? YamapLiteView
                
                if (view != null) {
                    view.fitAllMarkers()
                    promise.resolve(null)
                } else {
                    promise.reject("YamapLite", "failed to get view")
                }
            } catch (e: Exception) {
                promise.reject("YamapLite", "failed to fit all markers", e)
            }
        }
    }

    override fun setZoom(viewId: Double, zoom: Double, duration: Double, animation: String, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                val uiManager = UIManagerHelper.getUIManager(reactApplicationContext, viewId.toInt())
                val view = uiManager?.resolveView(viewId.toInt()) as? YamapLiteView
                
                if (view != null) {
                    view.setZoom(zoom.toFloat(), duration.toInt(), animation)
                    promise.resolve(null)
                } else {
                    promise.reject("YamapLite", "failed to get view")
                }
            } catch (e: Exception) {
                promise.reject("YamapLite", "failed to set zoom", e)
            }
        }
    }

    override fun setCenter(viewId: Double, latitude: Double, longitude: Double, zoom: Double, azimuth: Double, tilt: Double, duration: Double, animation: String, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                val uiManager = UIManagerHelper.getUIManager(reactApplicationContext, viewId.toInt())
                val view = uiManager?.resolveView(viewId.toInt()) as? YamapLiteView
                
                if (view != null) {
                    view.setCenter(latitude, longitude, zoom.toFloat(), azimuth.toFloat(), tilt.toFloat(), duration.toInt(), animation)
                    promise.resolve(null)
                } else {
                    promise.reject("YamapLite", "failed to get view")
                }
            } catch (e: Exception) {
                promise.reject("YamapLite", "failed to set center", e)
            }
        }
    }
}