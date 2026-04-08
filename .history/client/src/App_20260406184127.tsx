import { Suspense, lazy } from "react";
import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ProjectPage = lazy(() => import("@/pages/Project"));
const NotFound = lazy(() => import("@/pages/not-found"));

const isExtension =
  import.meta.env.VITE_IS_EXTENSION === "true" ||
  window.location.protocol === "chrome-extension:";

// Protected Route Wrapper
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, loading } = useAuth();

  if (loading) return null; // Or a loading spinner
  
  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component {...rest} />;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected Routes */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/project/:id">
        {() => <ProtectedRoute component={ProjectPage} />}
      </Route>

      {/* Default Redirect */}
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Use hash-based routing in extension mode (no URL bar in popup/side panel)
  const routerProps = isExtension ? { hook: useHashLocation } : {};

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter {...routerProps}>
            <Suspense fallback={null}>
              <AppRoutes />
            </Suspense>
            <Toaster />
          </WouterRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
