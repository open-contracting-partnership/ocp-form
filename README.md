# Open Contracting forms
This application allows people to edit data stored in the [OCP data repository](https://github.com/open-contracting-partnership/ocp-data) through a form. Authentication is handled by the [OCP form server](https://github.com/open-contracting-partnership/ocp-form-server).

This project is a fork of a [Blue Pencil](https://github.com/developmentseed/blue-pencil).

## Development environment
To set up the development environment for this website, you'll need to install the following on your system:

- Node (see the `engines` field in `package.json`; [nvm](https://github.com/creationix/nvm) usage is advised)
- [pnpm](https://pnpm.io) (Corepack, bundled with Node, can install the pinned version: `corepack enable`)

After these basic requirements are met, run the following commands in the website's folder:
```
$ pnpm install
```

### Server
This app requires communication with a server which can be found in the [blue-pencil-server](https://github.com/developmentseed/blue-pencil-server) repo.
After running a local copy add the address to `config/production.js`:
```
  api: 'http://localhost:[port]'
```

### Getting started

```
$ pnpm run serve
```
or
```
$ gulp serve
```
Compiles the sass files, javascript, and launches the server making the site available at `http://localhost:3000/`
The system will watch files and execute tasks whenever one of them changes.
The site will automatically refresh since it is bundled with livereload.

### Other commands
Compile the sass files, javascript... Use this instead of ```gulp serve``` if you don't want to watch.
```
$ pnpm run build
```
or
```
$ gulp
```