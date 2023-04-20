import {getDeserializer, Item, ItemDeserializer, RelationshipDeserializer} from "jsonapi-ts-deserializer";

const fileSystemExampleData = {
    data: [
        {
            type: 'folders',
            id: '1',
            attributes: {
                name: 'root',
            },
            relationships: {
                children: {
                    data: [
                        {
                            type: 'folders',
                            id: '2',
                        },
                        {
                            type: 'files',
                            id: '3',
                        },
                    ],
                },
            },
        }
    ],
    included: [
        {
            type: 'folders',
            id: '2',
            attributes: {
                name: 'home',
            },
            relationships: {
                children: {
                    data: [
                        {
                            type: 'files',
                            id: '4',
                        },
                        {
                            type: 'folders',
                            id: '5',
                        }
                    ],
                },
            },
        },
        {
            type: 'files',
            id: '3',
            attributes: {
                name: 'swapfile',
            },
        },
        {
            type: 'files',
            id: '4',
            attributes: {
                name: 'README.md',
            },
        },
        {
            type: 'folders',
            id: '5',
            attributes: {
                name: 'juha',
            }
        }
    ]
}

type Folder = {
    id: number;
    name: string;
    children: (Folder | File)[];
}

type File = {
    id: number;
    name: string;
}

const folderDeserializer : ItemDeserializer<Folder> = {
    type: 'folders',
    deserialize: (item: Item, relationshipDeserializer: RelationshipDeserializer): Folder => {
        const folder: Folder = {
            id: parseInt(item.id),
            name: item.attributes.name,
            children: [],
        };

        folder.children = relationshipDeserializer.deserializeRelationships(relationshipDeserializer, item, 'children');

        return folder;
    }
}

const fileDeserializer : ItemDeserializer<File> = {
    type: 'files',
    deserialize: (item: Item, relationshipDeserializer: RelationshipDeserializer): File => {
        return {
            id: parseInt(item.id),
            name: item.attributes.name,
        };
    }
}

const deserializer = getDeserializer([
    folderDeserializer,
    fileDeserializer,
]);

const rootItems: any[] = deserializer.consume(fileSystemExampleData).getRootItems();

console.log(JSON.stringify(rootItems, null, 2));
