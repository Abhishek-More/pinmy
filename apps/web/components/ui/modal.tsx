"use client";

import React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/typography/Typography";

const buttonStyles = {
  submit:
    "cursor-pointer border-2 border-black bg-yellow-400 px-4 py-2 text-xs font-bold tracking-wide text-black uppercase hover:bg-yellow-300",
  secondary:
    "cursor-pointer border-2 border-black px-4 py-2 text-xs font-bold tracking-wide uppercase hover:bg-gray-100",
  danger:
    "cursor-pointer border-2 border-pink-400 px-4 py-2 text-xs font-bold tracking-wide text-pink-500 uppercase hover:bg-pink-50",
} as const;

interface ModalButtonProps {
  variant?: keyof typeof buttonStyles;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

function ModalButton({ variant = "submit", onClick, disabled, children }: ModalButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={buttonStyles[variant]}
    >
      {children}
    </Button>
  );
}

function Footer({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mt-6 border-t-2 border-dashed border-gray-300" />
      <div className="mt-5 flex items-center justify-between">{children}</div>
    </>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  disabled?: boolean;
  tag: string;
  tagColor: string;
  title: string;
  titleRight?: React.ReactNode;
  children: React.ReactNode;
}

function ModalRoot({
  open,
  onClose,
  disabled,
  tag,
  tagColor,
  title,
  titleRight,
  children,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && !disabled && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg border-[3px] border-black p-0 sm:max-w-lg"
      >
        <div className="absolute -top-3 right-4 left-4 flex items-center justify-between">
          <div
            className="flex items-center gap-1.5 border-2 border-black px-2 py-0.5"
            style={{ backgroundColor: tagColor }}
          >
            <div className="h-2 w-2 rounded-sm bg-black" />
            <Typography variant="tag">{tag}</Typography>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            disabled={disabled}
            className="cursor-pointer border-2 border-black bg-white hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-6 pt-8 pb-6">
          <div className="flex items-baseline justify-between">
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
            {titleRight}
          </div>

          <div className="mt-3 border-t-2 border-dashed border-gray-300" />

          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const Modal = Object.assign(ModalRoot, { Body, Footer, Button: ModalButton });
