"use client";
import { Button } from "@/components/ui/button";
import { IconType } from "react-icons";
interface categoriesProps {
  lable: string;
  value?: string;
  icon?: IconType;
}
export const CategoryItems = ({
  lable,
  value,
  icon: Icon,
}: categoriesProps) => {
  return <Button> {Icon && <Icon size={20} />} </Button>;
};
