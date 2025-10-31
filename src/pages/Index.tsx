import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Droplet } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary to-background">
      <div className="text-center px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 mb-6 shadow-[var(--shadow-blood)] animate-pulse">
          <Droplet className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="mb-6 text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
          Emergency Response System
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Connect with nearby hospitals and donors for urgent blood requirements
        </p>
        <Link to="/blood-connect">
          <Button size="lg" variant="blood" className="text-lg px-8 py-6">
            <Droplet className="mr-2" />
            Access BloodConnect
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
