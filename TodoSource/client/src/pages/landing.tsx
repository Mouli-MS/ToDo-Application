import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-8 pb-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <i className="fas fa-check-circle text-primary text-4xl mr-3"></i>
              <h1 className="text-3xl font-bold text-foreground">TodoApp</h1>
            </div>
            <p className="text-muted-foreground mb-8">
              Manage your tasks efficiently and stay productive
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full"
              data-testid="button-login"
            >
              Sign In to Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
