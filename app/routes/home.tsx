import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "App Recorder" },
    { name: "description", content: "app router" },
  ];
}

export default function Home() {
  return <Welcome />;
}
