"use client";

// Next.js
import { useState } from "react";

// HTML Components
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Radar } from "lucide-react";

// Hooks
import { useIngestionTrigger } from "@/hooks/useIngestionTrigger";

export const RunIngestionSheet = () => {
  const { open, setOpen, isPending, run } = useIngestionTrigger();
  const [niche, setNiche] = useState("");
  const [city, setCity] = useState("");

  const canSubmit =
    niche.trim().length > 0 && city.trim().length > 0 && !isPending;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm">
          <Radar className="size-4" /> Run ingestion
        </Button>
      </SheetTrigger>
      <SheetContent className="gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Run Places ingestion</SheetTitle>
          <SheetDescription>
            Source new leads from Google Places by niche and city. They&apos;re
            audited, qualified, and drafted automatically.
          </SheetDescription>
        </SheetHeader>
        <form
          className="flex flex-col gap-4 px-4"
          onSubmit={(event) => {
            event.preventDefault();
            run({
              niche: niche.trim(),
              city: city.trim(),
              channel: "web_design",
            });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="ingest-niche">Niche</Label>
            <Input
              id="ingest-niche"
              placeholder="e.g. dentist, plumber, law firm"
              value={niche}
              onChange={(event) => setNiche(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ingest-city">City</Label>
            <Input
              id="ingest-city"
              placeholder="e.g. Hamilton, ON"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </div>
          <SheetFooter className="px-0">
            <Button type="submit" disabled={!canSubmit}>
              Start ingestion
              {isPending && <Loader2 className="size-4 animate-spin" />}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
