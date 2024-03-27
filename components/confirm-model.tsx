"use client";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogDescription,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogAction,
} from "./ui/alert-dialog";

interface confirmModelProps {
  children: React.ReactNode;
  onConfirm: () => void;
}

export const ConfirmModel = ({ children, onConfirm }: confirmModelProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ARU YOU SURE</AlertDialogTitle>
          <AlertDialogDescription>
            This action connont be undone!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
