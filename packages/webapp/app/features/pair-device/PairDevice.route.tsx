import { Form } from "react-router";

export default function PairDeviceRoute() {
  return (
    <Form>
      <input type="text" placeholder="Enter device code (e.g., ABCD-1234)" maxLength={12} />
      <button type="submit">Continue</button>
    </Form>
  );
}
