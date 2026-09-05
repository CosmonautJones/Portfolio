"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import { CustomWiggle } from "gsap/CustomWiggle";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";

let registered = false;

export function registerMixerGsap(): void {
  if (registered) return;
  gsap.registerPlugin(
    useGSAP,
    Flip,
    DrawSVGPlugin,
    MorphSVGPlugin,
    Physics2DPlugin,
    CustomEase,
    CustomWiggle
  );
  CustomWiggle.create("barShake", { wiggles: 12, type: "easeOut" });
  registered = true;
}

registerMixerGsap();

export { gsap, useGSAP };
