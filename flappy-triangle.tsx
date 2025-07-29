"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Triangle {
  x: number
  y: number
  velocity: number
  size: number
}

interface Obstacle {
  x: number
  topHeight: number
  bottomY: number
  width: number
  gap: number
  passed: boolean
}

const GRAVITY = 0.5
const JUMP_FORCE = -10
const OBSTACLE_WIDTH = 60
const OBSTACLE_GAP = 180
const OBSTACLE_SPEED = 2.5
const TRIANGLE_SIZE = 20

interface FlappyTriangleProps {
  onBack: () => void
  themeColor: string
}

export default function FlappyTriangle({ onBack, themeColor }: FlappyTriangleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver">("menu")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const gameStateRef = useRef<{
    triangle: Triangle
    obstacles: Obstacle[]
    score: number
    canvas: HTMLCanvasElement | null
    ctx: CanvasRenderingContext2D | null
    gameStarted: boolean
  }>({
    triangle: { x: 120, y: 300, velocity: 0, size: TRIANGLE_SIZE },
    obstacles: [],
    score: 0,
    canvas: null,
    ctx: null,
    gameStarted: false,
  })

  const initGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = 800
    canvas.height = 600

    gameStateRef.current = {
      triangle: { x: 120, y: 300, velocity: 0, size: TRIANGLE_SIZE },
      obstacles: [],
      score: 0,
      canvas,
      ctx: canvas.getContext("2d"),
      gameStarted: false,
    }

    for (let i = 0; i < 3; i++) {
      createObstacle(i * 280 + 400)
    }
  }, [])

  const createObstacle = (x: number) => {
    const topHeight = Math.random() * 180 + 80
    const bottomY = topHeight + OBSTACLE_GAP

    gameStateRef.current.obstacles.push({
      x,
      topHeight,
      bottomY,
      width: OBSTACLE_WIDTH,
      gap: OBSTACLE_GAP,
      passed: false,
    })
  }

  const jump = useCallback(() => {
    if (gameState === "playing") {
      if (!gameStateRef.current.gameStarted) {
        gameStateRef.current.gameStarted = true
      }
      gameStateRef.current.triangle.velocity = JUMP_FORCE
    }
  }, [gameState])

  const startGame = useCallback(() => {
    setGameState("playing")
    setScore(0)
    initGame()
  }, [initGame])

  const endGame = () => {
    setGameState("gameOver")
    if (gameStateRef.current.score > highScore) {
      setHighScore(gameStateRef.current.score)
    }
    setScore(gameStateRef.current.score)
  }

  const checkCollision = (triangle: Triangle, obstacles: Obstacle[]): boolean => {
    if (triangle.y + triangle.size > 600 || triangle.y < 0) {
      return true
    }
    for (const obstacle of obstacles) {
      if (
        triangle.x + triangle.size > obstacle.x &&
        triangle.x < obstacle.x + obstacle.width &&
        (triangle.y < obstacle.topHeight || triangle.y + triangle.size > obstacle.bottomY)
      ) {
        return true
      }
    }
    return false
  }

  const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath()
    ctx.moveTo(x + size, y + size / 2)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + size)
    ctx.closePath()
    ctx.fill()
  }

  const updateGame = useCallback(() => {
    const { triangle, obstacles, canvas, ctx } = gameStateRef.current
    if (!canvas || !ctx) return

    const bgColor = "#fafafa"
    const gridColor = "#f0f0f0"
    const obstacleColor = "#171717"
    const obstacleHighlight = "#404040"
    const triangleColor = themeColor
    const textColor = "#171717"

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = gridColor
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

    if (gameStateRef.current.gameStarted) {
      triangle.velocity += GRAVITY
      triangle.y += triangle.velocity

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i]
        obstacle.x -= OBSTACLE_SPEED
        if (obstacle.x + obstacle.width < 0) {
          obstacles.splice(i, 1)
          continue
        }
        if (!obstacle.passed && triangle.x > obstacle.x + obstacle.width) {
          obstacle.passed = true
          gameStateRef.current.score++
        }
      }

      if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 280) {
        createObstacle(canvas.width)
      }

      if (checkCollision(triangle, obstacles)) {
        endGame()
        return
      }
    }

    ctx.fillStyle = obstacleColor
    for (const obstacle of obstacles) {
      ctx.fillRect(obstacle.x, 0, obstacle.width, obstacle.topHeight)
      ctx.fillRect(obstacle.x, obstacle.bottomY, obstacle.width, canvas.height - obstacle.bottomY)
      ctx.fillStyle = obstacleHighlight
      ctx.fillRect(obstacle.x, obstacle.topHeight - 2, obstacle.width, 2)
      ctx.fillRect(obstacle.x, obstacle.bottomY, obstacle.width, 2)
      ctx.fillStyle = obstacleColor
    }

    ctx.fillStyle = triangleColor
    drawTriangle(ctx, triangle.x, triangle.y, triangle.size)

    ctx.fillStyle = textColor
    ctx.font = "24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`${gameStateRef.current.score}`, 40, 50)

    if (!gameStateRef.current.gameStarted) {
      ctx.fillStyle = textColor
      ctx.font = "16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Press Space or Click to Start", canvas.width / 2, canvas.height / 2 + 100)
    }

    if (gameState === "playing") {
      gameLoopRef.current = requestAnimationFrame(updateGame)
    }
  }, [gameState, themeColor])

  useEffect(() => {
    initGame()
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        jump()
      }
    }
    const handleClick = () => jump()
    window.addEventListener("keydown", handleKeyPress)
    const canvas = canvasRef.current
    canvas?.addEventListener("click", handleClick)
    return () => {
      window.removeEventListener("keydown", handleKeyPress)
      canvas?.removeEventListener("click", handleClick)
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [jump, initGame])

  useEffect(() => {
    if (gameState === "playing") {
      gameLoopRef.current = requestAnimationFrame(updateGame)
    } else if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameState, updateGame])

  useEffect(() => {
    if (gameState !== "gameOver") return
    const handleGameOverKeys = (e: KeyboardEvent) => {
      if (e.key === "Enter") startGame()
      else if (e.key === "Escape") setGameState("menu")
    }
    window.addEventListener("keydown", handleGameOverKeys)
    return () => window.removeEventListener("keydown", handleGameOverKeys)
  }, [gameState, startGame])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-8">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border border-gray-200 rounded-lg shadow-sm"
          style={{ maxWidth: "100%", height: "auto" }}
        />
        {gameState === "menu" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-lg">
            <Card className="p-8 text-center border-gray-200 shadow-sm w-96">
              <div className="mb-6">
                <div className="w-8 h-8 mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill={themeColor} className="w-full h-full">
                    <path d="M12 2L2 22h20L12 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-medium text-gray-900 mb-2">Triangle</h1>
                <p className="text-sm text-gray-600 mb-4">Navigate through obstacles</p>
                <div className="bg-gray-50 rounded-lg p-3 text-left text-xs text-gray-600 space-y-1">
                  <div className="font-medium text-gray-800">Controls:</div>
                  <div>
                    <kbd className="px-2 py-1 bg-white rounded border text-xs">Space</kbd> or{" "}
                    <kbd className="px-2 py-1 bg-white rounded border text-xs">Mouse Click</kbd> to Jump
                  </div>
                </div>
              </div>
              <Button
                onClick={startGame}
                style={{ backgroundColor: themeColor }}
                className="text-white px-6 py-2 text-sm font-medium"
              >
                Start
              </Button>
              {highScore > 0 && <p className="mt-4 text-xs text-gray-500">Best: {highScore}</p>}
            </Card>
          </div>
        )}
        {gameState === "gameOver" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-lg">
            <Card className="p-8 text-center border-gray-200 shadow-sm w-96">
              <h2 className="text-lg font-medium text-gray-500 mb-1">Triangle</h2>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Game Over</h3>
              <div className="space-y-2 mb-6">
                <p className="text-2xl font-mono" style={{ color: themeColor }}>
                  {score}
                </p>
                <p className="text-xs text-gray-500">Best: {highScore}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={startGame}
                  style={{ backgroundColor: themeColor }}
                  className="text-white px-4 py-2 text-sm font-medium"
                >
                  Again
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
          {gameState === "playing" ? "Click or press Space to jump" : "A v0 Mini Game"}
        </p>
      </div>
    </div>
  )
}
