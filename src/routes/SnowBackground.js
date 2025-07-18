import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function SnowBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const options = {
    background: {
      color: {
        value: "#000000",
      },
    },
    fpsLimit: 60,
    particles: {
      number: {
        value: 100,
        density: {
          enable: true,
          area: 800,
        },
      },
      color: {
        value: "#ffffff",
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: 0.8,
        random: false,
        anim: {
          enable: true,
          speed: 1.5,
          opacity_min: 0.3,
          sync: true,
        },
      },
      size: {
        value: 4,
        random: true,
        anim: {
          enable: true,
          speed: 2,
          size_min: 2,
          sync: false,
        },
      },
      move: {
        enable: true,
        speed: 1,
        direction: "bottom",
        outModes: {
          default: "out",
        },
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "grab",
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 150,
          links: {
            opacity: 0.5,
          },
        },
      },
    },
    detectRetina: true,
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0, // low z-index so it's behind
        pointerEvents: "none", // so clicks go through
      }}
    >
      <Particles id="tsparticles" init={particlesInit} options={options} />
    </div>
  );
}
