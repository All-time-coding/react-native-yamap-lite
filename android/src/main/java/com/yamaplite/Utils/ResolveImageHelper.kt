package com.yamaplite.utils

import com.yamaplite.utils.MarkerImageCache
import com.yandex.runtime.image.ImageProvider
import com.yandex.mapkit.map.PlacemarkMapObject
import android.util.Log
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Call
import okhttp3.Response
import java.io.IOException
import android.os.Handler
import android.os.Looper
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlin.coroutines.resume


class ResolveImageHelper {
    private val inProgressRequests = mutableMapOf<String, MutableList<PlacemarkMapObject>>()

    suspend fun resolveImage(context: Context, url: String, iconSize: Int): ImageProvider? = withContext(Dispatchers.IO) {
        var icon: ImageProvider? = null
        // 1. Проверка кэша - всегда ресайзим изображение из кэша под нужный размер
        MarkerImageCache.get(url)?.let { cachedBitmap ->
            Log.d("ImageLoader", "Loaded from cache: $url")
            val resizedBitmap = resizeBitmap(context, cachedBitmap, iconSize) ?: cachedBitmap
            return@withContext ImageProvider.fromBitmap(resizedBitmap)
        }

        // 2. Проверяем как ресурс Android (для React Native ассетов в res/drawable-*)
        val resId = context.resources.getIdentifier(url, "drawable", context.packageName)
        if (resId != 0) {
            try {
                val bmp = BitmapFactory.decodeResource(context.resources, resId)
                val resized = resizeBitmap(context, bmp, iconSize)
                MarkerImageCache.put(url, resized ?: bmp)
                Log.d("ImageLoader", "Loaded from resources: $url")
                return@withContext ImageProvider.fromBitmap(resized ?: bmp)
            } catch (e: Exception) {
                Log.e("ImageLoader", "Error loading from resources: $url", e)
            }
        }

        // 3. HTTP/HTTPS → асинхронно, ждем завершения через suspendCancellableCoroutine
        if (url.startsWith("http://") || url.startsWith("https://")) {
            Log.d("ImageLoader", "Loading from network: $url")
            val client = OkHttpClient.Builder()
                .retryOnConnectionFailure(true)
                .build()

            return@withContext suspendCancellableCoroutine { continuation ->
                val request = Request.Builder().url(url).build()
                client.newCall(request).enqueue(object : okhttp3.Callback {
                    override fun onFailure(call: Call, e: IOException) {
                        Log.e("ImageLoader", "Network load failed: $url", e)
                        synchronized(inProgressRequests) { inProgressRequests.remove(url) }
                        continuation.resume(null)
                    }

                    override fun onResponse(call: Call, response: Response) {
                        var bitmap: Bitmap? = null
                        try {
                            response.body?.byteStream()?.use { inputStream ->
                                try {
                                    bitmap = BitmapFactory.decodeStream(inputStream)?.let { resizeBitmap(context, it, iconSize) }
                                    bitmap?.let { MarkerImageCache.put(url, it) }
                                } catch (e: Exception) {
                                    Log.e("ImageLoader", "Error decoding image: $url", e)
                                } finally {
                                    response.close()
                                }
                            }
                        } catch (e: Exception) {
                            Log.e("ImageLoader", "Error processing response: $url", e)
                        }

                        val imageProvider = bitmap?.let { ImageProvider.fromBitmap(it) }
                        synchronized(inProgressRequests) { inProgressRequests.remove(url) }
                        continuation.resume(imageProvider)
                    }
                })
            }
        }
        
        return@withContext null
    }

    fun resizeBitmap(context: Context, bitmap: Bitmap?, targetSize: Int): Bitmap? {
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
}