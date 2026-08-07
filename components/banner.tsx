import { AlertTriangle, CheckCircleIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const bannerVarients = cva(
  "border px-4 py-3 text-sm flex items-center justify-center gap-2 w-full",
  {
    variants: {
      variant: {
        warning: "bg-[#fff4c7] border-[#ead7a0] text-[#715623]",
        success: "bg-[#e5f1e7] border-[#c9dfcd] text-[#55735b]",
      },
    },
    defaultVariants: {
      variant: "warning",
    },
  }
);

const iconMap = {
  warning: AlertTriangle,
  success: CheckCircleIcon,
};

interface BannerProps extends VariantProps<typeof bannerVarients> {
  label: string;
}

export const Banner = ({ label, variant }: BannerProps) => {
  const Icon = iconMap[variant || "warning"];

  return (
    <div className={cn(bannerVarients({ variant }))}>
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </div>
  );
};
