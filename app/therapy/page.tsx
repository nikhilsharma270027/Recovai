"use client"

import { useState } from "react"
import { useAuth } from "context/AuthContext"
import { Sidebar } from "@/components/SideBar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Play,
  CheckCircle,
  BarChart3,
  Activity,
  CalendarIcon,
  ChevronRight,
  Info,
  Award,
  Zap,
} from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

interface Exercise {
  id: string
  name: string
  duration: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  target: string
  completed: boolean
  progress: number
  imageUrl: string
}

export default function TherapyAssistant() {
  const { user, loading } = useAuth()
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)

  const exercises: Exercise[] = [
    {
      id: "ex1",
      name: "Shoulder Mobility",
      duration: "10 min",
      difficulty: "Beginner",
      target: "Rotator Cuff",
      completed: true,
      progress: 100,
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "ex2",
      name: "Knee Strengthening",
      duration: "15 min",
      difficulty: "Intermediate",
      target: "Quadriceps",
      completed: false,
      progress: 0,
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "ex3",
      name: "Lower Back Stability",
      duration: "12 min",
      difficulty: "Beginner",
      target: "Core",
      completed: false,
      progress: 0,
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "ex4",
      name: "Ankle Mobility",
      duration: "8 min",
      difficulty: "Beginner",
      target: "Ankle Joint",
      completed: true,
      progress: 100,
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "ex5",
      name: "Hip Flexor Stretch",
      duration: "10 min",
      difficulty: "Intermediate",
      target: "Hip Flexors",
      completed: false,
      progress: 65,
      imageUrl: "/placeholder.svg?height=200&width=300",
    },
  ]

  const completedExercises = exercises.filter((ex) => ex.completed).length
  const inProgressExercises = exercises.filter((ex) => !ex.completed && ex.progress > 0).length
  const totalProgress = exercises.reduce((acc, ex) => acc + ex.progress, 0) / exercises.length

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto bg-gray-50 ">
        <div className="container mx-auto py-6 px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Physical Therapy Assistant</h1>
              <p className="mt-2 text-muted-foreground">AI-driven exercises and real-time feedback</p>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule
              </Button>
              <Button size="sm">
                <Play className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            </div>
          </div>

          

<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
        <CheckCircle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {completedExercises}/{exercises.length}
        </div>
        <p className="text-xs text-muted-foreground">Exercises completed today</p>
        <div className="mt-3">
          <Progress value={totalProgress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  </motion.div>

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.1 }}
  >
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Weekly Streak</CardTitle>
        <Zap className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">5 days</div>
        <p className="text-xs text-muted-foreground">
          <span className="text-green-500">↑ 2 days</span> from last week
        </p>
        <div className="mt-3 flex space-x-1">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div
              key={day}
              className={`h-2 flex-1 rounded ${day <= 5 ? "bg-green-500" : "bg-gray-200"}`}
            ></div>
          ))}
        </div>
      </CardContent>
    </Card>
  </motion.div>

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: 0.2 }}
  >
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Recovery Score</CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">82/100</div>
        <p className="text-xs text-muted-foreground">
          <span className="text-green-500">↑ 7%</span> from initial assessment
        </p>
        <div className="mt-3">
          <div className="h-2 w-[82%] bg-green-500 rounded"></div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
</div>

          <Tabs defaultValue="exercises" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="exercises">Today's Exercises</TabsTrigger>
              <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
              <TabsTrigger value="plan">Recovery Plan</TabsTrigger>
            </TabsList>


