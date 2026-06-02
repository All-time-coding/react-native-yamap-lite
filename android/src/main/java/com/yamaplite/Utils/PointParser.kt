package com.yamaplite.utils

import com.facebook.react.bridge.ReadableArray
import com.yandex.mapkit.ScreenPoint
import com.yandex.mapkit.geometry.Point

object PointParser {

  fun parsePoints(points: ReadableArray?): ArrayList<Point> {
    val result = ArrayList<Point>()
    if (points == null) return result
    for (i in 0 until points.size()) {
      val map = points.getMap(i) ?: continue
      if (!map.hasKey("lat") || !map.hasKey("lon")) continue
      result.add(Point(map.getDouble("lat"), map.getDouble("lon")))
    }
    return result
  }

  fun parseRings(rings: ReadableArray?): ArrayList<ArrayList<Point>> {
    val result = ArrayList<ArrayList<Point>>()
    if (rings == null) return result
    for (i in 0 until rings.size()) {
      result.add(parsePoints(rings.getArray(i)))
    }
    return result
  }

  fun parseScreenPoints(points: ReadableArray?): ArrayList<ScreenPoint?> {
    val result = ArrayList<ScreenPoint?>()
    if (points == null) return result
    for (i in 0 until points.size()) {
      val map = points.getMap(i) ?: continue
      if (!map.hasKey("x") || !map.hasKey("y")) continue
      result.add(ScreenPoint(map.getDouble("x").toFloat(), map.getDouble("y").toFloat()))
    }
    return result
  }
}
