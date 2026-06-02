package com.yamaplite

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager
import com.yamaplite.utils.YamapUtils

class YamapLiteViewPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
          when (name) {
            NativeYamapUtilsSpec.NAME -> YamapUtils(reactContext)
            else -> null
          }

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
            NativeYamapUtilsSpec.NAME to
                    ReactModuleInfo(
                            NativeYamapUtilsSpec.NAME,
                            NativeYamapUtilsSpec.NAME,
                            false,
                            false,
                            false,
                            true
                    )
    )
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
          listOf<ViewManager<*, *>>(
                  YamapLiteViewManager(),
                  YamapLiteMarkerViewManager(),
                  YamapLiteCircleViewManager(),
                  YamapLitePolylineViewManager(),
                  YamapLitePolygonViewManager(),
                  ClusteredYamapLiteViewManager()
          )
}