<TabsContent value="exercises" className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {exercises.map((exercise) => (
      <motion.div
        key={exercise.id}
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card
          className={`cursor-pointer ${selectedExercise === exercise.id ? "ring-2 ring-primary" : ""}`}
          onClick={() => setSelectedExercise(exercise.id === selectedExercise ? null : exercise.id)}
        >
          <div className="relative">
            <Image
              src={exercise.imageUrl || "/placeholder.svg"}
              alt={exercise.name}
              width={300}
              height={200}
              className="w-full h-40 object-cover rounded-t-lg"
            />
            <div className="absolute top-2 right-2">
              <Badge
                variant={exercise.completed ? "default" : exercise.progress > 0 ? "secondary" : "outline"}
              >
                {exercise.completed ? "Completed" : exercise.progress > 0 ? "In Progress" : "Not Started"}
              </Badge>
            </div>
          </div>
          <CardHeader className="pb-2">
            <CardTitle>{exercise.name}</CardTitle>
            <CardDescription>Target: {exercise.target}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{exercise.duration}</span>
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{exercise.difficulty}</span>
              </div>
            </div>
            {exercise.progress > 0 && !exercise.completed && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{exercise.progress}%</span>
                </div>
                <Progress value={exercise.progress} className="h-1.5" />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" size="sm">
              {exercise.completed ? "View Details" : exercise.progress > 0 ? "Continue" : "Start Exercise"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    ))}
  </div>
</TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Recovery Progress</CardTitle>
                    <CardDescription>Track your improvement over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full bg-muted rounded-md flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Progress chart visualization</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recovery Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Range of Motion</span>
                            <span className="text-sm text-muted-foreground">85%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: "85%" }}></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Strength</span>
                            <span className="text-sm text-muted-foreground">72%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: "72%" }}></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Pain Level</span>
                            <span className="text-sm text-muted-foreground">25%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full">
                            <div className="h-full bg-yellow-500 rounded-full" style={{ width: "25%" }}></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Stability</span>
                            <span className="text-sm text-muted-foreground">68%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: "68%" }}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Exercises Completed</span>
                          <span className="font-medium">18/25</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Total Active Minutes</span>
                          <span className="font-medium">145 min</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Consistency Score</span>
                          <span className="font-medium">92%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Pain Reduction</span>
                          <span className="font-medium text-green-600">↓ 15%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="plan" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Your Recovery Plan</CardTitle>
                    <CardDescription>Personalized therapy program based on your condition</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="border-b pb-4">
                        <h3 className="font-medium text-lg mb-2">Phase 1: Initial Recovery (Current)</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Focus on reducing inflammation and restoring basic range of motion.
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>75% Complete</span>
                        </div>
                        <Progress value={75} className="h-2 mt-1" />
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-start">
                            <div className="mr-3 mt-0.5 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-700 text-xs">1</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Gentle Mobility Exercises</p>
                              <p className="text-xs text-muted-foreground mt-1">3-4 times per week</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="mr-3 mt-0.5 h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-700 text-xs">2</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Light Stretching</p>
                              <p className="text-xs text-muted-foreground mt-1">Daily, 5-10 minutes</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-b pb-4">
                        <h3 className="font-medium text-lg mb-2">Phase 2: Strength Building</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Focus on rebuilding muscle strength and improving stability.
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>Not Started</span>
                        </div>
                        <Progress value={0} className="h-2 mt-1" />
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-start">
                            <div className="mr-3 mt-0.5 h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">1</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Progressive Resistance Training</p>
                              <p className="text-xs text-muted-foreground mt-1">3 times per week</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="mr-3 mt-0.5 h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">2</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Balance Exercises</p>
                              <p className="text-xs text-muted-foreground mt-1">2-3 times per week</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-lg mb-2">Phase 3: Functional Recovery</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Focus on returning to normal activities and preventing future injuries.
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>Not Started</span>
                        </div>
                        <Progress value={0} className="h-2 mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Upcoming Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-3 bg-muted rounded-md">
                          <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Mobility Session</p>
                            <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-muted rounded-md">
                          <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Progress Assessment</p>
                            <p className="text-xs text-muted-foreground">Friday, 2:30 PM</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3 p-3 bg-muted rounded-md">
                          <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Strength Training</p>
                            <p className="text-xs text-muted-foreground">Monday, 11:00 AM</p>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full mt-4" size="sm">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        View Full Schedule
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Therapist Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm">
                              Good progress on shoulder mobility. Continue with current exercises and gradually increase
                              repetitions.
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Dr. Sarah Johnson - 3 days ago</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="text-sm">
                              Pay special attention to form during knee exercises. Avoid overextension.
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Dr. Sarah Johnson - 1 week ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

