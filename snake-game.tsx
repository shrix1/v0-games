"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Grid3X3 } from "lucide-react"

interface Position {
  x: number
  y: number
}
interface Food {
  x: number
  y: number
}

const GRID_SIZE = 20
const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 600
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION = { x: 1, y: 0 }

interface SnakeGameProps {
  onBack: () => void
  themeColor: string
}

export default function SnakeGame({ onBack, themeColor }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver">("menu")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const gameStateRef = useRef<{
    snake: Position[]
    direction: Position
    food: Food
    score: number
    canvas: HTMLCanvasElement | null
    ctx: CanvasRenderingContext2D | null
    lastTime: number
  }>({
    snake: [...INITIAL_SNAKE],
    direction: { ...INITIAL_DIRECTION },
    food: { x: 15, y: 15 },
    score: 0,
    canvas: null,
    ctx: null,
    lastTime: 0,
  })

  const generateFood = useCallback((): Food => {
    const maxX = Math.floor(CANVAS_WIDTH / GRID_SIZE) - 1
    const maxY = Math.floor(CANVAS_HEIGHT / GRID_SIZE) - 1
    let newFood: Food
    do {
      newFood = { x: Math.floor(Math.random() * maxX), y: Math.floor(Math.random() * maxY) }
    } while (gameStateRef.current.snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [])

  const initGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    gameStateRef.current = {
      snake: [...INITIAL_SNAKE],
      direction: { ...INITIAL_DIRECTION },
      food: generateFood(),
      score: 0,
      canvas,
      ctx: canvas.getContext("2d"),
      lastTime: 0,
    }
    setScore(0)
  }, [generateFood])

  const startGame = useCallback(() => {
    setGameState("playing")
    initGame()
  }, [initGame])

  const endGame = () => {
    setGameState("gameOver")
    if (gameStateRef.current.score > highScore) {
      setHighScore(gameStateRef.current.score)
    }
    setScore(gameStateRef.current.score)
  }

  const checkCollision = (head: Position, snake: Position[]): boolean => {
    if (head.x < 0 || head.x >= CANVAS_WIDTH / GRID_SIZE || head.y < 0 || head.y >= CANVAS_HEIGHT / GRID_SIZE) {
      return true
    }
    return snake.some((segment) => segment.x === head.x && segment.y === head.y)
  }

  const updateGame = useCallback(
    (currentTime: number) => {
      const { snake, direction, food, canvas, ctx } = gameStateRef.current
      if (!canvas || !ctx) return

      if (currentTime - gameStateRef.current.lastTime < 150) {
        if (gameState === "playing") gameLoopRef.current = requestAnimationFrame(updateGame)
        return
      }
      gameStateRef.current.lastTime = currentTime

      const head = { ...snake[0] }
      head.x += direction.x
      head.y += direction.y

      if (checkCollision(head, snake)) {
        endGame()
        return
      }

      snake.unshift(head)
      if (head.x === food.x && head.y === food.y) {
        gameStateRef.current.score++
        setScore(gameStateRef.current.score)
        gameStateRef.current.food = generateFood()
      } else {
        snake.pop()
      }

      ctx.fillStyle = "#fafafa"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = "#f0f0f0"
      ctx.lineWidth = 1
      for (let i = 0; i <= canvas.width; i += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }
      for (let i = 0; i <= canvas.height; i += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }

      snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? themeColor : "#404040"
        ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2)
      })

      ctx.fillStyle = "#171717"
      ctx.fillRect(food.x * GRID_SIZE + 2, food.y * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4)

      ctx.fillStyle = "#171717"
      ctx.font = "20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`${gameStateRef.current.score}`, 20, 30)

      if (gameState === "playing") gameLoopRef.current = requestAnimationFrame(updateGame)
    },
    [gameState, generateFood, themeColor],
  )

  const changeDirection = useCallback((newDirection: Position) => {
    const { direction } = gameStateRef.current
    if (newDirection.x === -direction.x && newDirection.y === -direction.y) return
    gameStateRef.current.direction = newDirection
  }, [])

  useEffect(() => {
    initGame()
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== "playing") return
      switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          e.preventDefault()
          changeDirection({ x: 0, y: -1 })
          break
        case "arrowdown":
        case "s":
          e.preventDefault()
          changeDirection({ x: 0, y: 1 })
          break
        case "arrowleft":
        case "a":
          e.preventDefault()
          changeDirection({ x: -1, y: 0 })
          break
        case "arrowright":
        case "d":
          e.preventDefault()
          changeDirection({ x: 1, y: 0 })
          break
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => {
      window.removeEventListener("keydown", handleKeyPress)
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
    }
  }, [gameState, changeDirection, initGame])

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
                <div
                  className="w-8 h-8 mx-auto mb-4 rounded flex items-center justify-center"
                  style={{ backgroundColor: themeColor }}
                >
                  <Grid3X3 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-medium text-gray-900 mb-2">Snake</h1>
                <p className="text-sm text-gray-600 mb-4">Collect food and grow longer</p>
                <div className="bg-gray-50 rounded-lg p-3 text-left text-xs text-gray-600 space-y-1">
                  <div className="font-medium text-gray-800">Controls:</div>
                  <div>
                    <kbd className="px-2 py-1 bg-white rounded border text-xs">↑↓←→</kbd> or{" "}
                    <kbd className="px-2 py-1 bg-white rounded border text-xs">WASD</kbd> to Move
                  </div>
                </div>
              </div>
              <Button
                onClick={startGame}
                style={{ backgroundColor: themeColor }}
                className="text-white px-6 py-2 text-sm font-medium"
              >
                Start Game
              </Button>
              {highScore > 0 && <p className="mt-4 text-xs text-gray-500">Best: {highScore}</p>}
            </Card>
          </div>
        )}
        {gameState === "gameOver" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-lg">
            <Card className="p-8 text-center border-gray-200 shadow-sm w-96">
              <h2 className="text-lg font-medium text-gray-500 mb-1">Snake</h2>
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
                  Play Again
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
          {gameState === "playing" ? "Use arrow keys or WASD to move" : "A v0 Mini Game"}
        </p>
      </div>
    </div>
  )
}
