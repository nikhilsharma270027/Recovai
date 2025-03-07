"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import * as tf from "@tensorflow/tfjs"
import * as posenet from "@tensorflow-models/posenet"

interface PoseData {
  keypoints: Array<{ position: { x: number; y: number }; score: number }>
}

interface ExerciseResult {
  correct: boolean
  feedback: string
}

export function usePoseDetection(containerRef: React.RefObject<HTMLDivElement>) {
  const [isReady, setIsReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const netRef = useRef<posenet.PoseNet | null>(null)
  const poseDataRef = useRef<PoseData | null>(null)

  const initializePoseDetection = useCallback(async () => {
    if (!containerRef.current) return

    await tf.ready()
    netRef.current = await posenet.load({
      architecture: "MobileNetV1",
      outputStride: 16,
      inputResolution: { width: 640, height: 480 },
      multiplier: 0.75,
    })

    if (!videoRef.current) {
      videoRef.current = document.createElement("video")
      videoRef.current.width = 640
      videoRef.current.height = 480
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    videoRef.current.srcObject = stream
    await videoRef.current.play()

    const canvas = document.createElement("canvas")
    canvas.width = 640
    canvas.height = 480
    containerRef.current.appendChild(canvas)
    const ctx = canvas.getContext("2d")

    const detectPose = async () => {
      if (netRef.current && videoRef.current) {
        const pose = await netRef.current.estimateSinglePose(videoRef.current)
        poseDataRef.current = pose

        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
          drawKeypoints(pose.keypoints, ctx)
          drawSkeleton(pose.keypoints, ctx)
        }
      }
      requestAnimationFrame(detectPose)
    }

    detectPose()
    setIsReady(true)
  }, [containerRef])

  useEffect(() => {
    initializePoseDetection()

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [initializePoseDetection])

  const checkPose = useCallback((checkFunction: (pose: PoseData) => ExerciseResult): ExerciseResult => {
    if (poseDataRef.current) {
      return checkFunction(poseDataRef.current)
    }
    return { correct: false, feedback: "No pose detected" }
  }, [])

  return { isReady, checkPose }
}

function drawKeypoints(keypoints: posenet.Keypoint[], ctx: CanvasRenderingContext2D) {
  keypoints.forEach((keypoint) => {
    if (keypoint.score > 0.2) {
      const { y, x } = keypoint.position
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, 2 * Math.PI)
      ctx.fillStyle = "red"
      ctx.fill()
    }
  })
}

function drawSkeleton(keypoints: posenet.Keypoint[], ctx: CanvasRenderingContext2D) {
  const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, 0.2)

  adjacentKeyPoints.forEach((keypoints) => {
    drawSegment(toTuple(keypoints[0].position), toTuple(keypoints[1].position), ctx)
  })
}

function drawSegment([ay, ax]: [number, number], [by, bx]: [number, number], ctx: CanvasRenderingContext2D) {
  ctx.beginPath()
  ctx.moveTo(ax, ay)
  ctx.lineTo(bx, by)
  ctx.lineWidth = 2
  ctx.strokeStyle = "red"
  ctx.stroke()
}

function toTuple({ y, x }: { y: number; x: number }): [number, number] {
  return [y, x]
}

