package com.yamaplite

import android.content.Context
import android.view.View
import com.yandex.mapkit.geometry.Point
import com.yandex.mapkit.map.PlacemarkMapObject
import com.yandex.mapkit.mapview.MapView
import com.yandex.runtime.image.ImageProvider
import com.yandex.mapkit.map.IconStyle

class YamapLiteMarkerView(context: Context) : View(context) {
  var latitude: Double = 0.0
  var longitude: Double = 0.0
  var iconName: String? = null
  var markerScale: Double = 1.0
  var zIndex: Float = 0f
  var isVisibleFlag: Boolean = true
  var anchorX: Double = 0.5
  var anchorY: Double = 0.5

  private var placemark: PlacemarkMapObject? = null

  fun addToMap(mapView: MapView) {
    if (placemark != null) return
    val point = Point(latitude, longitude)
    val provider = iconName?.let { ImageProvider.fromAsset(mapView.context, it) }
    placemark = if (provider != null) {
      mapView.getMapWindow().map.mapObjects.addPlacemark(point, provider)
    } else {
      mapView.getMapWindow().map.mapObjects.addPlacemark(point)
    }
    applyStyle()
    placemark?.isVisible = isVisibleFlag
  }

  fun removeFromMap(mapView: MapView) {
    placemark?.let {
      mapView.map.mapObjects.remove(it)
      placemark = null
    }
  }

  fun setPoint(lat: Double, lon: Double) {
    latitude = lat
    longitude = lon
    placemark?.geometry = Point(lat, lon)
  }

  fun setIconSource(name: String?) {
    iconName = name
    placemark?.let { pm ->
      val provider = name?.let { ImageProvider.fromAsset(context, it) }
      if (provider != null) pm.setIcon(provider)
    }
  }

  fun setScale(value: Double) {
    markerScale = value
    applyStyle()
  }

  fun setZIndex(value: Int) {
    zIndex = value.toFloat()
    applyStyle()
  }

  fun setVisible(value: Boolean) {
    isVisibleFlag = value
    placemark?.isVisible = value
  }

  fun setAnchor(x: Double, y: Double) {
    anchorX = x
    anchorY = y
    applyStyle()
  }

  private fun applyStyle() {}
}


