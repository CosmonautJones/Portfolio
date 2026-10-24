"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";

let registered = false;

export function registerMixerGsap(): void {
  if (registered) return;
  gsap.registerPlugin(useGSAP);
  registered = true;
}

registerMixerGsap();

export { gsap, useGSAP };
