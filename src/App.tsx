import React, { useState, useEffect } from "react";
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { HospitalDashboard } from "./components/HospitalDashboard";
import { DonorDashboard } from "./components/DonorDashboard";
import { AuthModal } from "./components/AuthModal";
import { LandingPage } from "./components/LandingPage";
import { ReviewManager } from "./components/ReviewManager";
import { SampleDataInitializer } from "./components/SampleDataInitializer";
import {
  Heart,
  Users,
  MapPin,
  Clock,
  Shield,
  Bell,
  MessageSquare,
} from "lucide-react";
import { supabase } from "./utils/supabase/client";
import {
  projectId,
  publicAnonKey,
} from "./utils/supabase/info";

export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'signup'
  const [loading, setLoading] = useState(true);
  const [showReviewManager, setShowReviewManager] =
    useState(false);
  const [reviewCount, setReviewCount] = useState(0);

  // Load review count
  useEffect(() => {
    const loadReviewCount = () => {
      const reviews = JSON.parse(
        localStorage.getItem("hospitalReviews") || "[]",
      );
      const activeReviews = reviews.filter(
        (review) => review.status === "active",
      );
      setReviewCount(activeReviews.length);
    };

    loadReviewCount();

    // Listen for localStorage changes
    const handleStorageChange = () => {
      loadReviewCount();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events
    window.addEventListener(
      "reviewsUpdated",
      handleStorageChange,
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange,
      );
      window.removeEventListener(
        "reviewsUpdated",
        handleStorageChange,
      );
    };
  }, []);

  // Check for existing session on app load
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.access_token);
      }
    } catch (error) {
      console.error("Session check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (accessToken) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-90bcf304/profile`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  const handleAuth = async (
    email,
    password,
    type,
    isSignup = false,
    userData = {},
  ) => {
    try {
      if (isSignup) {
        // Register new user via our server endpoint
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-90bcf304/signup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              email,
              password,
              userType: type,
              ...userData,
            }),
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Signup failed");
        }

        // After successful signup, sign in
        const {
          data: { session },
          error: signInError,
        } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        setUser(session.user);
        await fetchUserProfile(session.access_token);
      } else {
        // Sign in existing user
        const {
          data: { session },
          error,
        } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setUser(session.user);
        await fetchUserProfile(session.access_token);
      }

      setShowAuth(false);
    } catch (error) {
      console.error("Auth error:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mx-auto mb-4">
            <Heart className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            BloodConnect
          </h2>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <>
        <LandingPage
          onLogin={(type) => {
            setAuthMode("login");
            setShowAuth(true);
          }}
          onSignup={(type) => {
            setAuthMode("signup");
            setShowAuth(true);
          }}
        />
        {showAuth && (
          <AuthModal
            mode={authMode}
            onClose={() => setShowAuth(false)}
            onAuth={handleAuth}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SampleDataInitializer />
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-full">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  BloodConnect
                </h1>
                <p className="text-sm text-gray-500">
                  Saving Lives Together
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReviewManager(true)}
                className="border-blue-600 text-blue-600 hover:bg-blue-50 relative"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Reviews
                {reviewCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {reviewCount}
                  </Badge>
                )}
              </Button>
              <Badge variant="outline" className="capitalize">
                {userProfile.userType}
              </Badge>
              {userProfile.bloodType && (
                <Badge
                  variant="destructive"
                  className="font-bold"
                >
                  {userProfile.bloodType}
                </Badge>
              )}
              <span className="text-sm text-gray-700">
                {userProfile.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userProfile.userType === "hospital" ? (
          <HospitalDashboard
            user={user}
            userProfile={userProfile}
          />
        ) : (
          <DonorDashboard
            user={user}
            userProfile={userProfile}
          />
        )}
      </main>

      {/* Review Manager Modal */}
      {showReviewManager && (
        <ReviewManager
          userProfile={userProfile}
          onClose={() => setShowReviewManager(false)}
        />
      )}
    </div>
  );
}