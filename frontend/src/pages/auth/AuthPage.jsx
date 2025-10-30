import React, { useState } from "react";
import { Stethoscope, Shield, HeartPulse, Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

const HospitalLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    const response = await axios.post("http://localhost:8081/api/auth/login", {
      username: form.username,
      password: form.password,
    });
    
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data));
    setIsAuthenticating(false);
    window.location.href = "/doctordashboard"; // Redirect to dashboard after login
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-foreground bg-gradient-to-br from-primary/10 to-accent/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/30 opacity-40"></div>

        <div className="relative z-10 text-center max-w-md">
          <div className="mb-10">
            <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Stethoscope className="w-12 h-12 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              MediConnect
            </h1>
            <p className="text-lg text-muted-foreground">
              Your trusted digital hospital system.
            </p>
          </div>

          {/* Hospital features */}
          <div className="space-y-6 text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-border">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Secure Patient Data
                </h3>
                <p className="text-muted-foreground text-sm">
                  Advanced encryption for every record
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center backdrop-blur-sm border border-border">
                <HeartPulse className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Real-Time Monitoring
                </h3>
                <p className="text-muted-foreground text-sm">
                  Stay updated with patient vitals anytime
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">500+</div>
              <div className="text-sm text-muted-foreground">Hospitals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">10K+</div>
              <div className="text-sm text-muted-foreground">Doctors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">1M+</div>
              <div className="text-sm text-muted-foreground">Patients</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-muted/30">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-3">
              <Stethoscope className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">MediConnect</h1>
            <p className="text-muted-foreground">
              Hospital Management System
            </p>
          </div>

          <Card className="border border-border bg-card shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-foreground">
                Staff Login
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to access your hospital dashboard
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    name="username"
                    type="username"
                    placeholder="doctor@mediconnect.com"
                    className="h-11"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="h-11 pr-10"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-11 w-11"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={form.rememberMe}
                      onChange={handleChange}
                    />
                    <span>Remember me</span>
                  </label>
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm p-0 h-auto"
                    onClick={() => alert("Password reset link sent!")}
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button type="submit" className="w-full h-11">
                  {isAuthenticating ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            © 2025 MediConnect. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HospitalLoginPage;
