// components/DeliveryExceptions.tsx
import React, { useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ColorType = "green" | "blue" | "red";

interface SemiCircleProgressProps {
  percentage: number;
  size?: "sm" | "md" | "lg";
  color?: ColorType;
}

const sizeClasses = {
  sm: "w-32 h-16",
  md: "w-48 h-24",
  lg: "w-64 h-32",
} as const;

const gradientClasses = {
  green: "progress-gradient-green",
  blue: "progress-gradient-blue",
  red: "progress-gradient-red",
} as const;

const SemiCircleProgress: React.FC<SemiCircleProgressProps> = ({
  percentage,
  size = "md",
  color = "green",
}) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const baseRotate = -90;
  const rotate = baseRotate + (percentage * 180) / 100;

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.setProperty(
        "--progress-rotation",
        `${rotate}deg`,
      );
    }
  }, [rotate]);

  return (
    <div className={cn("relative", sizeClasses[size])}>
      {/* Background semi-circle */}
      <div className="absolute w-full h-full rounded-t-full bg-muted" />
      {/* Progress semi-circle */}
      <div
        ref={progressRef}
        className={cn(
          "absolute w-full h-full rounded-t-full origin-bottom",
          "transition-transform duration-1000 ease-in-out",
          "progress-semicircle",
          gradientClasses[color],
        )}
      />
      {/* Center dot */}
      <div className="absolute bottom-0 left-1/2 w-4 h-4 -ml-2 rounded-full bg-background border-2 border-border" />
    </div>
  );
};

const DeliveryExceptions: React.FC = () => {
  const percentage = 65;

  const getColor = (value: number): ColorType => {
    if (value >= 70) return "green";
    if (value >= 40) return "blue";
    return "red";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          Delivery Exceptions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-6 py-6">
          <div className="relative">
            <SemiCircleProgress
              percentage={percentage}
              size="md"
              color={getColor(percentage)}
            />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
              <div className="text-3xl font-bold">{percentage}%</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full progress-gradient-green" />
              <span className="text-sm text-muted-foreground">Good (≥70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full progress-gradient-blue" />
              <span className="text-sm text-muted-foreground">
                Average (40-69%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full progress-gradient-red" />
              <span className="text-sm text-muted-foreground">
                Poor (&lt;40%)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryExceptions;
