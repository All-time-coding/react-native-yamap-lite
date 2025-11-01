package com.yamaplite.utils

import android.graphics.Bitmap
import android.util.LruCache
import java.lang.Runtime

object MarkerImageCache {

  private val cacheSize = 50 * 1024 // 50 МБ в КБ

  private val memoryCache: LruCache<String, Bitmap> = object : LruCache<String, Bitmap>(cacheSize) {
    override fun sizeOf(key: String, value: Bitmap): Int {
      return value.byteCount / 1024 // размер в КБ
    }
  }

  /** Получить Bitmap из кэша по URL */
  fun get(url: String): Bitmap? {
    return memoryCache.get(url)
  }

  /** Положить Bitmap в кэш по URL */
  fun put(url: String, bitmap: Bitmap) {
    memoryCache.put(url, bitmap)
  }

  /** Проверка наличия Bitmap в кэше */
  fun contains(url: String): Boolean {
    return memoryCache.get(url) != null
  }

  /** Очистить весь кэш */
  fun clear() {
    memoryCache.evictAll()
  }
}
