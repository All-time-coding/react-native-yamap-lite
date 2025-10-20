package com.yamaplite.Components

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.PointF
import android.util.AttributeSet
import android.view.View
import com.facebook.react.bridge.ReadableMap

class Circle : View {
    private var fillColor: Int = 0x00000000
    private var strokeColor: Int = 0xFF000000.toInt()
    private var strokeWidth: Float = 1f
    private var center: PointF? = null
    private var radius: Float = 0f
    private var handled: Boolean = false

    private val fillPaint = Paint().apply {
        style = Paint.Style.FILL
        isAntiAlias = true
    }

    private val strokePaint = Paint().apply {
        style = Paint.Style.STROKE
        isAntiAlias = true
    }

    constructor(context: Context?) : super(context)
    constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs)
    constructor(context: Context?, attrs: AttributeSet?, defStyleAttr: Int) : super(
        context,
        attrs,
        defStyleAttr
    )

    fun setFillColor(color: Int?) {
        fillColor = color ?: 0x00000000
        fillPaint.color = fillColor
        invalidate()
    }

    fun setStrokeColor(color: Int?) {
        strokeColor = color ?: 0xFF000000.toInt()
        strokePaint.color = strokeColor
        invalidate()
    }

    fun setStrokeWidth(width: Float) {
        strokeWidth = width
        strokePaint.strokeWidth = strokeWidth
        invalidate()
    }

    fun setCenter(center: ReadableMap?) {
        if (center != null) {
            val lat = center.getDouble("lat").toFloat()
            val lon = center.getDouble("lon").toFloat()
            this.center = PointF(lat, lon)
            invalidate()
        }
    }

    fun setRadius(radius: Float) {
        this.radius = radius
        invalidate()
    }

    fun setHandled(handled: Boolean) {
        this.handled = handled
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        
        if (center != null && radius > 0) {
            val centerX = width / 2f
            val centerY = height / 2f
            
            // Рисуем заливку
            if (fillColor != 0x00000000) {
                canvas.drawCircle(centerX, centerY, radius, fillPaint)
            }
            
            // Рисуем обводку
            if (strokeWidth > 0) {
                canvas.drawCircle(centerX, centerY, radius, strokePaint)
            }
        }
    }
}