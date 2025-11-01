package com.yamaplite.utils

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.UIManagerModule
import com.facebook.fbreact.specs.NativeYamapUtilsSpec
import com.yamaplite.YamapLiteView

@ReactModule(name = NativeYamapUtilsSpec.NAME)
class YamapUtils(reactContext: ReactApplicationContext): NativeYamapUtilsSpec(reactContext) {
    override fun getCameraPosition(viewId: Double, promise: Promise) { 
        UiThreadUtil.runOnUiThread {
            try {
                val uiManager = reactApplicationContext.getNativeModule(UIManagerModule::class.java)
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

    override fun fitAllMarkers(viewId: Double, points: ReadableArray, promise: Promise) {
        promise.reject("YamapLite", "fitAllMarkers not implemented")
    }
}