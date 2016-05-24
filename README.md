# republish-npm-packages

Pull npm packages from one private registry and republish all of their versions to another npm registry.

This will take every version of a module in one registry and publish it into another registry.

## usage
<pre>
republish-npm-packages> node . --source http://my.registry.net --destination http://my.newregistry.net --package my-npm-package --username me --password myPassword --email myemail@mydomain.com
</pre>

### Command Line Options

<pre>
--source       The URL of the source registry [string] [required]
--destination  The URL of the destination registry [string] [required]
--package      The package name to republish [string] [required]
--username     Authentication username for publishing to the destination registry [string] [required]
--password     Authentication password for publishing to the destination registry [string] [required]
--email        Authentication email for publishing to the destination registry [string] [required]
--help         Show help [boolean]
</pre>


## notes

The publishing of multiple versions happens in semantic-version sorted order to compensate for a bug in ProGet (where @latest is always the most recently published version, not the highest semantic version).
