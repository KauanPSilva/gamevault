import { Gamepad2 } from 'lucide-react';

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="space-y-4 text-center">
        <Gamepad2 className="mx-auto h-16 w-16 text-cyan-400" />

        <h1 className="text-5xl font-bold tracking-tight">
          Game<span className="text-cyan-400">Vault</span>
        </h1>

        <p className="text-lg text-slate-400">
          Your next adventure starts here.
        </p>

        <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
          Frontend initialized successfully
        </span>
      </div>
    </main>
  );
}

export default App;