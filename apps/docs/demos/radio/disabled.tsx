"use client";

import { Field, Radio, RadioGroup } from "@dofortech/pretty-ui";

export default function RadioDisabled() {
  return (
    <div className="flex flex-col gap-6">
      <Field.Root name="plan">
        <Field.Label nativeLabel={false}>Plan</Field.Label>
        <RadioGroup defaultValue="team">
          <Field.Item>
            <Field.Label>
              <Radio value="hobby" />
              Hobby
            </Field.Label>
          </Field.Item>
          <Field.Item>
            <Field.Label>
              <Radio value="team" />
              Team
            </Field.Label>
          </Field.Item>
          {/* `disabled` on the Field.Item rather than on the Radio: it puts
            * data-disabled on the label too, so the words dim with the circle
            * instead of staying at full contrast beside a greyed-out control. */}
          <Field.Item disabled>
            <Field.Label>
              <Radio value="enterprise" />
              Enterprise (contact sales)
            </Field.Label>
          </Field.Item>
        </RadioGroup>
      </Field.Root>

      {/* readOnly, not disabled: the options stay focusable and arrowable, so
        * someone tabbing through the form still discovers what the setting is
        * and what the alternatives were. */}
      <Field.Root name="billing-currency">
        <Field.Label nativeLabel={false}>Billing currency</Field.Label>
        <RadioGroup readOnly defaultValue="eur" orientation="horizontal">
          <Field.Item>
            <Field.Label>
              <Radio value="eur" />
              EUR
            </Field.Label>
          </Field.Item>
          <Field.Item>
            <Field.Label>
              <Radio value="usd" />
              USD
            </Field.Label>
          </Field.Item>
        </RadioGroup>
        <Field.Description>
          Set when the workspace was created. Contact support to change it.
        </Field.Description>
      </Field.Root>

      {/* `disabled` on the group reaches every radio inside it. */}
      <Field.Root name="retention" disabled>
        <Field.Label nativeLabel={false}>Log retention</Field.Label>
        <RadioGroup disabled defaultValue="7" orientation="horizontal">
          <Field.Item>
            <Field.Label>
              <Radio value="7" />7 days
            </Field.Label>
          </Field.Item>
          <Field.Item>
            <Field.Label>
              <Radio value="30" />
              30 days
            </Field.Label>
          </Field.Item>
        </RadioGroup>
      </Field.Root>
    </div>
  );
}
