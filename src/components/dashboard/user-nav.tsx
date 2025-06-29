"use client";

import * as React from "react";
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";
import Cropper, { type Area } from 'react-easy-crop';
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
import { Slider } from "@/components/ui/slider";
import getCroppedImg from "@/lib/image-utils";

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
  const [isGreetingVisible, setIsGreetingVisible] = React.useState(true);
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [tempAvatarUrl, setTempAvatarUrl] = React.useState(avatarUrl);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isImageViewerOpen, setImageViewerOpen] = React.useState(false);

  // States for image cropper
  const [imageToCrop, setImageToCrop] = React.useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = React.useState(false);
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null);

  const selectRandomGreeting = React.useCallback(() => {
    setGreeting((currentGreeting) => {
      let newGreeting;
      do {
        newGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      } while (newGreeting === currentGreeting);
      return newGreeting;
    });
  }, []);

  React.useEffect(() => {
    selectRandomGreeting();
  }, [selectRandomGreeting]);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setIsGreetingVisible(prev => !prev);
    }, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const handleProfileSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setName(tempName);
    setAvatarUrl(tempAvatarUrl);
    selectRandomGreeting();
    setIsDialogOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setIsCropperOpen(true);
        setZoom(1);
        setRotation(0);
      };
      reader.readAsDataURL(file);
    }
     if (event.target) {
      event.target.value = "";
    }
  };

  React.useEffect(() => {
    if (isDialogOpen) {
      setTempName(name);
      setTempAvatarUrl(avatarUrl);
    }
  }, [isDialogOpen, name, avatarUrl]);
  
  const onCropComplete = React.useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = React.useCallback(async () => {
    if (!imageToCrop || !croppedAreaPixels) {
      return;
    }
    try {
      const croppedImage = await getCroppedImg(
        imageToCrop,
        croppedAreaPixels,
        rotation
      );
      if (croppedImage) {
        setTempAvatarUrl(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
    setIsCropperOpen(false);
  }, [imageToCrop, croppedAreaPixels, rotation]);


  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:block h-5">
        <AnimatePresence>
          {isGreetingVisible && (
            <motion.p
              key={greeting}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ ease: "easeInOut", duration: 1.5 }}
              className="text-sm text-muted-foreground font-medium"
            >
              {greeting}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={avatarUrl} alt="User Avatar" className="object-cover" />
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
              <div className="flex flex-col items-center gap-4">
                <Dialog open={isImageViewerOpen} onOpenChange={setImageViewerOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      disabled={!tempAvatarUrl}
                      className="disabled:cursor-not-allowed rounded-full"
                    >
                      <Avatar className="h-24 w-24 border hover:opacity-80 transition-opacity">
                        <AvatarImage src={tempAvatarUrl} alt="User Avatar" className="object-cover" />
                        <AvatarFallback>
                          <User className="h-12 w-12" />
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DialogTrigger>
                  {tempAvatarUrl && (
                    <DialogContent className="p-0 border-0 max-w-fit bg-transparent shadow-none">
                      <img
                        src={tempAvatarUrl}
                        alt="Pratinjau Avatar Pengguna"
                        className="max-w-[80vw] max-h-[80vh] rounded-lg object-contain"
                      />
                    </DialogContent>
                  )}
                </Dialog>
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Ubah Foto
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
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
      
      <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
          <DialogContent className="sm:max-w-[425px] md:max-w-lg">
              <DialogHeader>
                  <DialogTitle>Sesuaikan Gambar</DialogTitle>
                  <DialogDescription>
                      Pangkas, perbesar, dan putar gambar Anda.
                  </DialogDescription>
              </DialogHeader>
              <div className="relative w-full h-80 bg-muted rounded-md overflow-hidden">
                  {imageToCrop && (
                      <Cropper
                          image={imageToCrop}
                          crop={crop}
                          zoom={zoom}
                          rotation={rotation}
                          aspect={1}
                          cropShape="round"
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onRotationChange={setRotation}
                          onCropComplete={onCropComplete}
                      />
                  )}
              </div>
              <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                      <Label htmlFor="zoom">Perbesar</Label>
                      <Slider
                          id="zoom"
                          min={1}
                          max={3}
                          step={0.1}
                          value={[zoom]}
                          onValueChange={(value) => setZoom(value[0])}
                          className="w-full"
                      />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="rotation">Putar</Label>
                      <Slider
                          id="rotation"
                          min={0}
                          max={360}
                          step={1}
                          value={[rotation]}
                          onValueChange={(value) => setRotation(value[0])}
                          className="w-full"
                      />
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCropperOpen(false)}>Batal</Button>
                  <Button onClick={showCroppedImage}>Simpan Avatar</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
