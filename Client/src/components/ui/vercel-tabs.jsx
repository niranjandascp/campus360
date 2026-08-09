"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef(
  ({ className, tabs, activeTab, onTabChange, ...props }, ref) => {
    const [hoveredIndex, setHoveredIndex] = useState(null)
    const [activeIndex, setActiveIndex] = useState(0)
    const [hoverStyle, setHoverStyle] = useState({})
    const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" })
    const tabRefs = useRef([])

    useEffect(() => {
      if (activeTab) {
        const foundIndex = tabs.findIndex((t) => t.id === activeTab)
        if (foundIndex !== -1) {
          setActiveIndex(foundIndex)
        }
      }
    }, [activeTab, tabs])

    useEffect(() => {
      if (hoveredIndex !== null) {
        const hoveredElement = tabRefs.current[hoveredIndex]
        if (hoveredElement) {
          const { offsetLeft, offsetWidth } = hoveredElement
          setHoverStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
          })
        }
      }
    }, [hoveredIndex])

    useEffect(() => {
      const activeElement = tabRefs.current[activeIndex]
      if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        })
      }
    }, [activeIndex])

    useEffect(() => {
      requestAnimationFrame(() => {
        const currentElement = tabRefs.current[activeIndex] || tabRefs.current[0]
        if (currentElement) {
          const { offsetLeft, offsetWidth } = currentElement
          setActiveStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
          })
        }
      })
    }, [activeIndex])

    return (
      <div 
        ref={ref} 
        className={cn("relative", className)} 
        {...props}
      >
        <div className="relative">
          {/* Hover Highlight */}
          <div
            className="absolute h-[32px] transition-all duration-300 ease-out bg-[#0e0f1114] dark:bg-[#ffffff1a] rounded-[8px] flex items-center pointer-events-none"
            style={{
              ...hoverStyle,
              opacity: hoveredIndex !== null ? 1 : 0,
            }}
          />

          {/* Active Indicator */}
          <div
            className="absolute bottom-[-6px] h-[2.5px] bg-[#12192B] dark:bg-white rounded-full transition-all duration-300 ease-out"
            style={activeStyle}
          />

          {/* Tabs */}
          <div className="relative flex space-x-[4px] items-center">
            {tabs.map((tab, index) => (
              <div
                key={tab.id}
                ref={(el) => (tabRefs.current[index] = el)}
                className={cn(
                  "px-3.5 py-1.5 cursor-pointer transition-colors duration-300 h-[32px] flex items-center justify-center select-none rounded-[8px]",
                  index === activeIndex 
                    ? "text-[#12192B] font-semibold" 
                    : "text-[#3B5BA9] font-medium hover:text-[#12192B]"
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  setActiveIndex(index)
                  onTabChange?.(tab.id)
                }}
              >
                <div className="text-sm leading-5 whitespace-nowrap flex items-center justify-center h-full">
                  {tab.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
)
Tabs.displayName = "Tabs"

export { Tabs }
