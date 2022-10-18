# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.2.0](https://github.com/leviat-tech/normie/compare/v1.0.2...v1.2.0) (2022-10-18)


### Features

* add beforeCreate, afterCreate, beforeDelete and afterDelete entity methods ([26c7b25](https://github.com/leviat-tech/normie/commit/26c7b25ab10a2b6bffc97cdf8b0c91711c36a7c3))


### Bug Fixes

* correctly apply foreign key opts when using belongsTo ([#8](https://github.com/leviat-tech/normie/issues/8)) ([9b48031](https://github.com/leviat-tech/normie/commit/9b480312209f441c51d578e5603d51c80eb2f997))
* ensure all related entities are deleted when cascade enabled ([596406c](https://github.com/leviat-tech/normie/commit/596406c91f7e2b5a4168f285260851271ad9bd13))
* weird merge behavior with arrays ([23fdd03](https://github.com/leviat-tech/normie/commit/23fdd032d8e897ed685b5645ef4fb05e011c9e12))

### [1.1.2](https://github.com/leviat-tech/normie/compare/v1.1.0...v1.1.2) (2022-10-18)


### Bug Fixes

* ensure all related entities are deleted when cascade enabled ([596406c](https://github.com/leviat-tech/normie/commit/596406c91f7e2b5a4168f285260851271ad9bd13))
* weird merge behavior with arrays ([15899d0](https://github.com/leviat-tech/normie/commit/15899d0f3e1fab23be8bbc00c42c57441d8d0169))

### [1.1.1](https://github.com/leviat-tech/normie/compare/v1.0.2...v1.1.1) (2022-10-05)


### Bug Fixes

* correctly apply foreign key opts when using belongsTo ([#8](https://github.com/leviat-tech/normie/issues/8)) ([9b48031](https://github.com/leviat-tech/normie/commit/9b480312209f441c51d578e5603d51c80eb2f997))
* ensure all related entities are deleted when cascade enabled ([6750cb2](https://github.com/leviat-tech/normie/commit/6750cb234ba2a73fd5541f18d9489f9cd0216746))

## 1.1.0 (2022-10-04)


### Features

* add beforeUpdate and afterUpdate hooks ([e4a51ae](https://github.com/leviat-tech/normie/commit/e4a51aec97823bc6117aa42fd997f728cc067075))
* add exception types ([b21cd98](https://github.com/leviat-tech/normie/commit/b21cd985d59cf1cb22a7de58e665cca4e62359fb))
* add many to many relations, break up into smaller files ([8de1389](https://github.com/leviat-tech/normie/commit/8de13893cd16b13ea3999ce0aa53d1445f31a502))
* add models getter ([cfd5382](https://github.com/leviat-tech/normie/commit/cfd53825e11e6aad8231fcaa52ede6a09f399d8f))
* add serialization ([e0b1131](https://github.com/leviat-tech/normie/commit/e0b1131cf5e163e2672d0c54e739cc98b978da39))
* add standard version for releases ([f56ef6f](https://github.com/leviat-tech/normie/commit/f56ef6f287d2af0f140354b8c2bc388a340fd6b5))
* allow custom formatting, implicit foreign key in belongsTo ([7b01f72](https://github.com/leviat-tech/normie/commit/7b01f72df525628cac88c56b599b2977c5452887))
* docs & app ([0cf2a36](https://github.com/leviat-tech/normie/commit/0cf2a36c83e40e6b1bbf6dbaa93e17389c6a5983))
* reorganize tests, add more validation errors ([806c3de](https://github.com/leviat-tech/normie/commit/806c3de383de71383aaf63eff9d2e220409ea8d2))


### Bug Fixes

* correctly apply foreign key opts when using belongsTo ([#8](https://github.com/leviat-tech/normie/issues/8)) ([9b48031](https://github.com/leviat-tech/normie/commit/9b480312209f441c51d578e5603d51c80eb2f997))
* prevent error when fields() reads from store ([69d8e55](https://github.com/leviat-tech/normie/commit/69d8e55ee3c6b5f37dd45bc069d9d4ee32e77975))
* remove chain from hasMany ([#7](https://github.com/leviat-tech/normie/issues/7)) ([7d7b84b](https://github.com/leviat-tech/normie/commit/7d7b84bb257f5ee7fa6f8838d947a2ef1b9e578f))

### [1.0.2](https://github.com/leviat-tech/normie/compare/v1.0.1...v1.0.2) (2022-09-30)

### [1.0.1](https://github.com/leviat-tech/normie/compare/v1.0.0...v1.0.1) (2022-09-30)


### Bug Fixes

* remove chain from hasMany ([#7](https://github.com/leviat-tech/normie/issues/7)) ([7d7b84b](https://github.com/leviat-tech/normie/commit/7d7b84bb257f5ee7fa6f8838d947a2ef1b9e578f))

## [1.0.0](https://github.com/leviat-tech/normie/compare/v0.0.2...v1.0.0) (2022-08-28)

### [0.0.2](https://github.com/leviat-tech/normie/compare/v0.0.1...v0.0.2) (2022-08-28)


### Features

* add standard version for releases ([f56ef6f](https://github.com/leviat-tech/normie/commit/f56ef6f287d2af0f140354b8c2bc388a340fd6b5))


### Bug Fixes

* prevent error when fields() reads from store ([69d8e55](https://github.com/leviat-tech/normie/commit/69d8e55ee3c6b5f37dd45bc069d9d4ee32e77975))

### 0.0.1 (2022-08-23)


### Features

* add beforeUpdate and afterUpdate hooks ([e4a51ae](https://github.com/leviat-tech/normie/commit/e4a51aec97823bc6117aa42fd997f728cc067075))
* add exception types ([b21cd98](https://github.com/leviat-tech/normie/commit/b21cd985d59cf1cb22a7de58e665cca4e62359fb))
* add many to many relations, break up into smaller files ([8de1389](https://github.com/leviat-tech/normie/commit/8de13893cd16b13ea3999ce0aa53d1445f31a502))
* add models getter ([cfd5382](https://github.com/leviat-tech/normie/commit/cfd53825e11e6aad8231fcaa52ede6a09f399d8f))
* add serialization ([e0b1131](https://github.com/leviat-tech/normie/commit/e0b1131cf5e163e2672d0c54e739cc98b978da39))
* allow custom formatting, implicit foreign key in belongsTo ([7b01f72](https://github.com/leviat-tech/normie/commit/7b01f72df525628cac88c56b599b2977c5452887))
* docs & app ([0cf2a36](https://github.com/leviat-tech/normie/commit/0cf2a36c83e40e6b1bbf6dbaa93e17389c6a5983))
* reorganize tests, add more validation errors ([806c3de](https://github.com/leviat-tech/normie/commit/806c3de383de71383aaf63eff9d2e220409ea8d2))
