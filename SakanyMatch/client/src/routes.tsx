
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

import Home from "./pages/home";
import NotFound from "./pages/not-found";
import { AuthLayout } from "./pages/auth";
import { ProtectedRoute } from "./lib/protected-route";
import { ProtectedAdminRoute } from "./lib/protected-admin-route";
import { ProtectedLandlordRoute } from "./lib/protected-landlord-route";

// Lazy load pages to improve initial load time
const Properties = lazy(() => import("./pages/properties"));
const Property = lazy(() => import("./pages/property"));
const AddProperty = lazy(() => import("./pages/properties/add"));
const Profile = lazy(() => import("./pages/profile"));
const AdminDashboard = lazy(() => import("./pages/admin/dashboard"));
const AdminProperties = lazy(() => import("./pages/admin/properties"));
const AdminUsers = lazy(() => import("./pages/admin/users"));

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-border" />
  </div>
);

export default function Routes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={AuthLayout} />
        
        <Route path="/properties">
          <Properties />
        </Route>
        
        <Route path="/property/:id">
          {(params) => <Property id={params.id} />}
        </Route>
        
        <ProtectedLandlordRoute path="/properties/add" component={AddProperty} />
        
        <ProtectedRoute path="/profile" component={Profile} />
        
        <ProtectedAdminRoute path="/admin" component={AdminDashboard} />
        <ProtectedAdminRoute path="/admin/properties" component={AdminProperties} />
        <ProtectedAdminRoute path="/admin/users" component={AdminUsers} />
        
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}
