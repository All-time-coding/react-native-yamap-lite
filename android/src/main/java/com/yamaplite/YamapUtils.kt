package com.yamaplite

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.UIManagerModule
import com.facebook.fbreact.specs.NativeYamapUtilsSpec
import com.yandex.mapkit.MapKitFactory

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

    override fun initWithKey(key: String, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            if(key.length <= 0) {
                promise.reject("YamapLite", "key is empty")
            }
            try {
                MapKitFactory.setApiKey(key)
                MapKitFactory.initialize(reactApplicationContext)
                promise.resolve(null)
            }
            catch (e: Exception) {
                promise.reject("YamapLite", "failed to initialize key", e)
            }
        }
    }
}