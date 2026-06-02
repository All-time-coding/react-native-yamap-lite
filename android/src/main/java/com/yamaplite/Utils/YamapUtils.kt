package com.yamaplite.utils

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.UIManagerHelper
import com.yamaplite.NativeYamapUtilsSpec
import com.yamaplite.components.YamapLiteView
import com.yandex.mapkit.MapKitFactory
import com.yandex.runtime.i18n.I18nManagerFactory

@ReactModule(name = NativeYamapUtilsSpec.NAME)
class YamapUtils(reactContext: ReactApplicationContext) : NativeYamapUtilsSpec(reactContext) {

    private fun withView(viewId: Double, promise: Promise, action: (YamapLiteView) -> Unit) {
        UiThreadUtil.runOnUiThread {
            try {
                val uiManager =
                        UIManagerHelper.getUIManager(getReactApplicationContext(), viewId.toInt())
                val view = uiManager?.resolveView(viewId.toInt()) as? YamapLiteView
                if (view != null) {
                    action(view)
                } else {
                    promise.reject("YamapLite", "failed to get view")
                }
            } catch (e: Exception) {
                promise.reject("YamapLite", "failed to resolve view", e)
            }
        }
    }

    override fun getCameraPosition(viewId: Double, promise: Promise) =
            withView(viewId, promise) { view ->
                val cameraPosition = view.getCameraPosition()
                if (cameraPosition != null) {
                    promise.resolve(cameraPosition)
                } else {
                    promise.reject("YamapLite", "failed to get camera position")
                }
            }

    override fun getMapObjectCount(viewId: Double, promise: Promise) =
            withView(viewId, promise) { view ->
                promise.resolve(view.getMapObjectCount().toDouble())
            }

    override fun getScreenPoints(viewId: Double, points: ReadableArray, promise: Promise) =
            withView(viewId, promise) { view ->
                val screenPoints = view.getScreenPoints(PointParser.parsePoints(points))
                promise.resolve(Arguments.createMap().apply { putArray("points", screenPoints) })
            }

    override fun getVisibleRegion(viewId: Double, promise: Promise) =
            withView(viewId, promise) { view ->
                val visibleRegion = view.getVisibleRegion()
                if (visibleRegion != null) {
                    promise.resolve(visibleRegion)
                } else {
                    promise.reject("YamapLite", "failed to get visible region")
                }
            }

    override fun fitAllMarkers(viewId: Double, promise: Promise) =
            withView(viewId, promise) { view ->
                view.fitAllMarkers()
                promise.resolve(null)
            }

    override fun setZoom(
            viewId: Double,
            zoom: Double,
            duration: Double,
            animation: String,
            promise: Promise
    ) =
            withView(viewId, promise) { view ->
                view.setZoom(zoom.toFloat(), duration.toInt(), animation)
                promise.resolve(null)
            }

    override fun setCenter(
            viewId: Double,
            latitude: Double,
            longitude: Double,
            zoom: Double,
            azimuth: Double,
            tilt: Double,
            duration: Double,
            animation: String,
            promise: Promise
    ) =
            withView(viewId, promise) { view ->
                view.setCenter(
                        latitude,
                        longitude,
                        zoom.toFloat(),
                        azimuth.toFloat(),
                        tilt.toFloat(),
                        duration.toInt(),
                        animation
                )
                promise.resolve(null)
            }

    override fun getWorldPoints(viewId: Double, points: ReadableArray, promise: Promise) =
            withView(viewId, promise) { view ->
                val worldPoints = view.getWorldPoints(PointParser.parseScreenPoints(points))
                promise.resolve(Arguments.createMap().apply { putArray("points", worldPoints) })
            }

    override fun init(apiKey: String, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                if (!isInitialized) {
                    MapKitFactory.setApiKey(apiKey)
                    MapKitFactory.initialize(getReactApplicationContext())
                    isInitialized = true
                }
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("YamapLite", "failed to init MapKit", e)
            }
        }
    }

    override fun getLocale(promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                val locale = I18nManagerFactory.getLocale()
                if (locale != null) {
                    promise.resolve(locale)
                } else {
                    promise.reject("YamapLite", "failed to get locale")
                }
            } catch (e: Exception) {
                promise.reject("YamapLite", "failed to get locale", e)
            }
        }
    }

    override fun setLocale(locale: String, promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                I18nManagerFactory.setLocale(locale)
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("YamapLite", "failed to set locale", e)
            }
        }
    }

    override fun resetLocale(promise: Promise) {
        UiThreadUtil.runOnUiThread {
            try {
                I18nManagerFactory.setLocale(null)
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("YamapLite", "failed to reset locale", e)
            }
        }
    }

    companion object {
        @Volatile private var isInitialized = false
    }
}
