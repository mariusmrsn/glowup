"use client";

import { useState, useTransition, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Pencil, X, Save, Camera, Loader2, Globe, Lock } from "lucide-react";
import { updateProfile, uploadAvatar } from "@/server/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/types";

interface Props {
  user: User & { height_cm?: number | null; weight_kg?: number | null; bio?: string | null; is_public?: boolean };
}

function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Untergewicht", color: "#3B82F6" };
  if (bmi < 25) return { label: "Normalgewicht ✓", color: "#10B981" };
  if (bmi < 30) return { label: "Übergewicht", color: "#F59E0B" };
  return { label: "Starkes Übergewicht", color: "#EF4444" };
}

export function ProfileEditClient({ user }: Props) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isUploadingAvatar, startAvatarUpload] = useTransition();
  const [bio, setBio] = useState(user.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url ?? "");
  const [heightCm, setHeightCm] = useState(user.height_cm ? String(user.height_cm) : "");
  const [weightKg, setWeightKg] = useState(user.weight_kg ? String(user.weight_kg) : "");
  const [isPublic, setIsPublic] = useState(user.is_public ?? true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const h = parseFloat(heightCm) || 0;
  const w = parseFloat(weightKg) || 0;
  const bmi = h > 0 && w > 0 ? w / Math.pow(h / 100, 2) : null;
  const bmiCat = bmi ? getBMICategory(bmi) : null;

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const localUrl = URL.createObjectURL(file);
    setAvatarUrl(localUrl);

    const formData = new FormData();
    formData.append("avatar", file);

    startAvatarUpload(async () => {
      try {
        const newUrl = await uploadAvatar(formData);
        setAvatarUrl(newUrl);
        toast.success("Profilbild aktualisiert!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload fehlgeschlagen");
        setAvatarUrl(user.avatar_url ?? "");
      } finally {
        // Reset so same file can be picked again
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateProfile({
          bio,
          height_cm: heightCm ? parseInt(heightCm) : null,
          weight_kg: weightKg ? parseFloat(weightKg) : null,
          is_public: isPublic,
        });
        toast.success("Profil gespeichert!");
        setEditing(false);
      } catch {
        toast.error("Fehler beim Speichern");
      }
    });
  };

  if (!editing) {
    return (
      <div className="space-y-4">
        {/* Clickable avatar even outside edit mode */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <Avatar className="w-24 h-24 ring-4 ring-indigo-500/20 ring-offset-2 ring-offset-background">
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-600 dark:text-indigo-400 text-3xl font-black">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {isUploadingAvatar
                ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                : <Camera className="w-6 h-6 text-white" />}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">Bild anklicken zum Ändern</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-muted-foreground text-center italic">„{user.bio}"</p>
        )}

        {/* Body stats */}
        {(user.height_cm || user.weight_kg) && (
          <div className="grid grid-cols-3 gap-3">
            {user.height_cm && (
              <div className="app-card p-3 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Größe</p>
                <p className="font-bold text-foreground">{user.height_cm} cm</p>
              </div>
            )}
            {user.weight_kg && (
              <div className="app-card p-3 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Gewicht</p>
                <p className="font-bold text-foreground">{user.weight_kg} kg</p>
              </div>
            )}
            {bmi && bmiCat && (
              <div className="app-card p-3 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">BMI</p>
                <p className="font-bold" style={{ color: bmiCat.color }}>{bmi.toFixed(1)}</p>
                <p className="text-[10px]" style={{ color: bmiCat.color }}>{bmiCat.label}</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setEditing(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5" />
          Profil bearbeiten
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Profil bearbeiten</h3>
        <button onClick={() => setEditing(false)} className="p-1 rounded-lg hover:bg-secondary cursor-pointer">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Clickable avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center gap-2">
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
          <Avatar className="w-20 h-20 ring-4 ring-indigo-500/20 ring-offset-2 ring-offset-background">
            <AvatarImage src={avatarUrl || ""} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-600 dark:text-indigo-400 text-2xl font-black">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {isUploadingAvatar
              ? <Loader2 className="w-5 h-5 text-white animate-spin" />
              : <Camera className="w-5 h-5 text-white" />}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {isUploadingAvatar ? "Wird hochgeladen…" : "Bild aus Galerie wählen (max. 5 MB)"}
        </p>
      </div>

      {/* Bio */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
          Bio <span className="normal-case font-normal">(max. 200 Zeichen)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 200))}
          placeholder="Schreib etwas über dich…"
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
        <p className="text-[11px] text-muted-foreground text-right">{bio.length}/200</p>
      </div>

      {/* Height + Weight */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
            Größe (cm)
          </label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="z.B. 175"
            min={100} max={250}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1.5">
            Gewicht (kg)
          </label>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="z.B. 70"
            min={30} max={300} step={0.1}
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
      </div>

      {/* Live BMI preview */}
      {bmi && bmiCat && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl p-3 border"
          style={{ borderColor: `${bmiCat.color}30`, background: `${bmiCat.color}0d` }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">BMI</span>
            <span className="font-bold text-sm" style={{ color: bmiCat.color }}>
              {bmi.toFixed(1)} · {bmiCat.label}
            </span>
          </div>
          <div className="h-1.5 bg-border rounded-full mt-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min((bmi / 40) * 100, 100)}%`, background: bmiCat.color }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Untergewicht &lt;18.5</span>
            <span>Normal 18.5–25</span>
            <span>Über 25+</span>
          </div>
        </motion.div>
      )}

      {/* Privacy toggle */}
      <button
        type="button"
        onClick={() => setIsPublic((v) => !v)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
          isPublic
            ? "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
            : "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
        }`}
      >
        {isPublic ? (
          <Globe className="w-4 h-4 text-green-500 shrink-0" />
        ) : (
          <Lock className="w-4 h-4 text-amber-500 shrink-0" />
        )}
        <div className="text-left flex-1">
          <p className="text-xs font-semibold text-foreground">
            {isPublic ? "Öffentlich sichtbar" : "Privat — nur per Suche findbar"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {isPublic
              ? "Du erscheinst in der globalen Rangliste. Jeder kann dein Profil sehen."
              : "Du wirst nicht in der Rangliste angezeigt. Nur wer deinen genauen Benutzernamen sucht, findet dich."}
          </p>
        </div>
        <div className={`w-9 h-5 rounded-full transition-colors ${isPublic ? "bg-green-500" : "bg-amber-500"} relative shrink-0`}>
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isPublic ? "left-[18px]" : "left-0.5"}`} />
        </div>
      </button>

      <button
        onClick={handleSave}
        disabled={isPending || isUploadingAvatar}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {isPending ? "Speichere…" : "Speichern"}
      </button>
    </motion.div>
  );
}
