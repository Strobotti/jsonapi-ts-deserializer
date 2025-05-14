## [2.4.1](https://github.com/Strobotti/jsonapi-ts-deserializer/compare/v2.4.0...v2.4.1) (2025-05-14)


### Bug Fixes

* version ([b6ca87b](https://github.com/Strobotti/jsonapi-ts-deserializer/commit/b6ca87b04856e8c51298441b46fa59ebf2ad6a9e))

# [2.3.0](https://github.com/Strobotti/jsonapi-ts-deserializer/compare/v2.2.0...v2.3.0) (2023-05-30)


### Features

* have stricter type-checks ([#7](https://github.com/Strobotti/jsonapi-ts-deserializer/issues/7)) ([962b7f5](https://github.com/Strobotti/jsonapi-ts-deserializer/commit/962b7f54c3deec574ef58658a1412c6f0d86b6c2))

# [2.2.0](https://github.com/Strobotti/jsonapi-ts-deserializer/compare/v2.1.0...v2.2.0) (2023-05-27)


### Features

* migrate from tslint to eslint ([#6](https://github.com/Strobotti/jsonapi-ts-deserializer/issues/6)) ([9fff9a5](https://github.com/Strobotti/jsonapi-ts-deserializer/commit/9fff9a545f2b6c5702303ca687ef84438754db91))

# [2.1.0](https://github.com/Strobotti/jsonapi-ts-deserializer/compare/v2.0.1...v2.1.0) (2023-05-22)


### Features

* introduce stronger types to fail fast ([#5](https://github.com/Strobotti/jsonapi-ts-deserializer/issues/5)) ([710704e](https://github.com/Strobotti/jsonapi-ts-deserializer/commit/710704e30378ac84eef8da5db6d707d4f6aef68c))

## [2.0.1](https://github.com/Strobotti/jsonapi-ts-deserializer/compare/v2.0.0...v2.0.1) (2023-05-04)


### Bug Fixes

* crash when data is null for a relationship ([68e06e6](https://github.com/Strobotti/jsonapi-ts-deserializer/commit/68e06e636d6a63c1c40fa8b075cd2e4525005848))

# [2.0.0](https://github.com/Strobotti/jsonapi-ts-deserializer/compare/v1.1.3...v2.0.0) (2023-04-20)


### Features

* use types instead of classes with ItemDeserializer ([d31748b](https://github.com/Strobotti/jsonapi-ts-deserializer/commit/d31748b354eaadd87f1dffe75791643b97205a70))


### BREAKING CHANGES

* ItemDeserializer is now a type and not an interface

The ItemSerializer needs to be implemented by having a type that contains the "type" and "deserialize" also supporting generics with the deserialize return value. See the updated documentation on README.md for details.

## [1.1.3](https://github.com/Strobotti/jsonapi-ts-deserializer/compare/v1.1.2...v1.1.3) (2023-03-28)


### Bug Fixes

* conflicting license ([f4ac569](https://github.com/Strobotti/jsonapi-ts-deserializer/commit/f4ac569f9410a8c000c6ffde366f54265b99f383))

## [1.1.2](https://github.com/Strobotti/jsonapi-ts-deserializer/compare/v1.1.1...v1.1.2) (2023-03-28)


### Bug Fixes

* bump version to release updated docs etc to npm ([307731c](https://github.com/Strobotti/jsonapi-ts-deserializer/commit/307731c31ab96ec4d9a6564cebbd76529e23c38c))

## [1.1.1](https://github.com/Strobotti/jsonapi-ts-deserializer/compare/v1.1.0...v1.1.1) (2023-03-27)


### Bug Fixes

* add missing emptiness-check ([20100d6](https://github.com/Strobotti/jsonapi-ts-deserializer/commit/20100d669670c7e058095867f7102d5b5c9148f4))

# [1.1.0](https://github.com/Strobotti/jsonapi-ts-deserializer/compare/v1.0.1...v1.1.0) (2023-03-27)


### Features

* use semantic-release ([4ffeafc](https://github.com/Strobotti/jsonapi-ts-deserializer/commit/4ffeafc1a785eb286f9518f1703a81d909cf2113))
