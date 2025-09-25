import React, { useState, useEffect, useRef } from 'react'

const RetroTextbox = ({ isOpen, onClose }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const typingTimeoutRef = useRef(null)
  const dismissTimeoutRef = useRef(null)
  const exitTimeoutRef = useRef(null)
  
  const messages = [
    "Those are some formidible looking Forms!",
    "Always remember, never overload your terms!"
  ]

  // Handle opening/closing animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsExiting(false)
      setCurrentMessageIndex(0)
      setDisplayedText('')
      setIsTyping(true)
      // Clear any existing exit timeout
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current)
      }
    } else if (isVisible) {
      // Start exit animation
      setIsExiting(true)
      setIsTyping(false)
      
      // Clear timeouts
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current)
      }
      
      // Hide after exit animation completes
      exitTimeoutRef.current = setTimeout(() => {
        setIsVisible(false)
        setIsExiting(false)
        setCurrentMessageIndex(0)
        setDisplayedText('')
      }, 1000) // Match the 1.0s exit animation duration
    }
    
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current)
      }
    }
  }, [isOpen, isVisible])

  // Typewriter effect
  useEffect(() => {
    if (!isOpen || !isTyping) return

    const currentMessage = messages[currentMessageIndex]
    if (displayedText.length < currentMessage.length) {
      typingTimeoutRef.current = setTimeout(() => {
        setDisplayedText(currentMessage.slice(0, displayedText.length + 1))
      }, 60) // 60ms per character for more natural typing
    } else {
      // Message complete
      setIsTyping(false)
      
      // Auto-advance to next message after pause
      if (currentMessageIndex < messages.length - 1) {
        typingTimeoutRef.current = setTimeout(() => {
          setCurrentMessageIndex(currentMessageIndex + 1)
          setDisplayedText('')
          setIsTyping(true)
        }, 1500) // 1.5 second pause between messages
      } else {
        // All messages complete, auto-dismiss after delay
        dismissTimeoutRef.current = setTimeout(() => {
          onClose()
        }, 8000) // 8 second delay before auto-dismiss
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [displayedText, currentMessageIndex, isTyping, isOpen, onClose])

  // Handle click to advance/dismiss
  const handleClick = () => {
    if (isTyping) {
      // Skip typing animation and show full message immediately
      setDisplayedText(messages[currentMessageIndex])
      setIsTyping(false)
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    } else if (currentMessageIndex < messages.length - 1) {
      // Advance to next message
      setCurrentMessageIndex(currentMessageIndex + 1)
      setDisplayedText('')
      setIsTyping(true)
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current)
      }
    } else {
      // Dismiss textbox
      onClose()
    }
  }

  if (!isVisible) return null

  return (
    <div className={`retro-textbox-container ${isExiting ? 'retro-textbox-exit' : 'retro-textbox-enter'}`}>
      <div className="retro-textbox" onClick={handleClick}>
        {/* Prof H Avatar */}
        <div className="retro-avatar">
          <img src="/profh.gif" alt="Prof H" />
        </div>
        
        {/* Text Content */}
        <div className="retro-text-content">
          <div className="retro-speaker-name">Prof H</div>
          <div className="retro-message">
            {displayedText}
            {isTyping && <span className="retro-cursor">▋</span>}
          </div>
          
          {/* Continue indicator */}
          {!isTyping && (
            <div className="retro-continue-indicator">
              {currentMessageIndex < messages.length - 1 ? "▼ Click to continue" : "▼ Click to close"}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RetroTextbox
