import { type JSX } from "react";

interface DefaultLayoutProps {
  children: JSX.Element;
}

export default function DefaultLayout(props: DefaultLayoutProps) {
  const { children } = props;

  return <section>{children}</section>;
}
