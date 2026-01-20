import { href, Link } from "react-router";

export default function OnboardingJoin() {
  return (
    <div>
      <h2>Get Started</h2>
      <p>To begin sharing memories with your family, you'll need to connect to a household.</p>
      <ul>
        <li>
          <Link to={href("/onboarding/household/create")}>
            <div
              style={{
                height: 200,
                aspectRatio: 1,
                display: "grid",
                alignContent: "center",
                border: "1px solid rebeccapurple"
              }}
            >
              Create a new household
            </div>
          </Link>
        </li>
        <li>
          <Link to={href("/onboarding/household/join")}>
            <div
              style={{
                height: 200,
                aspectRatio: 1,
                display: "grid",
                alignContent: "center",
                border: "1px solid rebeccapurple"
              }}
            >
              Join an existing household
            </div>
          </Link>
        </li>
      </ul>
    </div>
  );
}
