"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Play,
  Triangle,
  PawPrint,
  Grid3X3,
  Gamepad2,
  Timer,
  Zap,
  Target,
  Square,
  Palette,
  Rocket,
} from "lucide-react"
import FlappyTriangle from "./flappy-triangle"
import DinoGame from "./dino-game"
import SnakeGame from "./snake-game"
import PongGame from "./pong-game"
import ReactionGame from "./reaction-game"
import TetrisGame from "./tetris-game"
import BreakoutGame from "./breakout-game"
import OrbitDefense from "./orbit-defense"
import ColorMatchGame from "./color-match-game"
import SpaceInvadersGame from "./space-invaders-game"
import TicTacToeGame from "./tic-tac-toe-game"

type GameType =
  | "menu"
  | "flappy"
  | "dino"
  | "snake"
  | "pong"
  | "reaction"
  | "tetris"
  | "breakout"
  | "orbit-defense"
  | "color-match"
  | "space-invaders"
  | "tic-tac-toe"

export default function GameDashboard() {
  const [currentGame, setCurrentGame] = useState<GameType>("menu")

  const games = [
    {
      id: "flappy" as const,
      title: "Triangle",
      description: "Navigate through obstacles with precise timing.",
      icon: Triangle,
      color: "bg-yellow-500",
      themeColor: "#f59e0b",
    },
    {
      id: "dino" as const,
      title: "Sheep Run",
      description: "Jump over cacti and dodge flying birds.",
      icon: PawPrint,
      color: "bg-gray-700",
      themeColor: "#374151",
    },
    {
      id: "snake" as const,
      title: "Snake",
      description: "A modern, minimalistic take on the classic.",
      icon: Grid3X3,
      color: "bg-green-500",
      themeColor: "#22c55e",
    },
    {
      id: "pong" as const,
      title: "Pong",
      description: "The timeless arcade classic. Play against an AI.",
      icon: Gamepad2,
      color: "bg-blue-500",
      themeColor: "#3b82f6",
    },
    {
      id: "reaction" as const,
      title: "Reaction Time",
      description: "Test your reflexes. How fast can you click?",
      icon: Timer,
      color: "bg-red-500",
      themeColor: "#ef4444",
    },
    {
      id: "tetris" as const,
      title: "Tetris",
      description: "Stack falling blocks to clear lines and score high.",
      icon: Square,
      color: "bg-purple-500",
      themeColor: "#a855f7",
    },
    {
      id: "breakout" as const,
      title: "Breakout",
      description: "Break all the bricks with your ball and paddle.",
      icon: Zap,
      color: "bg-orange-500",
      themeColor: "#f97316",
    },
    {
      id: "orbit-defense" as const,
      title: "Orbit Defense",
      description: "Strategic tower defense in the vastness of space.",
      icon: Target,
      color: "bg-indigo-500",
      themeColor: "#6366f1",
    },
    {
      id: "color-match" as const,
      title: "Color Match",
      description: "Match the target color as fast as you can!",
      icon: Palette,
      color: "bg-pink-500",
      themeColor: "#ec4899",
    },
    {
      id: "space-invaders" as const,
      title: "Space Invaders",
      description: "Defend Earth from waves of alien invaders in this classic arcade shooter.",
      icon: Rocket,
      color: "bg-cyan-500",
      themeColor: "#06b6d4",
    },
    {
      id: "tic-tac-toe" as const,
      title: "Tic Tac Toe",
      description: "Classic strategy game - get three in a row to win!",
      icon: Grid3X3,
      color: "bg-emerald-500",
      themeColor: "#10b981",
    },
  ]

  const renderGame = () => {
    const gameData = games.find((g) => g.id === currentGame)
    const commonProps = {
      onBack: () => setCurrentGame("menu"),
      themeColor: gameData ? gameData.themeColor : "#000000",
    }
    switch (currentGame) {
      case "flappy":
        return <FlappyTriangle {...commonProps} />
      case "dino":
        return <DinoGame {...commonProps} />
      case "snake":
        return <SnakeGame {...commonProps} />
      case "pong":
        return <PongGame {...commonProps} />
      case "reaction":
        return <ReactionGame {...commonProps} />
      case "tetris":
        return <TetrisGame {...commonProps} />
      case "breakout":
        return <BreakoutGame {...commonProps} />
      case "orbit-defense":
        return <OrbitDefense {...commonProps} />
      case "color-match":
        return <ColorMatchGame {...commonProps} />
      case "space-invaders":
        return <SpaceInvadersGame {...commonProps} />
      case "tic-tac-toe":
        return <TicTacToeGame {...commonProps} />
      default:
        return null
    }
  }

  if (currentGame !== "menu") {
    return (
      <div className="relative w-full h-full">
        <Button
          onClick={() => setCurrentGame("menu")}
          variant="outline"
          size="sm"
          className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>
        {renderGame()}
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-7xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">v0 Mini Game Arcade</h1>
          <p className="text-gray-600 text-lg font-mono">A collection of simple games build with v0.dev</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <Card
              key={game.id}
              className="group relative overflow-hidden rounded-xl border-gray-200 hover:border-transparent transition-all duration-300 cursor-pointer"
              onClick={() => setCurrentGame(game.id)}
            >
              <div
                className={`absolute inset-0 ${game.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
              <div className="relative p-6 bg-white group-hover:bg-transparent transition-colors duration-300 h-full flex flex-col">
                <div className="flex items-start justify-between">
                  <div
                    className={`p-3 rounded-lg ${game.color} text-white group-hover:bg-white/20 transition-colors duration-300`}
                  >
                    <game.icon className="w-6 h-6" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex-grow">
                  <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-white transition-colors duration-300">
                    {game.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 group-hover:text-white/80 transition-colors duration-300 mt-2 text-sm leading-relaxed font-mono">
                    {game.description}
                  </CardDescription>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 font-mono">
            Crafted on v0.dev by{" "}
            <a
              href="https://x.com/shribuilds"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-700 underline underline-offset-4 hover:text-black transition-colors"
            >
              shrix1
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
