import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
}

export const LoadingSpinner = ({ size = 24, className, ...props }: LoadingSpinnerProps) => {
  return (
    <Loader2
      size={size}
      className={cn("animate-spin text-primary", className)}
      {...props}
    />
  );
};
