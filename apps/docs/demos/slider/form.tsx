"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { Button, Field, Fieldset, Form, Slider } from "@dofortech/pretty-ui";

// The sliders fill the form column rather than sitting at their natural 16rem.
// The cast is only because React's CSSProperties has no index signature for
// custom properties.
const fullWidth = { "--pui-slider-length": "100%" } as CSSProperties;

export default function SliderForm() {
  const [submitted, setSubmitted] = React.useState<Record<
    string,
    unknown
  > | null>(null);

  return (
    <div style={{ inlineSize: "min(26rem, 100%)" }}>
      <Form onFormSubmit={(values) => setSubmitted(values)}>
        {/* A single-thumb slider submits like any other control: give the name
          * to the Field and the hidden <input type="range"> carries it. */}
        <Field.Root name="quality">
          <Slider.Root defaultValue={80} style={fullWidth}>
            <Slider.Label>Export quality</Slider.Label>
            <Slider.Value />
            <Slider.Control>
              <Slider.Track>
                <Slider.Indicator />
                <Slider.Thumb />
              </Slider.Track>
            </Slider.Control>
          </Slider.Root>
        </Field.Root>

        {/* A range slider has two inputs sharing one name, so it needs a group
          * label rather than a single one. Rendering Fieldset.Root *as* the
          * slider root puts the legend on the group and leaves each thumb its
          * own aria-label — the submitted value is then an array. */}
        <Field.Root name="budget">
          <Fieldset.Root
            render={
              <Slider.Root
                defaultValue={[200, 800]}
                min={0}
                max={1000}
                step={50}
                format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
                style={fullWidth}
              />
            }
          >
            <Fieldset.Legend>Monthly budget</Fieldset.Legend>
            <Slider.Value />
            <Slider.Control>
              <Slider.Track>
                <Slider.Indicator />
                <Slider.Thumb index={0} aria-label="Minimum budget" />
                <Slider.Thumb index={1} aria-label="Maximum budget" />
              </Slider.Track>
            </Slider.Control>
          </Fieldset.Root>
        </Field.Root>

        <Button type="submit" style={{ alignSelf: "flex-start" }}>
          Save settings
        </Button>
      </Form>

      {submitted ? (
        <pre
          style={{
            marginBlockStart: "var(--pui-space-5)",
            padding: "var(--pui-space-4)",
            borderRadius: "var(--pui-radius-surface)",
            backgroundColor: "var(--pui-color-panel)",
            fontFamily: "var(--pui-font-mono)",
            fontSize: "var(--pui-font-size-1)",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(submitted, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
