"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, RotateCcw } from "lucide-react"

interface Triangle {
  x: number
  y: number
  velocity: number
}

interface Obstacle {
  x: number
  topHeight: number
  bottomHeight: number
  width: number
  passed: boolean
}

interface FlappyTriangleProps {
  onBack?: () => void
  themeColor?: string
}

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 600
const TRIANGLE_SIZE = 20
const GRAVITY = 0.6
const JUMP_FORCE = -12
const OBSTACLE_WIDTH = 60
const OBSTACLE_GAP = 150
const OBSTACLE_SPEED = 3

export default function FlappyTriangle({ onBack, themeColor = "#f59e0b" }: FlappyTriangleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [triangle, setTriangle] = useState<Triangle>({ x: 100, y: CANVAS_HEIGHT / 2, velocity: 0 })
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [score, setScore] = useState(0)
  const [gameRunning, setGameRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [bestScore, setBestScore] = useState(0)

  const resetGame = useCallback(() => {
    setTriangle({ x: 100, y: CANVAS_HEIGHT / 2, velocity: 0 })
    setObstacles([])
    setScore(0)
    setGameRunning(false)
    setGameOver(false)
  }, [])

  const jump = useCallback(() => {
    if (gameOver) {
      resetGame()
      return
    }
    if (!gameRunning) {
      setGameRunning(true)
    }
    setTriangle((prev) => ({ ...prev, velocity: JUMP_FORCE }))
  }, [gameOver, gameRunning, resetGame])

  const generateObstacle = useCallback((x: number): Obstacle => {
    const topHeight = Math.random() * (CANVAS_HEIGHT - OBSTACLE_GAP - 100) + 50
    return {
      x,
      topHeight,
      bottomHeight: CANVAS_HEIGHT - topHeight - OBSTACLE_GAP,
      width: OBSTACLE_WIDTH,
      passed: false,
    }
  }, [])

  const checkCollision = useCallback((triangle: Triangle, obstacles: Obstacle[]): boolean => {
    // Check ground and ceiling collision
    if (triangle.y <= 0 || triangle.y >= CANVAS_HEIGHT - TRIANGLE_SIZE) {
      return true
    }

    // Check obstacle collision
    for (const obstacle of obstacles) {
      if (
        triangle.x + TRIANGLE_SIZE > obstacle.x &&
        triangle.x < obstacle.x + obstacle.width &&
        (triangle.y < obstacle.topHeight || triangle.y + TRIANGLE_SIZE > CANVAS_HEIGHT - obstacle.bottomHeight)
      ) {
        return true
      }
    }

    return false
  }, [])

  const gameLoop = useCallback(() => {
    if (!gameRunning || gameOver) return

    setTriangle((prev) => {
      const newTriangle = {
        ...prev,
        velocity: prev.velocity + GRAVITY,
        y: prev.y + prev.velocity,
      }

      return newTriangle
    })

    setObstacles((prev) => {
      let newObstacles = prev.map((obstacle) => ({
        ...obstacle,
        x: obstacle.x - OBSTACLE_SPEED,
      }))

      // Remove obstacles that are off screen
      newObstacles = newObstacles.filter((obstacle) => obstacle.x + obstacle.width > 0)

      // Add new obstacles
      if (newObstacles.length === 0 || newObstacles[newObstacles.length - 1].x < CANVAS_WIDTH - 200) {
        newObstacles.push(generateObstacle(CANVAS_WIDTH))
      }

      // Check for passed obstacles and update score
      newObstacles.forEach((obstacle) => {
        if (!obstacle.passed && obstacle.x + obstacle.width < triangle.x) {
          obstacle.passed = true
          setScore((prevScore) => prevScore + 1)
        }
      })

      return newObstacles
    })
  }, [gameRunning, gameOver, triangle.x, generateObstacle])

  // Game loop
  useEffect(() => {
    const interval = setInterval(gameLoop, 16)
    return () => clearInterval(interval)
  }, [gameLoop])

  // Collision detection
  useEffect(() => {
    if (gameRunning && checkCollision(triangle, obstacles)) {
      setGameOver(true)
      setGameRunning(false)
      if (score > bestScore) {
        setBestScore(score)
      }
    }
  }, [triangle, obstacles, gameRunning, checkCollision, score, bestScore])

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#87ceeb"
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw obstacles
    ctx.fillStyle = "#22c55e"
    obstacles.forEach((obstacle) => {
      // Top obstacle
      ctx.fillRect(obstacle.x, 0, obstacle.width, obstacle.topHeight)
      // Bottom obstacle
      ctx.fillRect(obstacle.x, CANVAS_HEIGHT - obstacle.bottomHeight, obstacle.width, obstacle.bottomHeight)
    })

    // Draw triangle
    ctx.fillStyle = themeColor
    ctx.beginPath()
    ctx.moveTo(triangle.x, triangle.y)
    ctx.lineTo(triangle.x + TRIANGLE_SIZE, triangle.y + TRIANGLE_SIZE / 2)
    ctx.lineTo(triangle.x, triangle.y + TRIANGLE_SIZE)
    ctx.closePath()
    ctx.fill()

    // Draw score
    ctx.fillStyle = "#000"
    ctx.font = "24px Arial"
    ctx.fillText(`Score: ${score}`, 10, 30)

    if (gameOver) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.fillStyle = "#fff"
      ctx.font = "32px Arial"
      ctx.textAlign = "center"
      ctx.fillText("Game Over!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50)
      ctx.font = "18px Arial"
      ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
      ctx.fillText(`Best: ${bestScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30)
      ctx.fillText("Click to restart", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60)
      ctx.textAlign = "left"
    }
  }, [triangle, obstacles, score, gameOver, bestScore, themeColor])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault()
        jump()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [jump])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-blue-400 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Triangle</h1>
          <Button onClick={resetGame} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        <Card className="p-4 mb-4">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border border-gray-300 cursor-pointer mx-auto block"
            onClick={jump}
          />
        </Card>

        <div className="text-center space-y-2">
          <div className="flex justify-center gap-4 text-sm text-gray-700">
            <span>Score: {score}</span>
            <span>Best: {bestScore}</span>
          </div>
          <p className="text-sm text-gray-600">Click or press Space to jump</p>
          {!gameRunning && !gameOver && <p className="text-sm text-gray-600">Click to start playing!</p>}
        </div>
      </div>
    </div>
  )
}
