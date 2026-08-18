# GalaxyV7

> Browse the internet with no restrictions.

**Demo:** https://galxy.it.com/

## Run Galaxy Locally

### Prerequisites

- [Bun](https://bun.com/docs/installation)
- [Node.js](https://nodejs.org/en/download)

### Install Galaxy

```bash
git clone https://github.com/r480github/GalaxyV7
cd GalaxyV7
bun i
```

### Install Games (Optional)

```bash
cd static
git clone https://gitlab.com/Hydra.Network/game-assets/endis-assets books
cd ..
```

### Dev

```bash
bun run dev
```

Default port: `5173`

### Prod

```bash
bun run build
bun index.js
```

Default port: `5417`

## Don't have a server?

Galaxy can also be deployed statically with Netlify or other static deployers.
[GalaxyV7-Static](https://github.com/r480github/GalaxyV7-Static)


## A Look Inside

### OS

<img src="readme/os.png" width="800">

### Browser

<img src="readme/browser.png" width="800">

### Settings

<img src="readme/settings.png" width="800">

