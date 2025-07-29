"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Gamepad2 } from "lucide-react"

interface Paddle {
  x: number
  y: number
  width: number
  height: number
  dy: number
}
interface Ball {
  x: number
  y: number
  radius: number
  dx: number
  dy: number
}

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const PADDLE_WIDTH = 15
const PADDLE_HEIGHT = 100
const BALL_RADIUS = 10
const PADDLE_SPEED = 6
const BALL_SPEED = 4.5

interface PongGameProps {
  onBack: () => void
  themeColor: string
}

export default function PongGame({ onBack, themeColor }: PongGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver">("menu")
  const [playerScore, setPlayerScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const gameStateRef = useRef<{
    playerPaddle: Paddle
    aiPaddle: Paddle
    ball: Ball
    playerScore: number
    aiScore: number
    canvas: HTMLCanvasElement | null
    ctx: CanvasRenderingContext2D | null
    aiReactionDelay: number
    aiLastUpdate: number
  }>({
    playerPaddle: { x: 0, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, dy: 0 },
    aiPaddle: {
      x: CANVAS_WIDTH - PADDLE_WIDTH,
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      dy: 0,
    },
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, radius: BALL_RADIUS, dx: BALL_SPEED, dy: BALL_SPEED },
    playerScore: 0,
    aiScore: 0,
    canvas: null,
    ctx: null,
    aiReactionDelay: 0,
    aiLastUpdate: 0,
  })

  const resetBall = useCallback((servingPlayer: "player" | "ai") => {
    const { ball } = gameStateRef.current
    ball.x = CANVAS_WIDTH / 2
    ball.y = CANVAS_HEIGHT / 2
    ball.dx = servingPlayer === "player" ? BALL_SPEED : -BALL_SPEED
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED
    gameStateRef.current.aiReactionDelay = Math.random() * 100 + 50
  }, [])

  const initGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    gameStateRef.current = {
      playerPaddle: {
        x: 0,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        dy: 0,
      },
      aiPaddle: {
        x: CANVAS_WIDTH - PADDLE_WIDTH,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        dy: 0,
      },
      ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, radius: BALL_RADIUS, dx: BALL_SPEED, dy: BALL_SPEED },
      playerScore: 0,
      aiScore: 0,
      canvas,
      ctx: canvas.getContext("2d"),
      aiReactionDelay: Math.random() * 100 + 50,
      aiLastUpdate: 0,
    }
    setPlayerScore(0)
    setAiScore(0)
    resetBall("player")
  }, [resetBall])

  const startGame = useCallback(() => {
    setGameState("playing")
    initGame()
  }, [initGame])

  const endGame = () => {
    setGameState("gameOver")
    if (gameStateRef.current.playerScore > highScore) {
      setHighScore(gameStateRef.current.playerScore)
    }
  }

  const updateGame = useCallback(() => {
    const { playerPaddle, aiPaddle, ball, canvas, ctx } = gameStateRef.current
    if (!canvas || !ctx) return

    ctx.fillStyle = "#fafafa"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#e0e0e0"
    ctx.lineWidth = 2
    ctx.setLineDash([10, 10])
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()
    ctx.setLineDash([])

    ball.x += ball.dx
    ball.y += ball.dy
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) ball.dy *= -1

    if (
      ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
      ball.y + ball.radius > playerPaddle.y &&
      ball.y - ball.radius < playerPaddle.y + playerPaddle.height &&
      ball.dx < 0
    ) {
      ball.dx = Math.abs(ball.dx)
      const hitPoint = (ball.y - (playerPaddle.y + playerPaddle.height / 2)) / (playerPaddle.height / 2)
      ball.dy = hitPoint * BALL_SPEED
    }
    if (
      ball.x + ball.radius > aiPaddle.x &&
      ball.y + ball.radius > aiPaddle.y &&
      ball.y - ball.radius < aiPaddle.y + aiPaddle.height &&
      ball.dx > 0
    ) {
      ball.dx = -Math.abs(ball.dx)
      const hitPoint = (ball.y - (aiPaddle.y + aiPaddle.height / 2)) / (aiPaddle.height / 2)
      ball.dy = hitPoint * BALL_SPEED
    }

    if (ball.x - ball.radius > canvas.width) {
      gameStateRef.current.playerScore++
      setPlayerScore(gameStateRef.current.playerScore)
      resetBall("ai")
    } else if (ball.x + ball.radius < 0) {
      gameStateRef.current.aiScore++
      setAiScore(gameStateRef.current.aiScore)
      resetBall("player")
    }

    const currentTime = performance.now()
    if (currentTime - gameStateRef.current.aiLastUpdate > gameStateRef.current.aiReactionDelay) {
      const ballCenterY = ball.y
      const paddleCenterY = aiPaddle.y + aiPaddle.height / 2
      const difference = ballCenterY - paddleCenterY
      if (ball.dx > 0 && Math.abs(difference) > 10) {
        if (difference > 0) aiPaddle.y += PADDLE_SPEED * 0.75
        else aiPaddle.y -= PADDLE_SPEED * 0.75
      }
      if (Math.random() < 0.05) aiPaddle.y += (Math.random() - 0.5) * PADDLE_SPEED * 0.5
      gameStateRef.current.aiLastUpdate = currentTime
      gameStateRef.current.aiReactionDelay = Math.random() * 100 + 50
    }
    if (aiPaddle.y < 0) aiPaddle.y = 0
    if (aiPaddle.y + aiPaddle.height > canvas.height) aiPaddle.y = canvas.height - aiPaddle.height

    ctx.fillStyle = themeColor
    ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height)
    ctx.fillStyle = "#000000"
    ctx.fillRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height)

    ctx.fillStyle = themeColor
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    ctx.fill()

    ctx.font = "48px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    ctx.textAlign = "center"
    ctx.fillStyle = themeColor
    ctx.fillText(`${gameStateRef.current.playerScore}`, canvas.width / 2 - 80, 60)
    ctx.fillStyle = "#171717"
    ctx.fillText(`${gameStateRef.current.aiScore}`, canvas.width / 2 + 80, 60)

    if (gameStateRef.current.playerScore >= 5 || gameStateRef.current.aiScore >= 5) {
      endGame()
      return
    }
    if (gameState === "playing") gameLoopRef.current = requestAnimationFrame(updateGame)
  }, [gameState, resetBall, themeColor])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (gameState !== "playing") return
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mouseY = e.clientY - rect.top
      let newY = mouseY - gameStateRef.current.playerPaddle.height / 2
      if (newY < 0) newY = 0
      if (newY + gameStateRef.current.playerPaddle.height > canvas.height)
        newY = canvas.height - gameStateRef.current.playerPaddle.height
      gameStateRef.current.playerPaddle.y = newY
    },
    [gameState],
  )

  useEffect(() => {
    initGame()
  }, [initGame])
  useEffect(() => {
    if (gameState === "playing") gameLoopRef.current = requestAnimationFrame(updateGame)
    else if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current)
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
          className="border border-gray-200 rounded-lg shadow-sm cursor-none"
          style={{ maxWidth: "100%", height: "auto" }}
          onMouseMove={handleMouseMove}
        />
        {gameState === "menu" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-lg">
            <Card className="p-8 text-center border-gray-200 shadow-sm w-96">
              <div className="mb-6">
                <div
                  className="w-8 h-8 mx-auto mb-4 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: themeColor }}
                >
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-medium text-gray-900 mb-2">Pong</h1>
                <p className="text-sm text-gray-600 mb-4">First to 5 points wins!</p>
                <div className="bg-gray-50 rounded-lg p-3 text-left text-xs text-gray-600 space-y-1">
                  <div className="font-medium text-gray-800">Controls:</div>
                  <div>
                    <kbd className="px-2 py-1 bg-white rounded border text-xs">Mouse</kbd> to Move Paddle
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
              {highScore > 0 && <p className="mt-4 text-xs text-gray-500">Best Score: {highScore}</p>}
            </Card>
          </div>
        )}
        {gameState === "gameOver" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-lg">
            <Card className="p-8 text-center border-gray-200 shadow-sm w-96">
              <h2 className="text-lg font-medium text-gray-500 mb-1">Pong</h2>
              <h3 className="text-xl font-medium text-gray-900 mb-4">
                {playerScore > aiScore ? "You Win! 🎉" : "AI Wins! 🤖"}
              </h3>
              <div className="space-y-2 mb-6">
                <p className="text-2xl font-mono text-gray-900">
                  <span style={{ color: themeColor }}>{playerScore}</span> - {aiScore}
                </p>
                <p className="text-xs text-gray-500">Your Best: {highScore}</p>
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
          {gameState === "playing" ? "Move your mouse to control the paddle" : "A v0 Mini Game"}
        </p>
      </div>
    </div>
  )
}
