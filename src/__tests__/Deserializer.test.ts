import { Deserializer, getDeserializer, Item, ItemDeserializer, RelationshipDeserializer } from '../index';

const jsonapiOrgExampleData = {
  links: {
    self: 'http://example.com/articles',
    next: 'http://example.com/articles?page[offset]=2',
    last: 'http://example.com/articles?page[offset]=10',
  },
  data: [
    {
      type: 'articles',
      id: '1',
      attributes: {
        title: 'JSON:API paints my bikeshed!',
      },
      relationships: {
        author: {
          links: {
            self: 'http://example.com/articles/1/relationships/author',
            related: 'http://example.com/articles/1/author',
          },
          data: { type: 'people', id: '9' },
        },
        comments: {
          links: {
            self: 'http://example.com/articles/1/relationships/comments',
            related: 'http://example.com/articles/1/comments',
          },
          data: [
            { type: 'comments', id: '5' },
            { type: 'comments', id: '12' },
          ],
        },
      },
      links: {
        self: 'http://example.com/articles/1',
      },
    },
  ],
  included: [
    {
      type: 'people',
      id: '9',
      attributes: {
        firstName: 'Dan',
        lastName: 'Gebhardt',
        twitter: 'dgeb',
      },
      links: {
        self: 'http://example.com/people/9',
      },
    },
    {
      type: 'people',
      id: '2',
      attributes: {
        firstName: 'John',
        lastName: 'Doe',
        twitter: 'jdoe',
      },
      links: {
        self: 'http://example.com/people/2',
      },
    },
    {
      type: 'comments',
      id: '5',
      attributes: {
        body: 'First!',
      },
      relationships: {
        author: {
          data: { type: 'people', id: '2' },
        },
      },
      links: {
        self: 'http://example.com/comments/5',
      },
    },
    {
      type: 'comments',
      id: '12',
      attributes: {
        body: 'I like XML better',
      },
      relationships: {
        author: {
          data: { type: 'people', id: '9' },
        },
      },
      links: {
        self: 'http://example.com/comments/12',
      },
    },
  ],
};

type Article = {
  id: number;
  title: string;
  author?: Person;
  comments: Comment[];
};

type Person = {
  id: number;
  firstName: string;
  lastName: string;
  twitter: string;
};

type Comment = {
  id: number;
  body: string;
  author?: Person;
};

const articleDeserializer : ItemDeserializer<Article> = {
  type: 'articles',
  deserialize: (item: Item, relationshipDeserializer: RelationshipDeserializer): Article => {
    const article: Article = {
      id: parseInt(item.id),
      title: item.attributes.title,
      comments: [],
    };

    article.author = relationshipDeserializer.deserializeRelationship(relationshipDeserializer, item, 'author');
    article.comments = relationshipDeserializer.deserializeRelationships(relationshipDeserializer, item, 'comments');

    return article;
  }
}

const personDeserializer : ItemDeserializer<Person> = {
  type: 'people',
  deserialize: (item: Item, _: RelationshipDeserializer): Person => {
    return {
      id: parseInt(item.id),
      firstName: item.attributes.firstName,
      lastName: item.attributes.lastName,
      twitter: item.attributes.twitter,
    }
  },
}

const commentDeserializer : ItemDeserializer<Comment> = {
  type: 'comments',
  deserialize: (item: Item, relationshipDeserializer: RelationshipDeserializer): Comment => {
    const comment: Comment = {
      id: parseInt(item.id),
      body: item.attributes.body,
    };

    comment.author = relationshipDeserializer.deserializeRelationship(relationshipDeserializer, item, 'author');

    return comment;
  }
}

// a JSON:API response with a simple directory structure with a couple of files and folders
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
    },
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
            },
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
      },
    },
  ],
};

const fileSystemExampleData2 = {
  data: {
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
  },
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
            },
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
      },
    },
  ],
};

type Folder = {
  id: number;
  name: string;
  children: (Folder | File)[];
};

type File = {
  id: number;
  name: string;
};

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
  },
}

const fileDeserializer: ItemDeserializer<File> = {
  type: 'files',
  deserialize: (item: Item, relationshipDeserializer: RelationshipDeserializer): File => {
    return {
      id: parseInt(item.id),
      name: item.attributes.name,
    };
  }
}

describe('Deserializer', () => {
  it('deserializes the jsonapi.org example into an object graph', () => {
    const deserializer : Deserializer = getDeserializer([
      articleDeserializer,
      personDeserializer,
      commentDeserializer,
    ]);

    const rootItems: any[] = deserializer.consume(jsonapiOrgExampleData).getRootItems();

    expect(rootItems).toMatchSnapshot();
  });

  it('deserializes a file system example into an object graph', () => {
    const deserializer : Deserializer = getDeserializer([folderDeserializer, fileDeserializer]);

    const rootItems: any[] = deserializer.consume(fileSystemExampleData).getRootItems();

    expect(rootItems).toMatchSnapshot();
  });

  it('deserializes the second file system example (single entity) into an object graph', () => {
    const deserializer : Deserializer = getDeserializer([folderDeserializer, fileDeserializer]);

    const rootItem: Folder = deserializer.consume(fileSystemExampleData2).getRootItem();

    expect(rootItem).toMatchSnapshot();
  });
});
