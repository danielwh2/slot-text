import React from "react";
import { Composition } from "remotion";
import { SlotTextPromo } from "./SlotTextPromo";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="SlotTextPromo"
        component={SlotTextPromo}
        durationInFrames={1200}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
