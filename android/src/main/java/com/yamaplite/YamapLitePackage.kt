package com.yamaplite

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.yamaplite.utils.YamapUtils
import java.util.ArrayList

class YamapLiteViewPackage : ReactPackage {
  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return listOf(
      YamapLiteViewManager() as ViewManager<*, *>,
      YamapLiteMarkerViewManager() as ViewManager<*, *>
    )
  }

  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(YamapUtils(reactContext) as NativeModule)
  }
}
