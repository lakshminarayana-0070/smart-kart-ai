import { motion } from "framer-motion";
import { Brain, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyKnowledgeState({ onCreate, filtered }: { onCreate: () => void; filtered?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl glass ai-border p-10 md:p-16 grid place-items-center text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="absolute -top-20 -right-20 size-60 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-accent/20 blur-3xl" />

      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative size-20 rounded-3xl bg-gradient-primary grid place-items-center glow mb-5"
      >
        <Brain className="size-10 text-primary-foreground" />
        <Sparkles className="absolute -top-2 -right-2 size-5 text-accent animate-pulse" />
      </motion.div>

      <h2 className="relative text-2xl md:text-3xl font-bold">
        {filtered ? "No entries match your filters" : "Your AI knowledge base is empty"}
      </h2>
      <p className="relative mt-2 text-sm text-muted-foreground max-w-md">
        {filtered
          ? "Try clearing filters or searching for something else."
          : "Teach Smart Kart AI about your preferences, budget, brands, and business rules so it can respond with deeply personalized intelligence."}
      </p>
      {!filtered && (
        <Button onClick={onCreate} className="relative mt-6 bg-gradient-primary text-primary-foreground glow">
          <Plus className="size-4 mr-1" /> Create First Entry
        </Button>
      )}
    </motion.div>
  );
}