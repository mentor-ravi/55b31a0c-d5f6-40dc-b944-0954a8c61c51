import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Briefcase, Clock, Bell, Search, Building2, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useProtectedAction } from "@/hooks/useProtectedAction";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/integrations/supabase/client";

interface Internship {
  id: string;
  title: string;
  company: string;
  description: string | null;
  duration: string | null;
}

const Career = () => {
  const { toast } = useToast();
  const { 
    showAuthModal, 
    setShowAuthModal, 
    executeProtectedAction, 
    completePendingAction, 
    clearPendingAction 
  } = useProtectedAction();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('internships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInternships(data || []);
    } catch (error) {
      console.error('Error fetching internships:', error);
      toast({
        title: "Error loading internships",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    completePendingAction((action) => {
      if (action.type === 'apply_internship' && action.data) {
        setSelectedInternship(action.data);
        setIsApplyDialogOpen(true);
      }
    });
  }, [completePendingAction]);

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (internship.description && internship.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleViewDetails = (internship: Internship) => {
    setSelectedInternship(internship);
    setIsDetailsDialogOpen(true);
  };
  
  const handleApply = (internship: Internship) => {
    setSelectedInternship(internship);
    executeProtectedAction('apply_internship', internship, () => {
      setIsApplyDialogOpen(true);
    });
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInternship) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('internship_applications')
      .insert({
        internship_id: selectedInternship.id,
        user_id: user.id,
        status: 'applied'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Application Submitted!",
        description: `Your application for ${selectedInternship?.title} has been received.`,
      });
      setIsApplyDialogOpen(false);
    }
  };

  const handleNotifyMe = () => {
    toast({
      title: "You're on the waitlist!",
      description: "We'll notify you when new opportunities are available."
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => {
          setShowAuthModal(false);
          clearPendingAction();
        }} 
      />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold animate-fade-in-up">
              Kickstart Your Career with
              <span className="block mt-2 bg-clip-text text-transparent bg-gradient-primary">
                Real-World Internships
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground animate-fade-in-up" style={{
              animationDelay: "0.2s"
            }}>
              Work with experienced mentors, build real projects, and earn certificates that matter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in-up" style={{
              animationDelay: "0.4s"
            }}>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search internships..." 
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Internship Listings */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">Loading internships...</p>
            </div>
          ) : filteredInternships.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">No internships available</p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {filteredInternships.map((internship, index) => {
                const cardColors = [
                  { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", iconBg: "bg-blue-500" },
                  { bg: "bg-pink-50 dark:bg-pink-950/30", border: "border-pink-200 dark:border-pink-800", iconBg: "bg-pink-500" },
                  { bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-200 dark:border-cyan-800", iconBg: "bg-cyan-500" }
                ];
                const colorScheme = cardColors[index % 3];
                
                return (
                  <Card key={internship.id} className={`${colorScheme.bg} ${colorScheme.border} border-2 overflow-hidden group animate-fade-in-up hover-lift`} style={{
                    animationDelay: `${index * 0.1}s`
                  }}>
                    <CardHeader className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-lg ${colorScheme.iconBg} w-fit`}>
                          <Briefcase className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-2xl">
                        {internship.title}
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed line-clamp-3">
                        {internship.description || 'No description available'}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {internship.company}
                        </Badge>
                        {internship.duration && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {internship.duration}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline"
                          className="flex-1 gap-2"
                          onClick={() => handleViewDetails(internship)}
                        >
                          View Details
                        </Button>
                        <Button 
                          className="flex-1 gap-2 shadow-sm"
                          onClick={() => handleApply(internship)}
                        >
                          Apply Now
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Details Dialog */}
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedInternship?.title}</DialogTitle>
                <DialogDescription>
                  {selectedInternship?.company}
                </DialogDescription>
              </DialogHeader>
              
              {selectedInternship && (
                <div className="space-y-6 pt-4">
                  {selectedInternship.duration && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{selectedInternship.duration}</span>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-lg mb-3">Description</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedInternship.description || 'No description available'}
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="w-full" size="lg" onClick={() => {
                      setIsDetailsDialogOpen(false);
                      handleApply(selectedInternship);
                    }}>
                      Apply for This Internship
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Apply Dialog */}
          <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Apply for {selectedInternship?.title}</DialogTitle>
                <DialogDescription>
                  {selectedInternship?.company}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleApplySubmit} className="space-y-4 pt-4">
                <p className="text-muted-foreground">
                  Your application will be submitted. You can track its status in your dashboard.
                </p>
                <Button type="submit" className="w-full">
                  Submit Application
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto text-center p-8 border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">Don't see your ideal role?</CardTitle>
              <CardDescription className="text-base mt-4">
                Stay tuned — more opportunities are coming soon! Get notified when new internships are posted.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Button size="lg" variant="outline" className="gap-2" onClick={handleNotifyMe}>
                <Bell className="w-5 h-5" />
                Notify Me
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Career;
