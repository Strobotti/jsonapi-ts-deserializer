# JSON:API deserializer in Typescript

A JSON:API response payload is a normalized set of entities and their relationships plus some metadata. This package
deserializes a JSON:API response payload into an object graph, using user-defined entity deserializers to build the
actual entities.

## Installation

```shell
npm i jsonapi-ts-deserializer
```

## Usage

```typescript
import { getDeserializer, ItemDeserializer, RelationshipDeserializer } from 'jsonapi-ts-deserializer';

// Introduce types for your entities, the folder:
type Folder = {
    id: number;
    name: string;
    children: (Folder | File)[];
}

// and the file:
type File = {
    id: number;
    name: string;
}

// Create a deserializer for the folder:
class FolderDeserializer implements ItemDeserializer {
    getType(): string {
        return 'folders';
    }

    deserialize(item: Item, relationshipDeserializer: RelationshipDeserializer): any {
        const folder: Folder = {
            id: parseInt(item.id),
            name: item.attributes.name,
            children: [],
        };

        folder.children = relationshipDeserializer.deserializeRelationships(relationshipDeserializer, item, 'children');

        return folder;
    }
}

// ...and also for the file:
class FileDeserializer implements ItemDeserializer {
    getType(): string {
        return 'files';
    }

    deserialize(item: Item, relationshipDeserializer: RelationshipDeserializer): any {
        return {
            id: parseInt(item.id),
            name: item.attributes.name,
        };
    }
}

// create the deserializer with the folder and file deserializers registered:
const deserializer = getDeserializer([
    new FolderDeserializer(),
    new FileDeserializer(),
]);

// Fetch your JSON:API data:
const yourJsonData = fetch('https://api.example.com/api/folders');

// consume it and get the root items with the complete object-graph:
const rootItems: any[] = deserializer.consume(yourJsonData).getRootItems();
```

### Examples

* [The JSON from the jsonapi.org example](docs/examples/jsonapiorg)
* [A small filesystem tree, with some recursion](docs/examples/filesystem)

## TODO

At least the following things are in the backlog:

* [ ] Ditch the classes in the entity deserializers and use types instead
* [ ] Consider caching the deserialized entities and reusing them
* [ ] Come up with a spectacular logo for this package

## Credits

Setting up the npm-package with all the bells and whistles would've taken me hours, so I followed the following tutorial for that part:

https://itnext.io/step-by-step-building-and-publishing-an-npm-typescript-package-44fe7164964c
