# A filesystem example

This example represents a filesystem with files and directories. It is used to demonstrate the usage with recursive types.

To see it in action, use the following commands:

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
    "name": "root",
    "children": [
      {
        "id": 2,
        "name": "home",
        "children": [
          {
            "id": 4,
            "name": "README.md"
          },
          {
            "id": 5,
            "name": "juha",
            "children": []
          }
        ]
      },
      {
        "id": 3,
        "name": "swapfile"
      }
    ]
  }
]
```