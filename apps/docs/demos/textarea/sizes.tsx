"use client";

import { Field, Textarea } from "@dofortech/pretty-ui";

const SIZES = ["sm", "md", "lg"] as const;

export default function TextareaSizes() {
  return (
    <div className="flex w-full max-w-[28rem] flex-col gap-4">
      {SIZES.map((size) => (
        <Field.Root key={size}>
          <Field.Label>size=&quot;{size}&quot;</Field.Label>
          {/* Every box is `rows={2}`, and every box is a different height:
            * a row is one line of THIS control's text, so the same row count
            * measures out differently at each font size. */}
          <Textarea size={size} rows={2} defaultValue={`size="${size}"`} />
        </Field.Root>
      ))}
    </div>
  );
}
