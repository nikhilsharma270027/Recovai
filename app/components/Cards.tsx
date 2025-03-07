import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Stethoscope, FileBarChart, AlarmClock } from "lucide-react";
import { JSX } from "react";

// Define TypeScript type for card data
interface CardItem {
  title: string;
  description: string;
  icon: JSX.Element;
}

// Data for cards
const cardData: CardItem[] = [
  {
    title: "Physical Therapy Assistant",
    description: "Personalized exercise and recovery plans with expert guidance.",
    icon: <Stethoscope className="w-10 h-10 text-blue-600" />,
  },
  {
    title: "Report Analysis & Personalized Medication",
    description: "AI-driven health report analysis with custom medication suggestions.",
    icon: <FileBarChart className="w-10 h-10 text-green-600" />,
  },
  {
    title: "Medication Timely Reminders",
    description: "Never miss a dose with smart, personalized medication reminders.",
    icon: <AlarmClock className="w-10 h-10 text-red-600" />,
  },
];

const Cards: React.FC = () => {
  return (
    <div className="grid gap-6 md:grid-cols-3 p-6">
      {cardData.map((card, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-lg border border-gray-200 bg-white rounded-2xl p-4">
            <CardHeader className="flex items-center gap-3">
              {card.icon}
              <CardTitle className="text-lg font-semibold">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 text-sm">
              {card.description}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default Cards;
