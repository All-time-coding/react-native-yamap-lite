package com.yamaplite.utils

import com.yamaplite.utils.ImageCache
import com.yandex.runtime.image.ImageProvider
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

    companion object {
        private val httpClient: OkHttpClient by lazy {
            OkHttpClient.Builder()
                .retryOnConnectionFailure(true)
                .build()
        }

        @Volatile private var instance: ResolveImageHelper? = null

        fun getInstance(): ResolveImageHelper =
            instance ?: synchronized(this) {
                instance ?: ResolveImageHelper().also { instance = it }
            }
    }

    suspend fun resolveImage(context: Context, url: String, iconSize: Int): ImageProvider? = withContext(Dispatchers.IO) {
        // 1. Проверка кэша - всегда ресайзим изображение из кэша под нужный размер
        Log.d("ImageLoader", "Checking cache for: $url")
        ImageCache.get(url)?.let { cachedBitmap ->
            Log.d("ImageLoader", "Loaded from cache: $url")
            val resizedBitmap = resizeBitmap(context, cachedBitmap, iconSize) ?: cachedBitmap
            return@withContext ImageProvider.fromBitmap(resizedBitmap)
        }
        Log.d("ImageLoader", "Cache miss, trying other sources for: $url")

        // 2. Проверяем как ресурс Android (для React Native ассетов в res/drawable-*)
        val resId = context.resources.getIdentifier(url, "drawable", context.packageName)
        if (resId != 0) {
            try {
                val bmp = BitmapFactory.decodeResource(context.resources, resId)
                val resized = resizeBitmap(context, bmp, iconSize)
                ImageCache.put(url, resized ?: bmp)
                Log.d("ImageLoader", "Loaded from resources: $url")
                return@withContext ImageProvider.fromBitmap(resized ?: bmp)
            } catch (e: Exception) {
                Log.e("ImageLoader", "Error loading from resources: $url", e)
            }
        }

        // 3. HTTP/HTTPS → асинхронно, ждем завершения через suspendCancellableCoroutine
        if (url.startsWith("http://") || url.startsWith("https://")) {
            Log.d("ImageLoader", "Loading from network: $url")

            return@withContext suspendCancellableCoroutine { continuation ->
                val request = Request.Builder().url(url).build()
                val call = httpClient.newCall(request)
                continuation.invokeOnCancellation { call.cancel() }
                call.enqueue(object : okhttp3.Callback {
                    override fun onFailure(call: Call, e: IOException) {
                        Log.e("ImageLoader", "Network load failed: $url", e)
                        continuation.resume(null)
                    }

                    override fun onResponse(call: Call, response: Response) {
                        var bitmap: Bitmap? = null
                        try {
                            response.body?.byteStream()?.use { inputStream ->
                                try {
                                    bitmap = BitmapFactory.decodeStream(inputStream)?.let { resizeBitmap(context, it, iconSize) }
                                    bitmap?.let { ImageCache.put(url, it) }
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