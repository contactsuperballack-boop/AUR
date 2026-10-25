// Concrete & Canopy style reminder: route pages through one consistent shell so navigation, context, and conversion remain calm and legible.
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Route, Switch, useRoute } from "wouter";
import NotFound from "./pages/NotFound";

/**
 * Route-level code splitting: each page lives in its own module under ./pages and is
 * loaded on demand, so visiting "/" no longer pulls in Contact/Insights/etc.
 */
const Home = lazy(() => import("./pages/Home"));
const AboutPage = lazy(() => import("./pages/About"));
const ServicesPage = lazy(() => import("./pages/Services"));
const ServiceDetailPage = lazy(() => import("./pages/ServiceDetail"));
const ProjectsPage = lazy(() => import("./pages/Projects"));
const ProjectPage = lazy(() => import("./pages/Project"));
const PropertiesPage = lazy(() => import("./pages/Properties"));
const PropertyPage = lazy(() => import("./pages/Property"));
const FaqPage = lazy(() => import("./pages/Faq"));
const InvestPage = lazy(() => import("./pages/Invest"));
const InsightsPage = lazy(() => import("./pages/Insights"));
const ArticlePage = lazy(() => import("./pages/Article"));
const ContactPage = lazy(() => import("./pages/Contact"));
const LegalPage = lazy(() => import("./pages/Legal"));

function RouteFallback() {
  return (
    <div className="cms-state" role="status" aria-live="polite" style={{ minHeight: "60vh" }}>
      <span className="cms-state-spinner" aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

function ServiceRoute() {
  const [, params] = useRoute("/services/:slug");
  return <ServiceDetailPage slug={params?.slug ?? "development"} />;
}

function ProjectRoute() {
  const [, params] = useRoute("/projects/:id");
  return <ProjectPage id={params?.id ?? "signature-estate"} />;
}

function PropertyRoute() {
  const [, params] = useRoute("/properties/:slug");
  return <PropertyPage slug={params?.slug ?? ""} />;
}

function ArticleRoute() {
  const [, params] = useRoute("/insights/:id");
  return <ArticlePage id={params?.id ?? "why-context-matters"} />;
}

function Router() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={AboutPage} />
        <Route path="/services" component={ServicesPage} />
        <Route path="/services/:slug" component={ServiceRoute} />
        <Route path="/projects" component={ProjectsPage} />
        <Route path="/projects/:id" component={ProjectRoute} />
        <Route path="/properties" component={PropertiesPage} />
        <Route path="/properties/:slug" component={PropertyRoute} />
        <Route path="/invest" component={InvestPage} />
        <Route path="/insights" component={InsightsPage} />
        <Route path="/insights/:id" component={ArticleRoute} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/faq" component={FaqPage} />
        <Route path="/privacy" component={() => <LegalPage kind="privacy" />} />
        <Route path="/terms" component={() => <LegalPage kind="terms" />} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
