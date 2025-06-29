"use client";

import * as React from "react";
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const greetings = [
  "Halo Bro! 👋",
  "Gimana Kabarmu? 😊",
  "Semangat Yaaa! 🔥",
  "Ojo Lemes Lee 💪",
  "Tetap Waspada! 👀",
  "Hai Ganteng! 😎",
  "Hai Cantik! 😉",
];

export function UserNav() {
  const [name, setName] = React.useState("Sweet Delights");
  const [tempName, setTempName] = React.useState(name);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [greeting, setGreeting] = React.useState("");
  const [greetingIndex, setGreetingIndex] = React.useState(0);

  // For the dropdown menu greeting
  const selectRandomGreeting = React.useCallback(() => {
    setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
  }, []);

  React.useEffect(() => {
    selectRandomGreeting();
  }, [selectRandomGreeting]);
  
  // For the animated text next to the avatar
  React.useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIndex((prevIndex) => (prevIndex + 1) % greetings.length);
    }, 5000); // Change greeting every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);


  const handleProfileSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setName(tempName);
    selectRandomGreeting();
    setIsDialogOpen(false);
  };

  React.useEffect(() => {
    if (isDialogOpen) {
      setTempName(name);
    }
  }, [isDialogOpen, name]);
  
  const animatedGreeting = greetings[greetingIndex];

  return (
    <div className="flex items-center gap-4">
        <div className="hidden md:block">
            <AnimatePresence mode="wait">
                <motion.p
                    key={animatedGreeting}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ ease: "easeInOut", duration: 0.5 }}
                    className="text-sm text-muted-foreground font-medium"
                >
                    {animatedGreeting}
                </motion.p>
            </AnimatePresence>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border">
                    <AvatarImage src="" alt="User Avatar" />
                    <AvatarFallback>
                        <span className="sr-only">User</span>
                        <User className="h-5 w-5" />
                    </AvatarFallback>
                    </Avatar>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                        {greeting}
                    </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profil</span>
                    </DropdownMenuItem>
                    </DialogTrigger>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <Link href="/" passHref>
                    <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                    </DropdownMenuItem>
                </Link>
                </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleProfileSubmit}>
                <DialogHeader>
                    <DialogTitle>Edit Profil</DialogTitle>
                    <DialogDescription>
                    Buat perubahan pada profil Anda di sini. Klik simpan jika sudah selesai.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                        Nama
                    </Label>
                    <Input
                        id="name"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="col-span-3"
                    />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Simpan Perubahan</Button>
                </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
  );
}
