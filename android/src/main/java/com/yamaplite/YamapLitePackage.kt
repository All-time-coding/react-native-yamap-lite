package com.yamaplite

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import java.util.ArrayList

class YamapLiteViewPackage : ReactPackage {
  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return listOf(
      YamapLiteViewManager() as ViewManager<*, *>,
      YamapLiteCircleViewManager() as ViewManager<*, *>
    )
  }

  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(YamapUtils(reactContext) as NativeModule)
  }
}
