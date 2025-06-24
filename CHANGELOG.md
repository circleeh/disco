## [1.4.0](https://github.com/circleeh/disco/compare/v1.3.0...v1.4.0) (2025-06-24)

### Features

* **frontend:** 🔒️ switch nginx to non-root user ([62a61cf](https://github.com/circleeh/disco/commit/62a61cf8ad43c88d0be73450a201cfb2ae96e51f))

## [1.3.0](https://github.com/circleeh/disco/compare/v1.2.1...v1.3.0) (2025-06-24)

### Features

* **frontend:** 🔒️ change server port to 8080 for security ([35ed028](https://github.com/circleeh/disco/commit/35ed0282d467caff874fb30d864c0529b315bd14))

## [1.2.1](https://github.com/circleeh/disco/compare/v1.2.0...v1.2.1) (2025-06-24)

### Bug Fixes

* **nginx:** 🔥 remove optional API proxy configuration ([835d788](https://github.com/circleeh/disco/commit/835d788bcefaa9c92c282d764f69d6539b6b15e4))

## [1.2.0](https://github.com/circleeh/disco/compare/v1.1.0...v1.2.0) (2025-06-24)

### Features

* 🔥 remove compiled backend files ([439d5ca](https://github.com/circleeh/disco/commit/439d5ca007a1ee8c7ae61e228e81932f7bf888a3))
* **auth:** 🏷️  update types for authenticated requests ([a6c66fa](https://github.com/circleeh/disco/commit/a6c66faa488123df764046782a1a5b882bdc0b90))

### Bug Fixes

* **containers:** 💥 Update builds ([35d936e](https://github.com/circleeh/disco/commit/35d936e7567ae59ddd97e143e46fe762d5eeae94))

## [1.2.0](https://github.com/circleeh/disco/compare/v1.1.0...v1.2.0) (2025-06-24)

### Features

* 🔥 remove compiled backend files ([439d5ca](https://github.com/circleeh/disco/commit/439d5ca007a1ee8c7ae61e228e81932f7bf888a3))
* **auth:** 🏷️  update types for authenticated requests ([a6c66fa](https://github.com/circleeh/disco/commit/a6c66faa488123df764046782a1a5b882bdc0b90))

### Bug Fixes

* **containers:** 💥 Update builds ([35d936e](https://github.com/circleeh/disco/commit/35d936e7567ae59ddd97e143e46fe762d5eeae94))

## [1.1.0](https://github.com/circleeh/disco/compare/v1.0.0...v1.1.0) (2025-06-24)

### Features

* **ci:** 👷 add separate build jobs for backend and frontend ([f85d64f](https://github.com/circleeh/disco/commit/f85d64f9ca7dd973c762fe570d6e7c78ded1bdfc))

## 1.0.0 (2025-06-24)

### Features

* 🎉 add initial project documentation and setup files ([cc1ab9f](https://github.com/circleeh/disco/commit/cc1ab9ff3519b89e40c25eca69a47ccd05600647))
* **auth:** 🚩 add feature flag for public read access ([0683e24](https://github.com/circleeh/disco/commit/0683e2468dd226f22591029e2630925a0a0b1a7c))
* **backend:** ⚡️ add caching to reduce Google Sheets API calls ([22ede09](https://github.com/circleeh/disco/commit/22ede09c9eee3f1cdc7019fbaf2665a47a5bb9ba))
* **backend:** ✨ adds MVP for the API ([b66f01a](https://github.com/circleeh/disco/commit/b66f01aec2c9ebb92f0868c34b90dfeadcfb6766))
* **frontend:** 🎉 initialize frontend with Docker and React setup ([dbe571b](https://github.com/circleeh/disco/commit/dbe571b40a8fc671d21326b9b32c81c043c77a5a))
* **frontend:** 💄 add album filter modal for vinyl collection ([b8dc157](https://github.com/circleeh/disco/commit/b8dc157ba2da268492ec8c4f67b0e2b8b1c0fe51))
* **frontend:** 💄 add pagination and filters to UI ([753f1c5](https://github.com/circleeh/disco/commit/753f1c5c427cc1b57e496011c24bfa3c79ce52f9))
* **frontend:** 💄 update UI with midcentury theme colours ([0fd59e2](https://github.com/circleeh/disco/commit/0fd59e27612fb664552520e888313b02787444ee))
* **googleSheets:** 🔊 add detailed logging for record operations ([a52d563](https://github.com/circleeh/disco/commit/a52d5635f3898ede3590cd48afb4462b2d845ef6))
* **imageSearch:** ➕ add image search and metadata retrieval ([da52681](https://github.com/circleeh/disco/commit/da52681aac2f4d6ee13cdf7475db047c38195252))
* **imageSearch:** 🦺 remove placeholder generation for album covers ([b72cea0](https://github.com/circleeh/disco/commit/b72cea0500ebca16a1cc77a6c0c707e8aa768187))
* **metadata:** ⚡️ optimize cover art processing ([fe737f6](https://github.com/circleeh/disco/commit/fe737f65cd706104750535731bb0fd813dd4ab68))
* **metadata:** ✨ add enhanced search by artist and album ([84f0f05](https://github.com/circleeh/disco/commit/84f0f05f4e963e70180a6da847f145ff8b066ad9))
* **scripts:** 🎉 add deployment and setup scripts ([08cbbba](https://github.com/circleeh/disco/commit/08cbbba43da859a2a0abdf2f0c85a26d348a04c3))
* **validation:** 🦺 add albumName and year filters ([06bf021](https://github.com/circleeh/disco/commit/06bf021bc9c3dd1072cb76b72f41fc2c2ac97f79))
* **vinyl:** 💄 add CollectionControls and VinylCard components ([8d8f8d5](https://github.com/circleeh/disco/commit/8d8f8d5d71a8c06ba746bb7d76a0b6d747ae3d85))
* **vinyl:** 💄 add owner display to VinylCard component ([3c32e89](https://github.com/circleeh/disco/commit/3c32e8974d9e67207a63f39e009c02a6ae319f55))

### Bug Fixes

* **auth:** 🔊 add error handling for missing auth token ([32b6458](https://github.com/circleeh/disco/commit/32b6458fbe32e48db049713c817927545d0eb9e8))
