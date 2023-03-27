/**
 * Item is an object that contains the raw data for a single entity in "data" or "included" sections of the JSON:API response.
 */
export type Item = {
  id: string;
  type: string;
  attributes: any;
  relationships?: any;
  meta?: any;
};

export interface ItemDeserializer {
  /**
   * Must return the type of entity, for example "articles" or "comments"
   */
  getType(): string;

  /**
   * Must return an object deserialized based on given data (of type Item).
   *
   * Any relationships can be populated by using the RelationshipDeserializer that is passed along.
   * - use the deserializeRelationship() -method if the relationship is 1:1
   * - use the deserializeRelationships() -method if the relationship is one-to-many
   *
   * @param data
   * @param deserializer
   */
  deserialize(data: Item, deserializer: Deserializer): any;
}

/**
 * EntityStore contains the raw data for entities of certain type, indexed by the entity id.
 */
type EntityStore = { [key: string]: Item };

/**
 * EntityStoreCollection contains the EntityStores, indexed by the entity type.
 */
type EntityStoreCollection = { [key: string]: EntityStore };

type ItemDeserializerRegistry = { [key: string]: ItemDeserializer };

export interface RelationshipDeserializer {
  deserializeRelationship(relationshipDeserializer: RelationshipDeserializer, item: Item, name: string): any;
  deserializeRelationships(relationshipDeserializer: RelationshipDeserializer, item: Item, name: string): any[];
}

export class Deserializer implements RelationshipDeserializer {
  private rootItems: EntityStore = {};
  private entityStoreCollection: EntityStoreCollection = {};
  private itemDeserializerRegistry: ItemDeserializerRegistry = {};

  public registerItemDeserializer(itemDeserializer: ItemDeserializer): Deserializer {
    this.itemDeserializerRegistry[itemDeserializer.getType()] = itemDeserializer;

    return this;
  }

  public getRootItem(): any {
    if (Object.keys(this.rootItems).length === 0) {
      return null;
    } else if (Object.keys(this.rootItems).length > 1) {
      throw new Error(
        `A singular JSON:API can only have up to one item, ${Object.keys(this.rootItems).length} items found.`,
      );
    }

    const item = this.rootItems[Object.keys(this.rootItems)[0]];
    const type = item.type;
    const itemDeserializer = this.itemDeserializerRegistry[type];

    if (!itemDeserializer) {
      throw new Error(`An ItemDeserializer for type ${type} is not registered.`);
    }

    return itemDeserializer.deserialize(item, this);
  }

  public getRootItems(): any[] {
    if (Object.keys(this.rootItems).length === 0) {
      return [];
    }

    const items: any[] = [];

    Object.keys(this.rootItems).forEach((id: string) => {
      const item = this.rootItems[id];
      const type = item.type;
      items.push(this.getDeserializerForType(type).deserialize(item, this));
    });

    return items;
  }

  deserializeRelationship(relationshipDeserializer: RelationshipDeserializer, item: Item, name: string): any {
    if (!item?.relationships || !item.relationships[name]) return null;

    const relationship = item.relationships[name].data;
    const relationshipItem = this.entityStoreCollection[relationship.type][relationship.id];

    if (!relationshipItem) {
      throw new Error(
        `Relationship "${name}" defined for entity  {id: "${item.id}", type: "${item.type}"} not found with {id: "${relationship.id}", type "${relationship.type}"}`,
      );
    }

    return this.getDeserializerForType(relationship.type).deserialize(relationshipItem, this);
  }

  deserializeRelationships(relationshipDeserializer: RelationshipDeserializer, item: Item, name: string): any[] {
    if (!item?.relationships || !item.relationships[name]) return [];

    const relationships = item.relationships[name].data;
    const ret: any[] = [];

    relationships.forEach((relationship: any) => {
      const relationshipItem = this.entityStoreCollection[relationship.type][relationship.id];

      if (!relationshipItem) {
        throw new Error(
          `Relationship "${name}" defined for entity  {id: "${item.id}", type: "${item.type}"} not found with {id: "${relationship.id}", type "${relationship.type}"}`,
        );
      }

      ret.push(this.getDeserializerForType(relationship.type).deserialize(relationshipItem, this));
    });

    return ret;
  }

  private getDeserializerForType(type: string): ItemDeserializer {
    const deserializer = this.itemDeserializerRegistry[type];
    if (!deserializer) {
      throw new Error(`An ItemDeserializer for type ${type} is not registered.`);
    }

    return deserializer;
  }

  /**
   * @param json The "raw" json object from JSON:API response; must contain key "data"
   */
  public consume(json: { data?: any; included?: any }): Deserializer {
    if (!json.data) {
      throw new Error('JSON-object must contain key `data`');
    }

    if (Array.isArray(json.data)) {
      json.data.forEach((item: Item) => {
        this.rootItems[item.id] = item;
        // TODO the root items _should_ really be included in the collection as well, but that might cause circular references
      });
    } else {
      this.rootItems[json.data.id] = json.data;
    }

    if (Array.isArray(json.included)) {
      json.included.forEach((item: Item) => {
        if (!this.entityStoreCollection[item.type]) {
          this.entityStoreCollection[item.type] = {};
        }

        this.entityStoreCollection[item.type][item.id] = item;
      });
    }
    return this;
  }
}

export function getDeserializer(itemDeserializers: ItemDeserializer[]): Deserializer {
  const deserializer: Deserializer = new Deserializer();

  itemDeserializers.forEach((itemDeserializer: ItemDeserializer) => {
    deserializer.registerItemDeserializer(itemDeserializer);
  });

  return deserializer;
}
