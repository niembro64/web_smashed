# Static browser demo

The EC2 consolidation build uses `PUBLIC_URL=/smashed`,
`REACT_APP_STATIC_DEMO=true`, and `GENERATE_SOURCEMAP=false` with `npm run build`.
Serve the output at `https://games.niemo.io/smashed/`.

Static mode skips geolocation, session reads/writes, and neural-network API
reads/writes. Gameplay uses the bundled neural network and runs in the browser.
The About panel explains the paused persistence features. Seouldat's old link
is disabled because that server is deliberately stopped. Normal backend builds
retain their existing behavior when the flag is absent.

The migration checkout reconstructs the deployed 2025-06-29 application's
TypeScript and CSS from its production source maps, with its deployed public
assets. This preserves the browser version without publishing unrelated local
Steam/game-development edits. Private recovery archives and the production
source maps are recorded in the niemo_io EC2 audit directory.

Validation: `REACT_APP_STATIC_DEMO=true CI=true npm test -- --watchAll=false
--runInBand --testPathPattern=client.static` verifies sessions, history, and
neural-network operations make no network calls. Also test a full match in the
browser before stopping the original instance.
