"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";

export function GreetingUI() {
  const { address } = useAccount();
  const [newGreeting, setNewGreeting] = useState("");
  const [sendValue, setSendValue] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: greeting } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
  });

  const { data: totalCounter } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "totalCounter",
  });

  const { data: myCount } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "userGreetingCounter",
    args: [address],
  });

  const { writeContractAsync, isMining } = useScaffoldWriteContract("YourContract");

  const handleSetGreeting = async () => {
    setError(null);
    try {
      await writeContractAsync({
        functionName: "setGreeting",
        args: [newGreeting],
        value: sendValue ? parseEther("0.001") : undefined,
      });
      // Only clear the input once the write actually went through.
      setNewGreeting("");
    } catch (e) {
      // A rejected signature or a failed transaction lands here. Show it to the
      // user instead of letting the promise reject unhandled, and keep the typed
      // greeting so it does not have to be retyped.
      console.error("Failed to set greeting:", e);
      setError(e instanceof Error ? e.message : "Failed to set greeting. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <h1 className="text-3xl font-bold">Greeting dApp</h1>
      <p className="text-xl">Current greeting: <strong>{greeting}</strong></p>
      <p>Total greetings: {totalCounter?.toString()}</p>
      {address && <p>Your greetings: {myCount?.toString()} from <Address address={address} /></p>}

      <div className="flex gap-2">
        <input
          className="input input-bordered"
          placeholder="New greeting..."
          value={newGreeting}
          onChange={(e) => setNewGreeting(e.target.value)}
        />
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={sendValue} onChange={(e) => setSendValue(e.target.checked)} />
          Send 0.001 ETH (premium)
        </label>
        <button
          className="btn btn-primary"
          onClick={handleSetGreeting}
          disabled={isMining || !newGreeting}
        >
          {isMining ? "Mining…" : "Set Greeting"}
        </button>
      </div>

      {error && <p className="text-error text-sm max-w-md text-center break-words">{error}</p>}
    </div>
  );
}
