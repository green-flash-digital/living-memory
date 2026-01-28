import { Form, useLoaderData } from "react-router";

export async function loader() {}

export async function action() {}

export default function PairDeviceRoute() {
  const {} = useLoaderData();

  return (
    <Form>
      <input type="text" placeholder="Enter device code (e.g., ABCD-1234)" maxLength={12} />
      <button type="submit">Continue</button>
    </Form>
  );
}
