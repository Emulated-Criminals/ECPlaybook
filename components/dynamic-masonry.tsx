'use client'

import React, { Children, useLayoutEffect, useRef } from 'react'

interface DynamicMasonryProps {
  children: React.ReactNode
  className?: string
  gap?: number
}

const getColumnCount = (width: number) => {
  if (width >= 1024) return 3
  if (width >= 768) return 2
  return 1
}

// Keeps first row order, then packs remaining items into shortest columns.
export function DynamicMasonry({ children, className = '', gap = 16 }: DynamicMasonryProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  const updateLayout = () => {
    const container = containerRef.current
    if (!container) return

    const items = itemsRef.current.filter(Boolean) as HTMLDivElement[]
    if (items.length === 0) {
      container.style.height = '0px'
      return
    }

    const width = container.clientWidth
    const columns = getColumnCount(width)
    const columnWidth = (width - gap * (columns - 1)) / columns
    const heights = new Array(columns).fill(0)
    const columnItems: HTMLDivElement[][] = Array.from({ length: columns }, () => [])

    // Reset sizing before measuring
    items.forEach((el) => {
      el.style.position = 'absolute'
      el.style.width = `${columnWidth}px`
      el.style.height = ''
    })

    // Assign items to columns (first row in order, rest to shortest column group)
    let firstRowCursor = 0
    let placingFirstRow = true
    items.forEach((el, index) => {
      const spanAttr = el.dataset.span
      let span = spanAttr ? parseInt(spanAttr, 10) : 1
      if (!Number.isFinite(span) || span < 1) span = 1
      if (span > columns) span = columns

      let startColumn = 0
      if (placingFirstRow) {
        if (firstRowCursor + span > columns) {
          placingFirstRow = false
        } else {
          startColumn = firstRowCursor
          firstRowCursor += span
        }
      }

      if (!placingFirstRow) {
        let bestStart = 0
        let bestHeight = Number.POSITIVE_INFINITY
        for (let i = 0; i <= columns - span; i++) {
          const groupHeight = Math.max(...heights.slice(i, i + span))
          if (groupHeight < bestHeight) {
            bestHeight = groupHeight
            bestStart = i
          }
        }
        startColumn = bestStart
      }

      for (let i = startColumn; i < startColumn + span; i++) {
        columnItems[i].push(el)
      }

      el.style.width = `${columnWidth * span + gap * (span - 1)}px`

      const itemHeight = el.getBoundingClientRect().height
      const top = Math.max(...heights.slice(startColumn, startColumn + span))
      const offsetTop = top === 0 ? 0 : top + gap
      for (let i = startColumn; i < startColumn + span; i++) {
        heights[i] = offsetTop + itemHeight
      }

      const left = startColumn * (columnWidth + gap)
      el.style.left = `${left}px`
      el.style.top = `${offsetTop}px`
    })

    const maxHeight = Math.max(...heights)

    // Add extra space to the last card in shorter columns to keep gaps unchanged
    const extraByElement = new Map<HTMLDivElement, number>()
    columnItems.forEach((colItems, colIndex) => {
      const extra = maxHeight - heights[colIndex]
      if (extra <= 0 || colItems.length === 0) return
      const last = colItems[colItems.length - 1]
      const current = extraByElement.get(last) || 0
      extraByElement.set(last, Math.max(current, extra))
    })

    extraByElement.forEach((extra, el) => {
      const baseHeight = el.getBoundingClientRect().height
      el.style.height = `${baseHeight + extra}px`
    })

    // Reposition items with adjusted heights
    const finalHeights = new Array(columns).fill(0)
    items.forEach((el) => {
      const spanAttr = el.dataset.span
      let span = spanAttr ? parseInt(spanAttr, 10) : 1
      if (!Number.isFinite(span) || span < 1) span = 1
      if (span > columns) span = columns

      const left = parseFloat(el.style.left || '0')
      const startColumn = Math.round(left / (columnWidth + gap))
      const top = Math.max(...finalHeights.slice(startColumn, startColumn + span))
      const offsetTop = top === 0 ? 0 : top + gap
      el.style.top = `${offsetTop}px`
      const height = el.getBoundingClientRect().height
      for (let i = startColumn; i < startColumn + span; i++) {
        finalHeights[i] = offsetTop + height
      }
    })

    container.style.height = `${Math.max(...finalHeights)}px`
  }

  useLayoutEffect(() => {
    updateLayout()

    const observers: ResizeObserver[] = []

    const container = containerRef.current
    if (container) {
      const containerObserver = new ResizeObserver(updateLayout)
      containerObserver.observe(container)
      observers.push(containerObserver)
    }

    itemsRef.current.forEach((el) => {
      if (!el) return
      const observer = new ResizeObserver(updateLayout)
      observer.observe(el)
      observers.push(observer)
    })

    const handleResize = () => updateLayout()
    window.addEventListener('resize', handleResize)

    return () => {
      observers.forEach((obs) => obs.disconnect())
      window.removeEventListener('resize', handleResize)
    }
  }, [children])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {Children.map(children, (child, index) => (
        <div ref={(el) => (itemsRef.current[index] = el)}>{child}</div>
      ))}
    </div>
  )
}
