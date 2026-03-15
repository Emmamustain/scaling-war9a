import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Smartphone, QrCode, BarChart3, Shield } from "lucide-react";
import { getTranslations } from "next-intl/server";

const features = [
  {
    icon: QrCode,
    titleKey: "qrJoin",
    descKey: "qrJoinDesc",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Clock,
    titleKey: "realTime",
    descKey: "realTimeDesc",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: MapPin,
    titleKey: "discover",
    descKey: "discoverDesc",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Smartphone,
    titleKey: "mobile",
    descKey: "mobileDesc",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: BarChart3,
    titleKey: "analytics",
    descKey: "analyticsDesc",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: Shield,
    titleKey: "secure",
    descKey: "secureDesc",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
];

export default async function HomePage() {
  const t = await getTranslations("landing");

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Clock className="size-4" />
            </div>
            <span className="text-lg font-bold">War9a</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden px-4 py-24 text-center">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 size-[600px] rounded-full bg-primary/5 blur-3xl" />
          </div>
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Clock className="size-4" />
              <span>No more waiting in physical lines</span>
            </div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground lg:text-6xl">
              Virtual Queue Management
              <span className="block text-primary"> Made Simple</span>
            </h1>
            <p className="mb-10 text-xl text-muted-foreground">
              Join queues virtually, get notified when it&apos;s your turn,
              and track your position in real-time. Built for Algeria&apos;s modern businesses.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="xl" asChild>
                <Link href="/discover">Discover Businesses</Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link href="/sign-up?type=business">Register Your Business</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold">Everything you need</h2>
              <p className="text-lg text-muted-foreground">
                A complete virtual queue solution for businesses and customers
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.titleKey}
                  className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
                >
                  <div className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl ${f.bg}`}>
                    <f.icon className={`size-6 ${f.color}`} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{f.titleKey}</h3>
                  <p className="text-sm text-muted-foreground">{f.descKey}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary px-4 py-20 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
              Ready to skip the line?
            </h2>
            <p className="mb-8 text-xl text-primary-foreground/80">
              Join thousands of Algerians already using War9a
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="xl" variant="secondary" asChild>
                <Link href="/discover">Start Now — It&apos;s Free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} War9a. Built for Algeria.</p>
      </footer>
    </div>
  );
}
