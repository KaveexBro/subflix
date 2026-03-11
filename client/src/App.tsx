import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Upload from "@/pages/Upload";
import ApplyToUpload from "@/pages/ApplyToUpload";
import SubtitleDetail from "@/pages/SubtitleDetail";
import Profile from "@/pages/Profile";
import CreatorProfile from "@/pages/CreatorProfile";
import SeriesDetail from "@/pages/SeriesDetail";
import Admin from "@/pages/Admin";

function Router() {
  return (
    <Switch>
      <Route path={"/login"} component={Login} />
      <Route path={"/"}>
        {() => (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/creator/:uid"} component={CreatorProfile} />
      <Route path={"/series/:title"} component={SeriesDetail} />
      <Route path={"/apply-to-upload"}>
        {() => (
          <ProtectedRoute>
            <ApplyToUpload />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/upload"}>
        {() => (
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/subtitle/:id"}>
        {() => (
          <ProtectedRoute>
            <SubtitleDetail />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/profile"}>
        {() => (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/admin"}>
        {() => (
          <ProtectedRoute requireAdmin>
            <Admin />
          </ProtectedRoute>
        )}
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <div className="min-h-screen bg-background">
              <Header />
              <main className="flex-1">
                <Router />
              </main>
            </div>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
