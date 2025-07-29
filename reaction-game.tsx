"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Timer } from "lucide-react"

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600

interface ReactionGameProps {
  onBack: () => void
  themeColor: string
}

export default function ReactionGame({ onBack, themeColor }: ReactionGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [gameState, setGameState] = useState<"menu" | "waiting" | "ready" | "result">("menu")
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [bestTime, setBestTime] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string>("")
  const [isSquareActive, setIsSquareActive] = useState(false)

  const getFeedbackMessage = (time: number): string => {
    if (time < 100)
      return ["Pro Level! 🔥", "Lightning Fast! ⚡", "Superhuman! 🚀", "Incredible! 💯"][Math.floor(Math.random() * 4)]
    if (time > 500)
      return [
        "Are you even trying? 😴",
        "My grandma is faster! 👵",
        "Did you fall asleep? 💤",
        "Turtle speed activated! 🐢",
        "Are you using Internet Explorer? 🐌",
      ][Math.floor(Math.random() * 5)]
    if (time < 200) return "Excellent! 👏"
    if (time < 300) return "Good reflexes! 👍"
    return "Not bad! 🙂"
  }

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.fillStyle = "#fafafa"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#f0f0f0"
    ctx.lineWidth = 1
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, canvas.height)
      ctx.stroke()
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(canvas.width, i)
      ctx.stroke()
    }

    const squareSize = 200
    const squareX = canvas.width / 2 - squareSize / 2
    const squareY = canvas.height / 2 - squareSize / 2
    ctx.fillStyle = gameState === "ready" && isSquareActive ? themeColor : "#e0e0e0"
    ctx.fillRect(squareX, squareY, squareSize, squareSize)
    ctx.strokeStyle = "#d0d0d0"
    ctx.lineWidth = 2
    ctx.strokeRect(squareX, squareY, squareSize, squareSize)

    ctx.fillStyle = isSquareActive && gameState === "ready" ? "#ffffff" : "#171717"
    ctx.font = "24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    if (gameState === "waiting") ctx.fillText("Wait...", canvas.width / 2, canvas.height / 2)
    else if (gameState === "ready" && isSquareActive) ctx.fillText("CLICK NOW!", canvas.width / 2, canvas.height / 2)

    ctx.fillStyle = "#666666"
    ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    ctx.fillText(
      `Click the square when it turns ${themeColor === "#ef4444" ? "red" : "colored"}`,
      canvas.width / 2,
      canvas.height - 50,
    )
  }, [gameState, isSquareActive, themeColor])

  const startRound = useCallback(() => {
    setGameState("waiting")
    setIsSquareActive(false)
    setReactionTime(null)
    setFeedbackMessage("")
    setStartTime(null)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    const delay = Math.random() * 3000 + 1000
    timeoutRef.current = setTimeout(() => {
      setGameState("ready")
      setIsSquareActive(true)
      setStartTime(performance.now())
    }, delay)
  }, [])

  const handleClick = useCallback(() => {
    if (gameState === "waiting") {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setGameState("result")
      setReactionTime(0)
      setFeedbackMessage(`Too early! Wait for the color! 🚫`)
    } else if (gameState === "ready" && isSquareActive && startTime) {
      const endTime = performance.now()
      const timeTaken = endTime - startTime
      setReactionTime(timeTaken)
      setGameState("result")
      setIsSquareActive(false)
      setFeedbackMessage(getFeedbackMessage(timeTaken))
      if (bestTime === null || timeTaken < bestTime) setBestTime(timeTaken)
    }
  }, [gameState, isSquareActive, startTime, bestTime])

  const initGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
  }, [])

  useEffect(() => {
    const animate = () => {
      drawCanvas()
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [drawCanvas])

  useEffect(() => {
    initGame()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [initGame])

  useEffect(() => {
    if (gameState !== "result") return
    const handleResultKeys = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") startRound()
      else if (e.key === "Escape") setGameState("menu")
    }
    window.addEventListener("keydown", handleResultKeys)
    return () => window.removeEventListener("keydown", handleResultKeys)
  }, [gameState, startRound])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border border-gray-200 rounded-lg shadow-sm cursor-pointer"
          style={{ maxWidth: "100%", height: "auto" }}
          onClick={handleClick}
        />
        {gameState === "menu" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-lg">
            <Card className="p-8 text-center border-gray-200 shadow-sm w-96">
              <div className="mb-6">
                <div
                  className="w-8 h-8 mx-auto mb-4 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: themeColor }}
                >
                  <Timer className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-medium text-gray-900 mb-2">Reaction Time</h1>
                <p className="text-sm text-gray-600 mb-4">Click the square when it changes color!</p>
                <div className="bg-gray-50 rounded-lg p-3 text-left text-xs text-gray-600 space-y-1">
                  <div className="font-medium text-gray-800">Controls:</div>
                  <div>
                    <kbd className="px-2 py-1 bg-white rounded border text-xs">Mouse Click</kbd> on the square
                  </div>
                </div>
              </div>
              <Button
                onClick={startRound}
                style={{ backgroundColor: themeColor }}
                className="text-white px-6 py-2 text-sm font-medium"
              >
                Start Test
              </Button>
              {bestTime !== null && <p className="mt-4 text-xs text-gray-500">Best Time: {bestTime.toFixed(0)} ms</p>}
            </Card>
          </div>
        )}
        {gameState === "result" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-lg">
            <Card className="p-8 text-center border-gray-200 shadow-sm w-96">
              <h2 className="text-lg font-medium text-gray-500 mb-1">Reaction Time</h2>
              <h3 className="text-xl font-medium text-gray-900 mb-2">{reactionTime === 0 ? "Too Early!" : "Result"}</h3>
              <div className="space-y-3 mb-6">
                <p className="text-4xl font-mono" style={{ color: themeColor }}>
                  {reactionTime === 0 ? "—" : `${reactionTime?.toFixed(0)} ms`}
                </p>
                <p className="text-lg font-medium text-gray-700">{feedbackMessage}</p>
                {bestTime !== null && reactionTime !== 0 && (
                  <p className="text-xs text-gray-500">Best: {bestTime.toFixed(0)} ms</p>
                )}
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={startRound}
                  style={{ backgroundColor: themeColor }}
                  className="text-white px-4 py-2 text-sm font-medium"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => setGameState("menu")}
                  variant="outline"
                  className="border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 text-sm font-medium"
                >
                  Menu
                </Button>
              </div>
              <div className="mt-4 text-xs text-gray-500 space-x-4">
                <span>
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> Again
                </span>
                <span>
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> Menu
                </span>
              </div>
            </Card>
          </div>
        )}
      </div>
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          {gameState === "waiting" ? "Get ready..." : `Click when the square turns colored!`}
        </p>
      </div>
    </div>
  )
}
