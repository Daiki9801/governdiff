import { GovernDiffWorkspace } from "../components/govern-diff-workspace";
import { loadDemoScenario } from "../lib/demo/fixture-loader.server";

export const dynamic = "force-dynamic";

function verifiedScenario() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const liveModeAvailable =
      typeof apiKey === "string" && apiKey.trim().length > 0;
    return loadDemoScenario(process.cwd(), liveModeAvailable);
  } catch {
    return null;
  }
}

export default function HomePage() {
  const scenario = verifiedScenario();
  if (scenario !== null) {
    return <GovernDiffWorkspace scenario={scenario} />;
  }

  return (
    <main className="fatal-page">
      <section className="fatal-card" aria-labelledby="fixture-error-heading" role="alert">
        <p className="eyebrow">Demo unavailable</p>
        <h1 id="fixture-error-heading">GovernDiff could not load the built-in scenario</h1>
        <p>The verified synthetic fixture is unavailable. No analysis or result has been shown.</p>
      </section>
    </main>
  );
}
