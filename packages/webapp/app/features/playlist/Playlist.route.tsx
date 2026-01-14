import type { Route } from "./+types/Playlist.route";

export default function (args: Route.ComponentProps) {
  return (
    <div>
      <h1>Playlist: {args.params.playlist_id}</h1>
    </div>
  );
}
