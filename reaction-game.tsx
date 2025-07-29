"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, RotateCcw, Timer, Zap } from "lucide-react"

interface ReactionGameProps {
  onBack?: () => void
  themeColor?: string
}

export default function ReactionGame({ onBack, themeColor = "#ef4444" }: ReactionGameProps) {
  const [gameState, setGameState] = useState<"waiting" | "ready" | "go" | "clicked" | "too-early">("waiting")
  const [startTime, setStartTime] = useState<number>(0)
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [bestTime, setBestTime] = useState<number | null>(null)
  const [attempts, setAttempts] = useState<number[]>([])

  const resetGame = useCallback(() => {
    setGameState("waiting")
    setStartTime(0)
    setReactionTime(null)
  }, [])

  const startGame = useCallback(() => {
    setGameState("ready")
    const delay = Math.random() * 4000 + 1000 // 1-5 seconds
    setTimeout(() => {
      setGameState("go")
      setStartTime(Date.now())
    }, delay)
  }, [])

  const handleClick = useCallback(() => {
    if (gameState === "waiting") {
      startGame()
    } else if (gameState === "ready") {
      setGameState("too-early")
    } else if (gameState === "go") {
      const endTime = Date.now()
      const reaction = endTime - startTime
      setReactionTime(reaction)
      setGameState("clicked")
      setAttempts((prev) => [...prev, reaction])

      if (!bestTime || reaction < bestTime) {
        setBestTime(reaction)
      }
    } else if (gameState === "clicked" || gameState === "too-early") {
      resetGame()
    }
  }, [gameState, startTime, startGame, resetGame, bestTime])

  const getAverageTime = () => {
    if (attempts.length === 0) return null
    return Math.round(attempts.reduce((sum, time) => sum + time, 0) / attempts.length)
  }

  const getPerformanceRating = (time: number) => {
    if (time < 200) return { text: "Lightning Fast!", color: "text-green-600" }
    if (time < 250) return { text: "Excellent!", color: "text-green-500" }
    if (time < 300) return { text: "Good!", color: "text-blue-500" }
    if (time < 400) return { text: "Average", color: "text-yellow-500" }
    return { text: "Slow", color: "text-red-500" }
  }

  const getStateConfig = () => {
    switch (gameState) {
      case "waiting":
        return {
          bg: "bg-blue-500",
          text: "Click to Start",
          subtext: "Test your reaction time",
        }
      case "ready":
        return {
          bg: "bg-red-500",
          text: "Wait for Green...",
          subtext: "Don't click yet!",
        }
      case "go":
        return {
          bg: "bg-green-500",
          text: "CLICK NOW!",
          subtext: "Click as fast as you can!",
        }
      case "clicked":
        return {
          bg: "bg-gray-100",
          text: `${reactionTime}ms`,
          subtext: "Click to try again",
        }
      case "too-early":
        return {
          bg: "bg-red-500",
          text: "Too Early!",
          subtext: "Click to try again",
        }
    }
  }

  const config = getStateConfig()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Reaction Time</h1>
          <Button onClick={resetGame} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Main Game Area */}
        <Card
          className={`${config.bg} border-0 cursor-pointer transition-all duration-200 hover:scale-105 mb-6`}
          onClick={handleClick}
        >
          <div className="h-80 flex flex-col items-center justify-center text-white p-8">
            <div className="text-4xl font-bold mb-4">{config.text}</div>
            <div className="text-lg opacity-90">{config.subtext}</div>
            {gameState === "clicked" && reactionTime && (
              <div className={`mt-4 text-lg font-semibold ${getPerformanceRating(reactionTime).color}`}>
                {getPerformanceRating(reactionTime).text}
              </div>
            )}
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="font-semibold text-gray-700">Best Time</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{bestTime ? `${bestTime}ms` : "—"}</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Timer className="w-5 h-5 text-blue-500 mr-2" />
              <span className="font-semibold text-gray-700">Average</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{getAverageTime() ? `${getAverageTime()}ms` : "—"}</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="font-semibold text-gray-700">Attempts</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{attempts.length}</div>
          </Card>
        </div>

        {/* Recent Attempts */}
        {attempts.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Recent Attempts</h3>
            <div className="flex flex-wrap gap-2">
              {attempts.slice(-10).map((time, index) => (
                <div
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    time === bestTime
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {time}ms
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Instructions */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Click the blue area to start • Wait for green • Click as fast as you can!</p>
          <p className="mt-1">Average human reaction time is around 250ms</p>
        </div>
      </div>
    </div>
  )
}
