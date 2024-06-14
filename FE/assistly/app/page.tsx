"use client"
import React from "react";
import Header from "@/components/navbar-header";
import { BentoGrid, BentoGridItem } from "../components/ui/bento-grid";
import {
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";



// Home component
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-20">
      <Header />
      <h1 className="text-3xl font-bold pb-10">Purchases history</h1>
      <BentoGrid className="max-w-4xl mx-auto">
        {items.map((item, i) => (
          <Link
            href={{
              pathname: `/chat/${item.itemId}`,
              query: { title: item.title, description: item.description },
            }}
            key={i}
            className="text-black hover:text-blue-500"
          >
            <BentoGridItem
              title={item.title}
              description={item.description}
              icon={item.icon}
              className={i === 3 ? "md:col-span-2" : ""}
              itemId={item.itemId}
            />
          </Link>
        ))}
      </BentoGrid>
    </main>
  );
}

const items = [
  {
    title: "Hot Side Story, Spicy Fried Chicken",
    description: "GoFood, -Rp 62.000",
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
    itemId: "1234567890"
  },
  {
    title: "Gopay top up",
    description: "GoPay Saldo, +Rp 100.000",
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
    itemId: "0987654321"
  },
  {
    title: "Stasiun MRT Lebak Bulus Grab",
    description: "GoRide, -Rp 15.000",
    icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
    itemId: "1357924680"
  },
];
