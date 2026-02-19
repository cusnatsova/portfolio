'use client';

export default function LiveBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-[1]" aria-hidden>
      {/* Animated gradient orbs - visible, professional drift */}
      <div className="absolute w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.45)_0%,rgba(139,92,246,0.18)_35%,transparent_65%)] blur-[100px] animate-orb-1 -top-[250px] -left-[200px]" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.4)_0%,rgba(124,58,237,0.12)_35%,transparent_65%)] blur-[100px] animate-orb-2 top-[25%] -right-[150px]" />
      <div className="absolute w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(217,70,239,0.35)_0%,rgba(217,70,239,0.1)_35%,transparent_65%)] blur-[100px] animate-orb-3 bottom-[5%] left-[10%]" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(129,140,248,0.3)_0%,rgba(129,140,248,0.08)_35%,transparent_65%)] blur-[80px] animate-orb-4 top-[55%] right-[25%]" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.28)_0%,rgba(167,139,250,0.06)_35%,transparent_65%)] blur-[80px] animate-orb-5 top-[10%] left-[35%]" />
    </div>
  );
}
