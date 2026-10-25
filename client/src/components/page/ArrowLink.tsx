import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

export function ArrowLink({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return <Link href={href} className={`arrow-link ${light ? "arrow-link--light" : ""}`}>{children}<ArrowUpRight size={16} strokeWidth={1.7} /></Link>;
}
