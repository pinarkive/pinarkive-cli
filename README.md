# @pinarkive/pinarkive-cli

Command-line interface for the **Pinarkive API v3**. Upload files, pin CIDs, list files, delete files, inspect clusters, scaffold from templates, share encrypted files, run diagnostics, and watch folders—similar to the Vercel or Docker CLIs.

## Installation

### Global install (recommended)

```bash
npm install -g @pinarkive/pinarkive-cli
```

Then run:

```bash
pinarkive --help
```

### From source

```bash
git clone <repo>
cd pinarkive-cli
npm install
npm run build
node dist/cli.js --help
```

Or link for local development:

```bash
npm link
pinarkive --help
```

## Setup

Store your API key locally (required for all API commands except `gateway` and `open`):

```bash
pinarkive login
```

You'll be prompted for your API key. It is saved to `~/.pinarkive/config.json`.

Get your API key from [Pinarkive](https://pinarkive.com) or your dashboard.

## Commands

| Command | Description |
|--------|-------------|
| `login` | Save your API key to `~/.pinarkive/config.json` |
| `upload <file>` | Upload a file; shows CID, size, and gateway URL |
| `pin <cid>` | Pin an existing CID |
| `files` | List your uploaded files (CID, size, cluster, created_at) |
| `delete <cid>` | Delete a file by CID |
| `clusters` | List your clusters |
| `gateway <cid>` | Print the gateway URL for a CID |
| `open <cid>` | Open the gateway URL in your browser |
| `init` | Create a new project from a template (from [pinarkive-templates](https://github.com/pinarkive/pinarkive-templates)) |
| `share <file>` | Encrypt file (AES), upload, and get a share link. Options: `-p` password, `-e` expires, `-c` cluster |
| `whoami` | Show current user (email, plan, cluster count) |
| `doctor` | Run diagnostics: API, API key, gateway, cluster access |
| `watch <folder>` | Watch folder; upload and pin new files as they appear |

## Usage examples

```bash
# Authenticate
pinarkive login

# Upload a file
pinarkive upload image.png

# Pin an existing CID
pinarkive pin bafybeigd...

# List your files
pinarkive files

# Delete a file
pinarkive delete bafybeigd...

# List clusters
pinarkive clusters

# Get gateway URL (no auth required)
pinarkive gateway bafybeigd...

# Open content in browser
pinarkive open bafybeigd...

# Create project from template (express-api, next-upload, node-script, python-upload, secure-share)
pinarkive init

# Share a file with password (encrypted upload + share link)
pinarkive share document.pdf -p mypassword
pinarkive share document.pdf -p secret -c mycluster

# Show current user
pinarkive whoami

# Run diagnostics
pinarkive doctor

# Watch folder and auto-upload new files
pinarkive watch ./uploads
```

## Example output

**Upload:**

```
Uploading file...
✔ Upload successful

CID:
bafybeigd...

Size:
1.23 MB

Gateway:
https://gateway.pinarkive.com/ipfs/bafybeigd...
```

**Gateway:**

```bash
$ pinarkive gateway bafybeigd...
https://gateway.pinarkive.com/ipfs/bafybeigd...
```

**Share:**

```bash
$ pinarkive share image.png -p mypass
✔ File encrypted
✔ Uploaded

CID:
bafy...

Share link:
https://pinarkive.com/#/bafy...:mypass
```

**Doctor:**

```
✔ API reachable
✔ API key valid
✔ Gateway reachable
✔ Cluster access
```

## API base URL

All requests use: `https://api.pinarkive.com/api/v3`

Authentication: Bearer token (API key) in the `Authorization` header. The CLI uses the official [@pinarkive/pinarkive-sdk-ts](https://www.npmjs.com/package/@pinarkive/pinarkive-sdk-ts) for all API calls.

## Scripts

- `npm run build` — Compile TypeScript to `dist/`
- `npm run dev` — Run CLI with ts-node: `npm run dev -- upload image.png`
- `npm run lint` — Run ESLint on `src/`

## Project structure

```
src/
  cli.ts          # Commander entry, command registration
  api.ts          # Pinarkive SDK client, base URL, auth
  config.ts       # Read/write ~/.pinarkive/config.json
  crypto-share.ts # AES encryption for share command
  types/
    degit.d.ts    # Type declaration for degit
  commands/
    login.ts
    upload.ts
    pin.ts
    files.ts
    delete.ts
    clusters.ts
    gateway.ts
    open.ts
    init.ts       # Template scaffolding
    share.ts      # Encrypt + upload + share link
    whoami.ts     # Current user info
    doctor.ts     # Diagnostics
    watch.ts      # Folder watch + upload/pin
```

## License

MIT
