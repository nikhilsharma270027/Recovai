"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle2, Play, Square } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { usePoseDetection } from "./hooks/usePoseDetection"
import { Sidebar } from "@/components/SideBar"
import { useAuth } from "context/AuthContext"


const exercises = [
  {
    id: "arm-raise",
    name: "Arm Raise",
    description: "Raise your arms to shoulder height and hold",
    targetReps: 10,
    holdTime: 5, // seconds
    checkPose: (pose: any) => {
      if (!pose || !pose.keypoints) return { correct: false, feedback: "No pose detected" }

      const leftShoulder = pose.keypoints[5]
      const leftElbow = pose.keypoints[7]
      const leftWrist = pose.keypoints[9]
      const rightShoulder = pose.keypoints[6]
      const rightElbow = pose.keypoints[8]
      const rightWrist = pose.keypoints[10]

      // Check if all required keypoints are detected with sufficient confidence
      const requiredKeypoints = [leftShoulder, leftElbow, leftWrist, rightShoulder, rightElbow, rightWrist]
      const missingKeypoints = requiredKeypoints.filter((kp) => !kp || kp.score < 0.3)

      if (missingKeypoints.length > 0) {
        return {
          correct: false,
          feedback: `Can't see ${missingKeypoints.length} required body parts. Please adjust your position.`,
        }
      }

      // Calculate shoulder height (average of left and right)
      const shoulderHeight = (leftShoulder.position.y + rightShoulder.position.y) / 2

      // Check if arms are at shoulder height (y-coordinate of wrist should be similar to shoulder)
      // Allow for some tolerance in the position
      const tolerance = 40 // pixels
      const leftArmRaised = Math.abs(leftWrist.position.y - shoulderHeight) < tolerance
      const rightArmRaised = Math.abs(rightWrist.position.y - shoulderHeight) < tolerance

      // Check if arms are extended (elbow and wrist should be far from shoulder horizontally)
      const leftArmExtended = Math.abs(leftWrist.position.x - leftShoulder.position.x) > 100
      const rightArmExtended = Math.abs(rightWrist.position.x - rightShoulder.position.x) > 100

      if (leftArmRaised && rightArmRaised && leftArmExtended && rightArmExtended) {
        return { correct: true, feedback: "Perfect! Arms at shoulder height and extended" }
      } else if (!leftArmRaised && rightArmRaised) {
        return { correct: false, feedback: "Raise your left arm to shoulder height" }
      } else if (leftArmRaised && !rightArmRaised) {
        return { correct: false, feedback: "Raise your right arm to shoulder height" }
      } else if (!leftArmExtended && leftArmRaised) {
        return { correct: false, feedback: "Extend your left arm further out" }
      } else if (!rightArmExtended && rightArmRaised) {
        return { correct: false, feedback: "Extend your right arm further out" }
      } else {
        return { correct: false, feedback: "Raise both arms to shoulder height and extend them" }
      }
    },
  },
  {
    id: "knee-bend",
    name: "Knee Bend",
    description: "Bend your knees slightly while keeping your back straight",
    targetReps: 8,
    holdTime: 3, // seconds
    checkPose: (pose: any) => {
      if (!pose || !pose.keypoints) return { correct: false, feedback: "No pose detected" }

      const leftHip = pose.keypoints[11]
      const leftKnee = pose.keypoints[13]
      const leftAnkle = pose.keypoints[15]
      const rightHip = pose.keypoints[12]
      const rightKnee = pose.keypoints[14]
      const rightAnkle = pose.keypoints[16]

      if (!leftHip || !leftKnee || !leftAnkle || !rightHip || !rightKnee || !rightAnkle) {
        return { correct: false, feedback: "Can't see all required body parts" }
      }

      // Check if knees are bent (y-coordinate of knee should be lower than a straight line between hip and ankle)
      const leftKneeBent = leftKnee.position.y > (leftHip.position.y + leftAnkle.position.y) / 2 + 15
      const rightKneeBent = rightKnee.position.y > (rightHip.position.y + rightAnkle.position.y) / 2 + 15

      if (leftKneeBent && rightKneeBent) {
        return { correct: true, feedback: "Good knee bend! Keep your back straight" }
      } else if (!leftKneeBent && rightKneeBent) {
        return { correct: false, feedback: "Bend your left knee more" }
      } else if (leftKneeBent && !rightKneeBent) {
        return { correct: false, feedback: "Bend your right knee more" }
      } else {
        return { correct: false, feedback: "Bend both knees slightly" }
      }
    },
  },
  {
    id: "squat",
    name: "Squat",
    description: "Bend your knees deeply while keeping your back straight",
    targetReps: 6,
    holdTime: 4, // seconds
    checkPose: (pose: any) => {
      if (!pose || !pose.keypoints) return { correct: false, feedback: "No pose detected" }

      const leftKnee = pose.keypoints[13]
      const rightKnee = pose.keypoints[14]

      if (!leftKnee || !rightKnee) {
        return { correct: false, feedback: "Can't see your knees" }
      }

      if (leftKnee.position.y > 400 && rightKnee.position.y > 400) {
        return { correct: true, feedback: "Good squat form! Hold this position" }
      } else {
        return { correct: false, feedback: "Lower your knees to complete the squat" }
      }
    },
  },
  {
    id: "leg-raise",
    name: "Leg Raise",
    description: "Raise one leg to the side while maintaining balance",
    targetReps: 6,
    holdTime: 4, // seconds
    checkPose: (pose: any) => {
      if (!pose || !pose.keypoints) return { correct: false, feedback: "No pose detected" }

      const leftHip = pose.keypoints[11]
      const leftKnee = pose.keypoints[13]
      const leftAnkle = pose.keypoints[15]
      const rightHip = pose.keypoints[12]
      const rightKnee = pose.keypoints[14]
      const rightAnkle = pose.keypoints[16]

      if (!leftHip || !leftKnee || !leftAnkle || !rightHip || !rightKnee || !rightAnkle) {
        return { correct: false, feedback: "Can't see all required body parts" }
      }

      // Check if either leg is raised to the side
      const leftLegRaised = Math.abs(leftAnkle.position.x - leftHip.position.x) > 50
      const rightLegRaised = Math.abs(rightAnkle.position.x - rightHip.position.x) > 50

      if (leftLegRaised && !rightLegRaised) {
        return { correct: true, feedback: "Good left leg raise! Keep your balance" }
      } else if (!leftLegRaised && rightLegRaised) {
        return { correct: true, feedback: "Good right leg raise! Keep your balance" }
      } else if (leftLegRaised && rightLegRaised) {
        return { correct: false, feedback: "Raise only one leg at a time" }
      } else {
        return { correct: false, feedback: "Raise one leg to the side" }
      }
    },
  },
]

