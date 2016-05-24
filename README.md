# republish-npm-packages

Pull npm packages from one private registry and republish all of their versions to another npm registry.

This will take every version of a module in one registry and publish it into another registry.

## usage

republish-npm-packages> node . --source http://my.registry.net --destination http://my.newregistry.net --package my-npm-package

## notes

The publishing of multiple versions happens in semantic-version sorted order to compensate for a bug in ProGet (where @latest is always the most recently published version, not the highest semantic version).
