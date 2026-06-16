import { useLayoutEffect } from 'react'
import type { RefObject } from 'react'

const maxVisibleTextareaLines = 10.5
const fallbackLineHeightRatio = 1.2

export function useAutoGrowTextarea(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
) {
  useLayoutEffect(() => {
    const textarea = textareaRef.current

    if (!textarea) {
      return
    }

    const computedStyle = window.getComputedStyle(textarea)
    const lineHeight = getLineHeight(computedStyle)
    const verticalPadding =
      getPixelValue(computedStyle.paddingTop) +
      getPixelValue(computedStyle.paddingBottom)
    const minimumHeight =
      getPixelValue(computedStyle.minHeight) ||
      textarea.offsetHeight ||
      textarea.clientHeight
    const maxHeight = lineHeight * maxVisibleTextareaLines + verticalPadding

    textarea.style.height = 'auto'

    const nextHeight = value
      ? Math.max(minimumHeight, Math.min(textarea.scrollHeight, maxHeight))
      : minimumHeight
    const isScrollable = value ? textarea.scrollHeight > maxHeight : false

    textarea.style.height = `${formatPixelValue(nextHeight)}px`
    textarea.style.overflowY = isScrollable ? 'auto' : 'hidden'
    textarea.scrollTop = textarea.scrollHeight
  }, [textareaRef, value])
}

function getLineHeight(computedStyle: CSSStyleDeclaration) {
  const explicitLineHeight = getPixelValue(computedStyle.lineHeight)

  if (explicitLineHeight > 0) {
    return explicitLineHeight
  }

  return getPixelValue(computedStyle.fontSize) * fallbackLineHeightRatio
}

function getPixelValue(value: string) {
  const parsedValue = Number.parseFloat(value)

  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function formatPixelValue(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)))
}