export default function ExerciseTracker() {
  const [selectedExercise, setSelectedExercise] = useState<string>("")
  const [isExercising, setIsExercising] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [repCount, setRepCount] = useState(0)
  const [holdProgress, setHoldProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)


  const { user, loading } = useAuth();


  const { isReady, checkPose } = usePoseDetection(containerRef)

  const exerciseLoop = useCallback(() => {
    if (!isExercising || !selectedExercise) return

    const exercise = exercises.find((ex) => ex.id === selectedExercise)
    if (!exercise) return

    const result = checkPose(exercise.checkPose)
    setFeedback(result.feedback)

    if (result.correct) {
      setHoldProgress((prev) => {
        const newProgress = prev + 100 / (exercise.holdTime * 10)
        if (newProgress >= 100) {
          setRepCount((prevCount) => {
            const newCount = prevCount + 1
            if (newCount >= exercise.targetReps) {
              setIsExercising(false)
              return exercise.targetReps
            }
            return newCount
          })
          return 0
        }
        return newProgress
      })
    } else {
      setHoldProgress(0)
    }

    requestAnimationFrame(exerciseLoop)
  }, [isExercising, selectedExercise, checkPose])

  useEffect(() => {
    if (isExercising) {
      requestAnimationFrame(exerciseLoop)
    }
  }, [isExercising, exerciseLoop])

  const handleStartExercise = () => {
    if (!selectedExercise) {
      setFeedback("Please select an exercise first")
      return
    }

    setIsExercising(true)
    setRepCount(0)
    setHoldProgress(0)
    setFeedback("Get into position...")
  }

  const handleStopExercise = () => {
    setIsExercising(false)
    setFeedback("")
    setHoldProgress(0)
  }

  const currentExercise = exercises.find((ex) => ex.id === selectedExercise)

  return (

    <div className="flex h-screen w-full">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-100 to-blue-50 p-10">



        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Exercise Selection</CardTitle>
              <CardDescription>Choose an exercise to begin your therapy session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="exercise-select" className="text-sm font-medium">
                    Select Exercise
                  </label>
                  <Select disabled={isExercising} value={selectedExercise} onValueChange={setSelectedExercise}>
                    <SelectTrigger id="exercise-select">
                      <SelectValue placeholder="Select an exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {exercises.map((exercise) => (
                        <SelectItem key={exercise.id} value={exercise.id}>
                          {exercise.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {currentExercise && (
                  <div className="space-y-2 p-4 bg-muted rounded-md">
                    <h3 className="font-medium">{currentExercise.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentExercise.description}</p>
                    <div className="text-sm">
                      <span className="font-medium">Target: </span>
                      {currentExercise.targetReps} reps, hold for {currentExercise.holdTime} seconds each
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button
                    onClick={isExercising ? handleStopExercise : handleStartExercise}
                    variant={isExercising ? "destructive" : "default"}
                    disabled={!isReady}
                  >
                    {isExercising ? (
                      <>
                        <Square className="mr-2 h-4 w-4" />
                        Stop Exercise
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Exercise
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              {isExercising && currentExercise && (
                <div className="w-full space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progress:</span>
                    <span className="text-sm">
                      {repCount} / {currentExercise.targetReps} reps
                    </span>
                  </div>
                  <Progress value={(repCount / currentExercise.targetReps) * 100} className="h-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Current Hold:</span>
                  </div>
                  <Progress value={holdProgress} className="h-2" />

                  {feedback && (
                    <Alert variant={holdProgress > 0 ? "default" : "destructive"}>
                      {holdProgress > 0 ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                      <AlertTitle>{holdProgress > 0 ? "Good Form" : "Needs Adjustment"}</AlertTitle>
                      <AlertDescription>{feedback}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Pose Tracking</CardTitle>
              <CardDescription>
                {isReady ? "Your movements are being tracked in real-time" : "Camera initializing..."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div
                ref={containerRef}
                className="relative w-full aspect-video bg-black rounded-md overflow-hidden"
                style={{ width: "100%", height: "480px" }}
              >
                {!isReady && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">Loading camera...</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>



      </main>
    </div>


  )
}

