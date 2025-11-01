package com.yamaplite

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.PointF
import android.view.View
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.yandex.mapkit.geometry.Point
import com.yandex.mapkit.map.PlacemarkMapObject
import com.yandex.mapkit.mapview.MapView
import com.yandex.runtime.image.ImageProvider
import com.yandex.mapkit.map.IconStyle
import com.yandex.mapkit.map.RotationType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.InputStream
import java.net.URL
import okhttp3.Call
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import java.io.IOException
import com.yandex.mapkit.map.MapObjectTapListener
import com.yandex.mapkit.map.MapObject
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerModule
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.EventDispatcher
import com.facebook.react.uimanager.events.Event
import com.yamaplite.utils.MarkerImageCache

class YamapLiteMarkerView(context: Context) : View(context), MapObjectTapListener {
  var latitude: Double = 0.0
  var longitude: Double = 0.0
  private var iconSource: String? = null
  private var iconBitmap: Bitmap? = null
  var markerScale: Double = 1.0
  var zInd: Float = 0f
  var isVisibleFlag: Boolean = true
  var anchorX: Double = 0.5
  var anchorY: Double = 0.5
  private var _rotated: Boolean = false
  private var _handled: Boolean = false
  private var _size: Int = 25
  private var _childView: View? = null

  private var placemark: PlacemarkMapObject? = null
  private val coroutineScope = CoroutineScope(Dispatchers.Main)

  private val inProgressRequests = mutableMapOf<String, MutableList<PlacemarkMapObject>>()


  private val childLayoutListener =
  OnLayoutChangeListener { v, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom -> applyStyle() }

  fun setMarkerMapObject(obj: PlacemarkMapObject?) {
    placemark = obj
    placemark?.userData = this
    placemark?.addTapListener(this)
    applyStyle()
  }

  fun addToMap(mapView: MapView) {
    if (placemark != null) {
      placemark?.addTapListener(this)
    }
    val point = Point(latitude, longitude)
    placemark = mapView.mapWindow.map.mapObjects.addPlacemark(point)
    placemark?.userData = this
    placemark?.addTapListener(this)
    applyStyle()
  }

  fun removeFromMap(mapView: MapView) {
    placemark?.let {
      mapView.mapWindow.map.mapObjects.remove(it)
      placemark = null
    }
  }

  fun setPoint(lat: Double, lon: Double) {
    latitude = lat
    longitude = lon
    placemark?.geometry = Point(lat, lon)
  }

  fun setIconSource(name: String?) {
    iconSource = name
    applyStyle()
  }
  
  private fun loadImageFromUrl(urlString: String) {
    coroutineScope.launch {
      try {
        val bitmap = withContext(Dispatchers.IO) {
          val url = URL(urlString)
          val connection = url.openConnection()
          connection.connectTimeout = 5000
          connection.readTimeout = 5000
          connection.connect()
          connection.getInputStream().use { inputStream ->
            BitmapFactory.decodeStream(inputStream)
          }
        }
        // Apply size to loaded bitmap
        iconBitmap = resizeBitmap(bitmap, _size) ?: bitmap
        applyStyle()
      } catch (e: Exception) {
        android.util.Log.e("YamapLiteMarkerView", "Failed to load image from URL: $urlString", e)
        iconBitmap = null
        applyStyle()
      }
    }
  }

  fun setScale(value: Double) {
    markerScale = value
    applyStyle()
  }

