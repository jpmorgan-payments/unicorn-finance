import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="p-2">
      <h3>Unicorns are busy financing!</h3>
      <h4>COMING SOON!</h4>
    </div>
  );
}
