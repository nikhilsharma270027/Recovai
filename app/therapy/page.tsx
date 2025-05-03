"use client";

import { useState, useRef, useEffect, useCallback, Ref, RefObject } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Play, Square, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePoseDetection } from "./hooks/usePoseDetection";
import { Sidebar } from "@/components/SideBar";
import { useAuth } from "context/AuthContext";

const exercises = [
  {
    id: "arm-raise",
    name: "Arm Raise",
    description: "Raise your arms to shoulder height and hold",
    targetReps: 10,
    holdTime: 5, // seconds
    checkPose: (pose: any) => {
      if (!pose || !pose.keypoints)
        return { correct: false, feedback: "No pose detected" };

      const leftShoulder = pose.keypoints[5];
      const leftElbow = pose.keypoints[7];
      const leftWrist = pose.keypoints[9];
      const rightShoulder = pose.keypoints[6];
      const rightElbow = pose.keypoints[8];
      const rightWrist = pose.keypoints[10];

      const requiredKeypoints = [
        leftShoulder,
        leftElbow,
        leftWrist,
        rightShoulder,
        rightElbow,
        rightWrist,
      ];
      const missingKeypoints = requiredKeypoints.filter(
        (kp) => !kp || kp.score < 0.3
      );

      if (missingKeypoints.length > 0) {
        return {
          correct: false,
          feedback: `Can't see ${missingKeypoints.length} required body parts. Please adjust your position.`,
        };
      }

      const shoulderHeight =
        (leftShoulder.position.y + rightShoulder.position.y) / 2;


      const tolerance = 40; // pixels
      const leftArmRaised =
        Math.abs(leftWrist.position.y - shoulderHeight) < tolerance;
      const rightArmRaised =
        Math.abs(rightWrist.position.y - shoulderHeight) < tolerance;

      const leftArmExtended =
        Math.abs(leftWrist.position.x - leftShoulder.position.x) > 100;
      const rightArmExtended =
        Math.abs(rightWrist.position.x - rightShoulder.position.x) > 100;

      if (
        leftArmRaised &&
        rightArmRaised &&
        leftArmExtended &&
        rightArmExtended
      ) {
        return {
          correct: true,
          feedback: "Perfect! Arms at shoulder height and extended",
        };
      } else if (!leftArmRaised && rightArmRaised) {
        return {
          correct: false,
          feedback: "Raise your left arm to shoulder height",
        };
      } else if (leftArmRaised && !rightArmRaised) {
        return {
          correct: false,
          feedback: "Raise your right arm to shoulder height",
        };
      } else if (!leftArmExtended && leftArmRaised) {
        return { correct: false, feedback: "Extend your left arm further out" };
      } else if (!rightArmExtended && rightArmRaised) {
        return {
          correct: false,
          feedback: "Extend your right arm further out",
        };
      } else {
        return {
          correct: false,
          feedback: "Raise both arms to shoulder height and extend them",
        };
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
      if (!pose || !pose.keypoints)
        return { correct: false, feedback: "No pose detected" };

      const leftHip = pose.keypoints[11];
      const leftKnee = pose.keypoints[13];
      const leftAnkle = pose.keypoints[15];
      const rightHip = pose.keypoints[12];
      const rightKnee = pose.keypoints[14];
      const rightAnkle = pose.keypoints[16];

      if (
        !leftHip ||
        !leftKnee ||
        !leftAnkle ||
        !rightHip ||
        !rightKnee ||
        !rightAnkle
      ) {
        return {
          correct: false,
          feedback: "Can't see all required body parts",
        };
      }

      // Check if knees are bent (y-coordinate of knee should be lower than a straight line between hip and ankle)
      const leftKneeBent =
        leftKnee.position.y >
        (leftHip.position.y + leftAnkle.position.y) / 2 + 15;
      const rightKneeBent =
        rightKnee.position.y >
        (rightHip.position.y + rightAnkle.position.y) / 2 + 15;

      if (leftKneeBent && rightKneeBent) {
        return {
          correct: true,
          feedback: "Good knee bend! Keep your back straight",
        };
      } else if (!leftKneeBent && rightKneeBent) {
        return { correct: false, feedback: "Bend your left knee more" };
      } else if (leftKneeBent && !rightKneeBent) {
        return { correct: false, feedback: "Bend your right knee more" };
      } else {
        return { correct: false, feedback: "Bend both knees slightly" };
      }
    },
  },
  {
    id: "squat",
    name: "Squat",
    description: "Bend your knees deeply while keeping your back straight",
    targetReps: 6,
    holdTime: 4,
    checkPose: (pose: any) => {
      if (!pose || !pose.keypoints)
        return { correct: false, feedback: "No pose detected" };

      const leftKnee = pose.keypoints[13];
      const rightKnee = pose.keypoints[14];

      if (!leftKnee || !rightKnee) {
        return { correct: false, feedback: "Can't see your knees" };
      }

      if (leftKnee.position.y > 400 && rightKnee.position.y > 400) {
        return {
          correct: true,
          feedback: "Good squat form! Hold this position",
        };
      } else {
        return {
          correct: false,
          feedback: "Lower your knees to complete the squat",
        };
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
      if (!pose || !pose.keypoints)
        return { correct: false, feedback: "No pose detected" };

      const leftHip = pose.keypoints[11];
      const leftKnee = pose.keypoints[13];
      const leftAnkle = pose.keypoints[15];
      const rightHip = pose.keypoints[12];
      const rightKnee = pose.keypoints[14];
      const rightAnkle = pose.keypoints[16];

      if (
        !leftHip ||
        !leftKnee ||
        !leftAnkle ||
        !rightHip ||
        !rightKnee ||
        !rightAnkle
      ) {
        return {
          correct: false,
          feedback: "Can't see all required body parts",
        };
      }

      // Check if either leg is raised to the side
      const leftLegRaised =
        Math.abs(leftAnkle.position.x - leftHip.position.x) > 50;
      const rightLegRaised =
        Math.abs(rightAnkle.position.x - rightHip.position.x) > 50;

      if (leftLegRaised && !rightLegRaised) {
        return {
          correct: true,
          feedback: "Good left leg raise! Keep your balance",
        };
      } else if (!leftLegRaised && rightLegRaised) {
        return {
          correct: true,
          feedback: "Good right leg raise! Keep your balance",
        };
      } else if (leftLegRaised && rightLegRaised) {
        return { correct: false, feedback: "Raise only one leg at a time" };
      } else {
        return { correct: false, feedback: "Raise one leg to the side" };
      }
    },
  },
];

export default function ExerciseTracker() {
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [isExercising, setIsExercising] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [repCount, setRepCount] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { user, loading } = useAuth();

  const { isReady, checkPose } = usePoseDetection(containerRef as RefObject<HTMLDivElement>);

  const exerciseLoop = useCallback(() => {
    if (!isExercising || !selectedExercise) return;

    const exercise = exercises.find((ex) => ex.id === selectedExercise);
    if (!exercise) return;

    const result = checkPose(exercise.checkPose);
    setFeedback(result.feedback);

    if (result.correct) {
      setHoldProgress((prev) => {
        const newProgress = prev + 100 / (exercise.holdTime * 10);
        if (newProgress >= 100) {
          setRepCount((prevCount) => {
            const newCount = prevCount + 1;
            if (newCount >= exercise.targetReps) {
              setIsExercising(false);
              return exercise.targetReps;
            }
            return newCount;
          });
          return 0;
        }
        return newProgress;
      });
    } else {
      setHoldProgress(0);
    }

    requestAnimationFrame(exerciseLoop);
  }, [isExercising, selectedExercise, checkPose]);

  useEffect(() => {
    if (isExercising) {
      requestAnimationFrame(exerciseLoop);
    }
  }, [isExercising, exerciseLoop]);

  const handleStartExercise = () => {
    if (!selectedExercise) {
      setFeedback("Please select an exercise first");
      return;
    }

    setIsExercising(true);
    setRepCount(0);
    setHoldProgress(0);
    setFeedback("Get into position...");
  };

  const handleStopExercise = () => {
    setIsExercising(false);
    setFeedback("");
    setHoldProgress(0);
  };

  const currentExercise = exercises.find((ex) => ex.id === selectedExercise);

  return (
    <div className="flex h-screen w-full">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-indigo-800">Exercise Therapy</h1>
          <p className="text-indigo-600 mt-1">Follow guided exercises with real-time feedback</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-none shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="text-xl flex items-center">
                <Play className="mr-2 h-5 w-5" />
                Exercise Selection
              </CardTitle>
              <CardDescription className="text-indigo-100">
                Choose an exercise to begin your therapy session
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label
                    htmlFor="exercise-select"
                    className="text-sm font-medium text-indigo-800">
                    Select Exercise
                  </label>
                  <Select
                    value={selectedExercise}
                    onValueChange={setSelectedExercise}>
                    <SelectTrigger
                      id="exercise-select"
                      className="w-full border border-indigo-200 rounded-lg px-4 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all">
                      <SelectValue placeholder="Select an exercise" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-indigo-100 rounded-lg shadow-lg mt-2">
                      {exercises.length > 0 ? (
                        exercises.map((exercise) => (
                          <SelectItem
                            key={exercise.id}
                            value={exercise.id}
                            className="px-4 py-3 hover:bg-indigo-50 transition-all cursor-pointer">
                            {exercise.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-4 text-gray-500 text-center">
                          No exercises available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {currentExercise && (
                  <div className="space-y-3 p-5 bg-indigo-50 rounded-lg border border-indigo-100">
                    <h3 className="font-semibold text-indigo-800 text-lg flex items-center">
                      <Info className="mr-2 h-4 w-4 text-indigo-500" />
                      {currentExercise.name}
                    </h3>
                    <p className="text-indigo-700">
                      {currentExercise.description}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-sm bg-white p-3 rounded-md shadow-sm">
                      <div>
                        <span className="font-medium text-gray-700">Target: </span>
                        <span className="text-indigo-600 font-semibold">{currentExercise.targetReps} reps</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Hold: </span>
                        <span className="text-indigo-600 font-semibold">{currentExercise.holdTime}s each</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={isExercising ? handleStopExercise : handleStartExercise}
                  variant={isExercising ? "destructive" : "default"}
                  disabled={!isReady}
                  className={`w-full py-6 text-lg font-medium ${
                    isExercising 
                      ? "bg-red-500 hover:bg-red-600" 
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  } text-white shadow-md transition-all duration-300`}>
                  {isExercising ? (
                    <>
                      <Square className="mr-2 h-5 w-5" />
                      Stop Exercise
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Start Exercise
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
            {isExercising && currentExercise && (
              <CardFooter className="flex flex-col items-start border-t border-indigo-100 pt-4">
                <div className="w-full space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-indigo-800">Exercise Progress:</span>
                    <span className="text-lg font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      {repCount} / {currentExercise.targetReps}
                    </span>
                  </div>
                  <Progress
                    value={(repCount / currentExercise.targetReps) * 100}
                    className="h-3"
                  />

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium text-indigo-800">Current Hold:</span>
                    <span className="text-sm text-indigo-600">{Math.round(holdProgress)}%</span>
                  </div>
                  <Progress 
                    value={holdProgress} 
                    className="h-3 " 
                  />

                  {feedback && (
                    <Alert
                      variant={holdProgress > 0 ? "default" : "destructive"}
                      className={`mt-4 border-l-4 ${
                        holdProgress > 0 
                          ? "border-l-green-500 bg-green-50" 
                          : "border-l-red-500 bg-red-50"
                      }`}>
                      {holdProgress > 0 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <AlertTitle className={holdProgress > 0 ? "text-green-800" : "text-red-800"}>
                        {holdProgress > 0 ? "Good Form" : "Needs Adjustment"}
                      </AlertTitle>
                      <AlertDescription className={holdProgress > 0 ? "text-green-700" : "text-red-700"}>
                        {feedback}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardFooter>
            )}
          </Card>

          <Card className="lg:col-span-2 border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-xl">Live Pose Tracking</CardTitle>
              <CardDescription className="text-blue-100">
                {isReady
                  ? "Your movements are being tracked in real-time"
                  : "Camera initializing..."}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div
                ref={containerRef}
                className="relative w-full aspect-video bg-black overflow-hidden"
                style={{ width: "100%", height: "480px" }}>
                {!isReady && (
                  <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-900 bg-opacity-80">
                    <div className="text-center">
                      <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-lg font-medium">Initializing camera...</p>
                      <p className="text-sm text-gray-300 mt-2">Please ensure your camera is connected and permissions are granted</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-indigo-50 text-center border-t border-indigo-100">
                <p className="text-sm text-indigo-600">
                  {isExercising 
                    ? "Follow the feedback instructions to complete your exercise correctly" 
                    : "Select an exercise and press Start to begin your therapy session"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}