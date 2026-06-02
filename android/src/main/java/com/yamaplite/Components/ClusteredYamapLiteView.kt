package com.yamaplite.components

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.view.View
import com.yandex.mapkit.geometry.Point
import com.yandex.mapkit.map.Cluster
import com.yandex.mapkit.map.ClusterListener
import com.yandex.mapkit.map.ClusterTapListener
import com.yandex.mapkit.map.ClusterizedPlacemarkCollection
import com.yandex.mapkit.map.IconStyle
import com.yandex.mapkit.map.PlacemarkMapObject
import com.yandex.runtime.image.ImageProvider
import kotlin.math.abs
import kotlin.math.sqrt

class ClusteredYamapLiteView(context: Context) :
        YamapLiteView(context), ClusterListener, ClusterTapListener {
  private var clusterCollection: ClusterizedPlacemarkCollection
  private var clusterColor = Color.RED
  private val placemarksMap: HashMap<String?, PlacemarkMapObject?> =
          HashMap<String?, PlacemarkMapObject?>()
  private var pointsList = ArrayList<Point>()

  init {
    clusterCollection = mapView.mapWindow.map.mapObjects.addClusterizedPlacemarkCollection(this)
  }

  fun setClusteredMarkers(points: List<Point>) {
    pointsList = ArrayList(points)
    rebuildClusterPlacemarks()
  }

  fun setClusterColor(color: Int) {
    clusterColor = color
    rebuildClusterPlacemarks()
  }

  private fun rebuildClusterPlacemarks() {
    clusterCollection.clear()
    placemarksMap.clear()
    val placemarks = clusterCollection.addPlacemarks(pointsList, TextImageProvider(""), IconStyle())
    val childCount = super.getReactChildCount()
    for (i in placemarks.indices) {
      val placemark = placemarks[i]
      val geometry = placemark.geometry
      placemarksMap[geometryKey(geometry.latitude, geometry.longitude)] = placemark
      if (i < childCount) {
        val child = super.getReactChildAt(i)
        if (child is YamapLiteMarkerView) {
          child.setMarkerMapObject(placemark)
        }
      }
    }
    clusterCollection.clusterPlacemarks(50.0, 12)
  }

  private fun geometryKey(lat: Double, lon: Double): String = "$lat,$lon"

  fun addChild(child: View, index: Int) {
    if (child is YamapLiteMarkerView) {
      addReactChildToList(child, index)
      val placemark = placemarksMap[geometryKey(child.latitude, child.longitude)]
      if (placemark != null) {
        child.setMarkerMapObject(placemark)
      }
    } else {
      super.addReactChild(child, index)
    }
  }

  fun removeChild(index: Int) {
    if (index < 0 || index >= super.getReactChildCount()) {
      return
    }
    val child = super.getReactChildAt(index)
    if (child is YamapLiteMarkerView) {
      val clusterPlacemark = placemarksMap.remove(geometryKey(child.latitude, child.longitude))
      if (clusterPlacemark != null && clusterPlacemark.isValid) {
        clusterCollection.remove(clusterPlacemark)
      }
      removeReactChildFromListAt(index)
    } else {
      super.removeReactChildAt(index)
    }
  }

  override fun onClusterAdded(cluster: Cluster) {
    cluster.appearance.setIcon(TextImageProvider(cluster.size.toString()))
    cluster.addClusterTapListener(this)
  }

  override fun onClusterTap(cluster: Cluster): Boolean {
    val points = ArrayList<Point?>()
    for (placemark in cluster.placemarks) {
      points.add(placemark.geometry)
    }
    super.fitMarkers(points)
    return true
  }

  private inner class TextImageProvider(private val text: String) : ImageProvider() {
    override fun getId(): String {
      return "text_$text"
    }

    override fun getImage(): Bitmap {
      // Scale sizes by display density to match iOS (which uses points that scale automatically)
      val density = this@ClusteredYamapLiteView.context.resources.displayMetrics.density
      val scaledFontSize = Companion.FONT_SIZE * density
      val scaledMarginSize = Companion.MARGIN_SIZE * density
      val scaledStrokeSize = Companion.STROKE_SIZE * density

      val textPaint = Paint()
      textPaint.textSize = scaledFontSize
      textPaint.textAlign = Paint.Align.CENTER
      textPaint.style = Paint.Style.FILL
      textPaint.isAntiAlias = true

      val widthF = textPaint.measureText(text)
      val textMetrics = textPaint.fontMetrics
      val heightF = (abs(textMetrics.bottom.toDouble()) + abs(textMetrics.top.toDouble())).toFloat()
      val textRadius = sqrt((widthF * widthF + heightF * heightF).toDouble()).toFloat() / 2
      val internalRadius = textRadius + scaledMarginSize
      val externalRadius = internalRadius + scaledStrokeSize

      val width = (2 * externalRadius + 0.5).toInt()

      val bitmap = Bitmap.createBitmap(width, width, Bitmap.Config.ARGB_8888)
      val canvas = Canvas(bitmap)

      val backgroundPaint = Paint()
      backgroundPaint.isAntiAlias = true
      backgroundPaint.color = clusterColor
      canvas.drawCircle(
              (width / 2).toFloat(),
              (width / 2).toFloat(),
              externalRadius,
              backgroundPaint
      )

      backgroundPaint.color = Color.WHITE
      canvas.drawCircle(
              (width / 2).toFloat(),
              (width / 2).toFloat(),
              internalRadius,
              backgroundPaint
      )

      canvas.drawText(
              text,
              (width / 2).toFloat(),
              width / 2 - (textMetrics.ascent + textMetrics.descent) / 2,
              textPaint
      )

      return bitmap
    }
  }

  companion object {
    private const val FONT_SIZE = 45f
    private const val MARGIN_SIZE = 9f
    private const val STROKE_SIZE = 9f
  }
}
