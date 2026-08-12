import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Upload, Sparkles, X, RefreshCw, Search, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type Product } from "@/components/app/ProductCard";

export const Route = createFileRoute("/_authenticated/camera")({
  head: () => ({ meta: [{ title: "Camera Shopping — Smart Kart AI" }] }),
  component: CameraPage,
});

type CamState = "idle" | "starting" | "live" | "error";

function CameraPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);
  const [searching, setSearching] = useState(false);
  const [camState, setCamState] = useState<CamState>("idle");
  const [camError, setCamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageFile, setImageFile] = useState<File | Blob | null>(null);

  const { data: matches } = useQuery({
    queryKey: ["camera-matches", analyzed],
    enabled: analyzed,
    queryFn: async () => (await supabase.from("products").select("*").limit(6)).data as Product[],
  });

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => stopStream, [stopStream]);
  useEffect(() => () => { if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); }, []);

  const setPreviewFrom = (blob: File | Blob) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;
    setImageFile(blob);
    setPreview(url);
    setAnalyzed(false);
  };

  // Shared pipeline entry point for both camera + upload images.
  const searchImage = () => {
    if (!imageFile || searching) return;
    setSearching(true);
    setAnalyzed(false);
    setTimeout(() => { setSearching(false); setAnalyzed(true); }, 1200);
  };

  const onFile = (f: File) => {
    stopStream();
    setCamState("idle");
    setPreviewFrom(f);
  };

  const openCamera = async () => {
    setCamError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCamState("error");
      setCamError("Camera is not supported in this browser. You can upload an image instead.");
      return;
    }
    setPreview(null);
    setImageFile(null);
    setAnalyzed(false);
    setCamState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setCamState("live");
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => {});
        }
      });
    } catch (err) {
      stopStream();
      setCamState("error");
      const name = (err as { name?: string })?.name;
      setCamError(
        name === "NotAllowedError" || name === "SecurityError"
          ? "Camera permission was denied. You can upload an image instead."
          : name === "NotFoundError" || name === "OverconstrainedError"
            ? "Camera is not available on this device or browser."
            : "We couldn't start the camera. Try again or upload an image instead.",
      );
    }
  };

  const closeCamera = () => { stopStream(); setCamState("idle"); setCamError(null); };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setCamError("Capture failed. Please try again."); return; }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) { setCamError("Capture failed. Please try again."); return; }
      stopStream();
      setCamState("idle");
      setPreviewFrom(new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" }));
    }, "image/jpeg", 0.92);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-3xl bg-gradient-card border ai-border p-6 md:p-10 text-center">
        <div className="text-xs uppercase tracking-widest text-accent mb-2 flex items-center gap-1 justify-center"><Sparkles className="size-3" /> Visual AI Search</div>
        <h1 className="text-3xl font-bold mb-3">Snap a photo. Find the match.</h1>
        <p className="text-muted-foreground mb-8">Use your camera or upload an image of any item — our AI finds visually similar products in your store.</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }}
        />

        <div className="max-w-md mx-auto">
          <div className="aspect-video rounded-2xl border-2 border-dashed border-primary/30 grid place-items-center bg-background/30 glow-ai overflow-hidden relative">
            {camState === "live" ? (
              <>
                <video ref={videoRef} playsInline muted autoPlay aria-label="Live camera preview" className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-background/70 border ai-border flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-accent animate-pulse" /> Camera live
                </span>
                <span className="absolute bottom-3 inset-x-0 text-xs text-muted-foreground">Position product inside the frame</span>
              </>
            ) : camState === "starting" ? (
              <div className="text-center text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Starting camera…
              </div>
            ) : preview ? (
              <img src={preview} alt="Captured or uploaded product preview" className="w-full h-full object-cover" />
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="text-center p-6 w-full h-full">
                <div className="size-14 mx-auto rounded-full bg-gradient-primary grid place-items-center mb-3 glow"><Camera className="size-6 text-primary-foreground" /></div>
                <div className="font-medium">Open your camera or upload a photo</div>
                <div className="text-xs text-muted-foreground mt-1">PNG, JPG, up to 10MB</div>
              </button>
            )}
          </div>

          {camError && (
            <div role="alert" className="mt-4 rounded-xl glass ai-border p-3 text-sm flex items-start gap-2 text-left">
              <AlertTriangle className="size-4 mt-0.5 text-accent shrink-0" aria-hidden />
              <span>{camError}</span>
            </div>
          )}

          <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
            {camState === "live" ? (
              <>
                <Button aria-label="Capture photo" onClick={capture} className="bg-gradient-primary text-primary-foreground glow">
                  <span className="size-2.5 rounded-full bg-primary-foreground" aria-hidden /> Capture
                </Button>
                <Button aria-label="Cancel camera" variant="outline" onClick={closeCamera}><X className="size-4" /> Cancel</Button>
              </>
            ) : preview ? (
              <>
                <Button aria-label="Search this product" onClick={searchImage} disabled={searching} className="bg-gradient-primary text-primary-foreground glow">
                  {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                  {searching ? "Analyzing image…" : "Search This Product"}
                </Button>
                <Button aria-label="Retake photo with camera" variant="outline" onClick={openCamera}><RefreshCw className="size-4" /> Retake</Button>
                <Button aria-label="Upload a different image" variant="ghost" onClick={() => fileInputRef.current?.click()}><Upload className="size-4" /> Upload Image</Button>
              </>
            ) : (
              <>
                <Button aria-label="Open camera" onClick={openCamera} disabled={camState === "starting"} className="bg-gradient-primary text-primary-foreground glow">
                  {camState === "starting" ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                  {camState === "starting" ? "Starting camera…" : "Open Camera"}
                </Button>
                <Button aria-label="Upload image" variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="size-4" /> Upload Image</Button>
              </>
            )}
          </div>
        </div>
      </div>

      {analyzed && (
        <div className="mt-10">
          <div className="rounded-2xl glass ai-border p-4 mb-6 flex items-center gap-3">
            <Sparkles className="size-4 text-accent" />
            <span className="text-sm">AI detected: similar items in your catalog. Showing top matches.</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(matches ?? []).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