  fun setZInd(value: Int) {
    zInd = value.toFloat()
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

  fun setRotated(value: Boolean) {
    _rotated = value
    applyStyle()
  }

  fun setHandled(value: Boolean) {
    _handled = value
  }
  
  fun getRotated(): Boolean = _rotated
  
  fun getHandled(): Boolean = _handled

  private fun resizeBitmap(bitmap: Bitmap?, targetSize: Int): Bitmap? {
    if (bitmap == null || targetSize <= 0) return bitmap
    
    // Convert dp to pixels based on screen density
    val density = context.resources.displayMetrics.density
    val targetSizePx = (targetSize * density).toInt()
    
    val width = bitmap.width
    val height = bitmap.height
    
    if (width == targetSizePx && height == targetSizePx) return bitmap
    
    val scale = targetSizePx.toFloat() / width.coerceAtLeast(height).toFloat()
    val scaledWidth = (width * scale).toInt()
    val scaledHeight = (height * scale).toInt()
    
    return Bitmap.createScaledBitmap(bitmap, scaledWidth, scaledHeight, true)
  }

  fun setSize(value: Int) {
    _size = value
    applyStyle()
  }

  fun setChildView(view: View?) {
    if (view == null) {
        _childView!!.removeOnLayoutChangeListener(childLayoutListener)
        _childView = null
        applyStyle()
        return
    }
    _childView = view
    _childView!!.addOnLayoutChangeListener(childLayoutListener)
  }

  private fun loadImageAndSetIcon(url: String, iconSize: Int, iconStyle: IconStyle) {
    val mapObject = placemark
    
    // 1. Проверка кэша - всегда ресайзим изображение из кэша под нужный размер
    MarkerImageCache.get(url)?.let { cachedBitmap ->
        Log.d("ImageLoader", "Loaded from cache: $url")
        val resizedBitmap = resizeBitmap(cachedBitmap, iconSize) ?: cachedBitmap
        val icon = ImageProvider.fromBitmap(resizedBitmap)
        if (mapObject != null && mapObject.isValid) {
            mapObject.setIcon(icon)
            mapObject.setIconStyle(iconStyle)
        }
        return
    }

    // 2. Проверяем как ресурс Android (для React Native ассетов в res/drawable-*)
    val resId = context.resources.getIdentifier(url, "drawable", context.packageName)
    if (resId != 0) {
        try {
            val bmp = BitmapFactory.decodeResource(context.resources, resId)
            val resized = resizeBitmap(bmp, iconSize)
            MarkerImageCache.put(url, resized ?: bmp)
            val icon = ImageProvider.fromBitmap(resized ?: bmp)
            if (mapObject != null && mapObject.isValid) {
                mapObject.setIcon(icon)
                mapObject.setIconStyle(iconStyle)
            }
            Log.d("ImageLoader", "Loaded from resources: $url")
            return
        } catch (e: Exception) {
            Log.e("ImageLoader", "Error loading from resources: $url", e)
        }
    }

    // 3. HTTP/HTTPS → асинхронно
    if (url.startsWith("http://") || url.startsWith("https://")) {
        synchronized(inProgressRequests) {
            val list = inProgressRequests[url]
            if (list != null) {
                mapObject?.let { list.add(it) }
                return
            } else {
                mapObject?.let { inProgressRequests[url] = mutableListOf(it) }
            }
        }

        Log.d("ImageLoader", "Loading from network: $url")
        val client = OkHttpClient.Builder()
            .retryOnConnectionFailure(true)
            .build()

        val request = Request.Builder().url(url).build()
        client.newCall(request).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e("ImageLoader", "Network load failed: $url", e)
                synchronized(inProgressRequests) { inProgressRequests.remove(url) }
            }

            override fun onResponse(call: Call, response: Response) {
                var bitmap: Bitmap? = null
                response.body?.byteStream()?.use { inputStream ->
                    try {
                        bitmap = BitmapFactory.decodeStream(inputStream)?.let { resizeBitmap(it, iconSize) }
                        bitmap?.let { MarkerImageCache.put(url, it) }
                    } catch (e: Exception) {
                        Log.e("ImageLoader", "Error decoding image: $url", e)
                    } finally {
                        response.close()
                    }
                }

                bitmap?.let { bmp ->
                    val icon = ImageProvider.fromBitmap(bmp)
                    val waitingList = synchronized(inProgressRequests) { inProgressRequests.remove(url) }
                    waitingList?.forEach { mo ->
                        Handler(Looper.getMainLooper()).post {
                            if (mo.isValid) {
                                mo.setIcon(icon)
                                mo.setIconStyle(iconStyle)
                            }
                        }
                    }
                }
            }
        })
        return
    }
    Log.w("ImageLoader", "Unsupported URL scheme: $url")
  }

  private fun applyStyle() {
    if (placemark != null && placemark!!.isValid) {
      val iconStyle = IconStyle()
      iconStyle.setScale(markerScale.toFloat())
      iconStyle.setRotationType(if (_rotated) RotationType.ROTATE else RotationType.NO_ROTATION)
      iconStyle.setVisible(isVisibleFlag)
      iconStyle.setAnchor(PointF(anchorX.toFloat(), anchorY.toFloat()))
      (placemark as PlacemarkMapObject).geometry = Point(latitude, longitude)
      (placemark as PlacemarkMapObject).zIndex = zInd.toFloat()
      (placemark as PlacemarkMapObject).setIconStyle(iconStyle)

      if (_childView != null) {
        try {
          val b = Bitmap.createBitmap(
            _childView!!.width, _childView!!.height, Bitmap.Config.ARGB_8888
          )
          val c = Canvas(b)
          _childView!!.draw(c)
          // Изменяем размер изображения используя iconSize как ширину
          val resizedBitmap = resizeBitmap(b, _size)
          (placemark as PlacemarkMapObject).setIcon(ImageProvider.fromBitmap(resizedBitmap))
          (placemark as PlacemarkMapObject).setIconStyle(iconStyle)
        } catch (e: Exception) {
          e.printStackTrace()
        }
      }
      if (_childView == null && iconSource?.isNotEmpty() == true) {
        loadImageAndSetIcon(iconSource!!, _size, iconStyle)
      }
    }
  }

  override fun onMapObjectTap(p0: MapObject, p1: Point): Boolean {
    val reactContext = context as? ReactContext
    if (reactContext == null) {
      return _handled
    }
    
    val viewId = getId()
    val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, viewId)
    
    if (eventDispatcher != null) {
      val eventData = Arguments.createMap().apply {
        putDouble("lat", p1.latitude)
        putDouble("lon", p1.longitude)
      }
      val event = PressEvent(viewId, eventData)
      eventDispatcher.dispatchEvent(event)
    }
    return _handled
  }
  
  private class PressEvent(viewTag: Int, private val eventData: WritableMap?) : Event<PressEvent>(viewTag) {
    override fun getEventName(): String {
      return "onMarkerPress"
    }
    override fun getEventData(): WritableMap? {
      return eventData
    }
    override fun getCoalescingKey(): Short {
      return 0
    }
  }
}