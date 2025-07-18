import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Users, ChartLine, Trophy } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Crown className="text-primary text-2xl mr-3" />
              <span className="text-xl font-playfair font-bold text-gray-900">Crown</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => window.location.href = '/api/login'}>
                Sign In
              </Button>
              <Button onClick={() => window.location.href = '/api/login'}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/90"></div>
        <div className="absolute inset-0 bg-cover bg-center opacity-20" 
             style={{backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&h=1080')"}}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-playfair font-bold text-white mb-6 animate-fade-in">
              Professional Pageant<br />Management System
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto animate-slide-up">
              Streamline your beauty pageant or talent competition with our comprehensive platform featuring advanced scoring, real-time analytics, and secure authentication.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Button 
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white px-8 py-3 text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                onClick={() => window.location.href = '/api/login'}
              >
                <Users className="mr-2 h-5 w-5" />
                Register as Contestant
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20 px-8 py-3 text-lg font-semibold transition-all"
                onClick={() => window.location.href = '/api/login'}
              >
                <Trophy className="mr-2 h-5 w-5" />
                Judge Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-4">Complete Pageant Management</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Everything you need to run a professional pageant competition from registration to winner announcement.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Users className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Registration & Profiles</h3>
                <p className="text-gray-600">Secure contestant registration with profile management, photo uploads, and email verification.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full mb-4">
                  <ChartLine className="text-secondary h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                <p className="text-gray-600">Real-time scoring analytics, judge performance tracking, and comprehensive reporting tools.</p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
                  <Trophy className="text-accent h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Scoring</h3>
                <p className="text-gray-600">Customizable scoring criteria with weighted calculations, multi-phase competitions, and tie-breaking rules.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
