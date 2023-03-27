# A filesystem example

This example shows the official [jsonapi.org](https://jsonapi.org/) example in action.

Use the following commands to run it:

```shell
# Install dependencies specified in package.json:
npm install
# Install TypeScript compiler to compile the example:
npm install -g typescript
 # Compile the example into JavaScript:
tsc index.ts
# Run the compiled example:
node index.js
```

You should see something like this as a result:

```json
[
  {
    "id": 1,
    "title": "JSON:API paints my bikeshed!",
    "comments": [
      {
        "id": 5,
        "body": "First!",
        "author": {
          "id": 2,
          "firstName": "John",
          "lastName": "Doe",
          "twitter": "jdoe"
        }
      },
      {
        "id": 12,
        "body": "I like XML better",
        "author": {
          "id": 9,
          "firstName": "Dan",
          "lastName": "Gebhardt",
          "twitter": "dgeb"
        }
      }
    ],
    "author": {
      "id": 9,
      "firstName": "Dan",
      "lastName": "Gebhardt",
      "twitter": "dgeb"
    }
  }
]
```