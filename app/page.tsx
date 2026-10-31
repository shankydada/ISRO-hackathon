import { LandingShell } from "@/components/landing/landing";
import { Hero } from "@/components/landing/hero";
import { Problem, HowItWorks, Proof, Crops, Market, IfSelected, Footer } from "@/components/landing/sections";
export default function Home() {
 return <><LandingShell><Hero /><Problem /><HowItWorks /><Proof /><Crops /><Market /><IfSelected /></LandingShell><Footer /></>;
}
