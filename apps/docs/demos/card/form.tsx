"use client";

import { Button, Card, Field, Form, Input } from "@forte-ui/react";

export default function CardForm() {
  return (
    <Card.Root className="w-full max-w-[22rem]">
      <Card.Header>
        <Card.Title>Sign in</Card.Title>
        <Card.Description>Use your work email to continue.</Card.Description>
      </Card.Header>
      <Card.Content>
        {/* The whole form, submit button included, lives in one section: the
          * button belongs to the <form>, and splitting it into the footer
          * would orphan it. The footer is for what is NOT part of the form —
          * here, the way out for people without an account. */}
        <Form onFormSubmit={() => {}}>
          <Field.Root name="email">
            <Field.Label>Email</Field.Label>
            <Input type="email" required placeholder="you@company.com" />
            <Field.Error match="valueMissing">Enter your email.</Field.Error>
          </Field.Root>
          <Field.Root name="password">
            <Field.Label>Password</Field.Label>
            <Input type="password" required />
            <Field.Error match="valueMissing">Enter your password.</Field.Error>
          </Field.Root>
          <Button type="submit" fullWidth>
            Sign in
          </Button>
        </Form>
      </Card.Content>
      <Card.Footer align="center">
        <span className="text-2 text-foreground-muted">
          No account? <a href="#create">Create one</a>
        </span>
      </Card.Footer>
    </Card.Root>
  );
}
