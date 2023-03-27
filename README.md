# JSON:API deserializer in Typescript

A JSON:API response payload is a normalized set of entities and their relationships plus some metadata. This package
deserializes a JSON:API response payload into an object graph, using user-defined entity deserializers to build the
actual entities.

## Installation

```shell
npm i jsonapi-ts-deserializer
```

## Usage

### Example

This example uses the jsonapi.org sample data (added the missing person, though) and builds an object-graph out of it:

```typescript
// Import the package and required interfaces:
import {getDeserializer, Item, ItemDeserializer, RelationshipDeserializer} from "jsonapi-ts-deserializer";

// Have some data to deserialize:
const jsonapiOrgExampleData = {
    "links": {
        "self": "http://example.com/articles",
        "next": "http://example.com/articles?page[offset]=2",
        "last": "http://example.com/articles?page[offset]=10"
    },
    "data": [{
        "type": "articles",
        "id": "1",
        "attributes": {
            "title": "JSON:API paints my bikeshed!"
        },
        "relationships": {
            "author": {
                "links": {
                    "self": "http://example.com/articles/1/relationships/author",
                    "related": "http://example.com/articles/1/author"
                },
                "data": { "type": "people", "id": "9" }
            },
            "comments": {
                "links": {
                    "self": "http://example.com/articles/1/relationships/comments",
                    "related": "http://example.com/articles/1/comments"
                },
                "data": [
                    { "type": "comments", "id": "5" },
                    { "type": "comments", "id": "12" }
                ]
            }
        },
        "links": {
            "self": "http://example.com/articles/1"
        }
    }],
    "included": [
        {
            "type": "people",
            "id": "9",
            "attributes": {
                "firstName": "Dan",
                "lastName": "Gebhardt",
                "twitter": "dgeb"
            },
            "links": {
                "self": "http://example.com/people/9"
            }
        },
        {
            "type": "people",
            "id": "2",
            "attributes": {
                "firstName": "John",
                "lastName": "Doe",
                "twitter": "jdoe"
            },
            "links": {
                "self": "http://example.com/people/2"
            }
        },
        {
            "type": "comments",
            "id": "5",
            "attributes": {
                "body": "First!"
            },
            "relationships": {
                "author": {
                    "data": { "type": "people", "id": "2" }
                }
            },
            "links": {
                "self": "http://example.com/comments/5"
            }
        }, {
            "type": "comments",
            "id": "12",
            "attributes": {
                "body": "I like XML better"
            },
            "relationships": {
                "author": {
                    "data": { "type": "people", "id": "9" }
                }
            },
            "links": {
                "self": "http://example.com/comments/12"
            }
        }
    ]
}

// have some types to deserialize to:
type Article = {
    id: number;
    title: string;
    author?: Person;
    comments: Comment[];
}

type Person = {
    id: number;
    firstName: string;
    lastName: string;
    twitter: string;
}

type Comment = {
    id: number;
    body: string;
    author?: Person;
}

// implement deserializers for these entities:
class ArticleDeserializer implements ItemDeserializer {
    getType(): string {
        return "articles"
    }

    deserialize(item: Item, relationshipDeserializer: RelationshipDeserializer): any {
        const article: Article = {
            id: parseInt(item.id),
            title: item.attributes.title,
            comments: [],
        }

        article.author = relationshipDeserializer.deserializeRelationship(relationshipDeserializer, item, 'author');
        article.comments = relationshipDeserializer.deserializeRelationships(relationshipDeserializer, item, 'comments');

        return article
    }
}

class PersonDeserializer implements ItemDeserializer {
    getType(): string {
        return "people"
    }

    deserialize(item: Item, relationshipDeserializer: RelationshipDeserializer): any {
        return {
            id: parseInt(item.id),
            firstName: item.attributes.firstName,
            lastName: item.attributes.lastName,
            twitter: item.attributes.twitter,
        }
    }
}

class CommentDeserializer implements ItemDeserializer {
    getType(): string {
        return "comments"
    }

    deserialize(item: Item, relationshipDeserializer: RelationshipDeserializer): any {
        const comment:Comment = {
            id: parseInt(item.id),
            body: item.attributes.body,
        };

        comment.author = relationshipDeserializer.deserializeRelationship(relationshipDeserializer, item, 'author');

        return comment
    }
}

// instantiate the deserializer with the entity deserializers registered:
const deserializer = getDeserializer([
    new ArticleDeserializer(),
    new PersonDeserializer(),
    new CommentDeserializer(),
])

// consume the data and pull out the object graph (which is an array of entities in this particular example)
const rootItems:any[] = deserializer.consume(jsonapiOrgExampleData).getRootItems()
```

## Credits

Setting up the npm-package with all the bells and whistles would've taken me hours, so I followed the following tutorial for that part:

https://itnext.io/step-by-step-building-and-publishing-an-npm-typescript-package-44fe7164964c
