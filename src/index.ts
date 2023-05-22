/**
 * RelationshipItem is an object that contains the link to a related entity in the "data" section of the JSON:API response.
 */
type RelationshipItem = {
    id: string,
    type: string,
    meta?: {
        [key: string]: unknown
    }
}

/**
 * Item is an object that contains the raw data for a single entity in "data" or "included" sections of the JSON:API response.
 */
export type Item = {
    id: string;
    type: string;
    attributes: {
        [key: string]: any
    };
    relationships?: {
        [key: string]: {
            links?: {
                [key: string]: any
            },
            data?: RelationshipItem | RelationshipItem[] | null
        }
    };
    meta?: {
        [key: string]: any
    };
    links?: {
        [key: string]: any
    }
};

/**
 * JsonApiPayload is the JSON:API response payload.
 */
type JsonApiPayload = {
    data: Item | Item[],
    included?: Item[]
    meta?: {
        [key: string]: any
    },
    links?: {
        [key: string]: any
    }
}

export type ItemDeserializer<T> = {
    /**
     * The type of entity, for example "articles" or "comments"
     */
    type: string;

    /**
     * A function that returns an object (of type T) deserialized based on given data (of type Item).
     *
     * @param item
     * @param relationshipDeserializer
     */
    deserialize: (item: Item, relationshipDeserializer: RelationshipDeserializer) => T;
};

/**
 * EntityStore contains the raw data for entities of certain type, indexed by the entity id.
 */
type EntityStore = { [key: string]: Item };

/**
 * EntityStoreCollection contains the EntityStores, indexed by the entity type.
 */
type EntityStoreCollection = { [key: string]: EntityStore };

type ItemDeserializerRegistry = { [key: string]: ItemDeserializer<any> };

export interface RelationshipDeserializer {
    /**
     * Returns whether the data for item's relationship with given name is present in the included -section.
     *
     * Sometimes the JSON:API response contains a relationship to an entity that is not included in the "included" section of the response.
     * If this is the case, the relationshipDeserializer will not be able to deserialize the relationship but will throw an error. To mitigate
     * this, you can check if the data exists before deserializing the relationship.
     */
    isRelationshipDataPresent(item: Item, name: string): boolean;

    deserializeRelationship(item: Item, name: string): any;

    deserializeRelationships(item: Item, name: string): any[];
}

export class Deserializer implements RelationshipDeserializer {
    private rootItems: EntityStore = {};
    private entityStoreCollection: EntityStoreCollection = {};
    private itemDeserializerRegistry: ItemDeserializerRegistry = {};

    public registerItemDeserializer(itemDeserializer: ItemDeserializer<any>): Deserializer {
        this.itemDeserializerRegistry[itemDeserializer.type] = itemDeserializer;

        return this;
    }

    /**
     * Returns the root item from the JSON:API data, with any relationships embedded.
     */
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

        return this.getDeserializerForType(type).deserialize(item, this);
    }

    /**
     * Returns the root items (as an array) from the JSON:API data, with any relationships embedded.
     */
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

    public isRelationshipDataPresent(item: Item, name: string): boolean {
        if (item?.relationships === undefined || item?.relationships === null) {
            return false;
        }

        const relationShips = item?.relationships[name]

        if (Array.isArray(relationShips?.data)) {
            const relationships: RelationshipItem[] = relationShips.data as RelationshipItem[];
            return relationships.every((relationship) => {
                return !!this.getItemByTypeAndId(relationship.type, relationship.id);
            });
        }

        if (relationShips?.data?.id && relationShips?.data?.type) {
            const relationship: RelationshipItem = relationShips.data as RelationshipItem;

            return !!this.getItemByTypeAndId(relationship.type, relationship.id);
        }

        return false;
    }

    /**
     * Parses and wires the relationship with the given name for the given item.
     *
     * @param item
     * @param name
     */
    public deserializeRelationship(item: Item, name: string): any {
        if (!item?.relationships || !item.relationships[name] || !item.relationships[name]?.data) return null;

        const relationships: RelationshipItem | RelationshipItem[] | null | undefined = item.relationships[name]?.data
        if (!relationships) return null;
        if (Array.isArray(relationships)) {
            throw new Error(`Relationship "${name}" is an array, use deserializeRelationships instead.`);
        }

        const relationship: RelationshipItem = relationships as RelationshipItem

        if (!relationship) return null;

        const relationshipItem = this.getItemByTypeAndId(relationship.type, relationship.id);
        if (!relationshipItem) return null;

        return this.getDeserializerForType(relationship.type).deserialize(relationshipItem, this);
    }

    /**
     * Parses and wires the relationships with the given name for the given item. Returns an array of deserialized items.
     *
     * @param item
     * @param name
     */
    public deserializeRelationships(item: Item, name: string): any[] {
        if (!item?.relationships || !item.relationships[name]) return [];

        const ret: any[] = [];

        const relationshipItems = item.relationships[name].data;

        if (!Array.isArray(relationshipItems)) return ret;

        relationshipItems.forEach((relationship: RelationshipItem) => {
            const relationshipItem = this.getItemByTypeAndId(relationship.type, relationship.id);

            if (!relationshipItem) return;

            ret.push(this.getDeserializerForType(relationship.type).deserialize(relationshipItem, this));
        });

        return ret;
    }

    private getItemByTypeAndId(type: string, id: string): Item|null {
        if (!this.entityStoreCollection.hasOwnProperty(type)) {
            return null
        }
        const item: Item = this.entityStoreCollection[type][id];

        if (!item) {
            return null
        }

        return item;
    }

    private getDeserializerForType(type: string): ItemDeserializer<any> {
        const deserializer: ItemDeserializer<any> = this.itemDeserializerRegistry[type];
        if (!deserializer) {
            throw new Error(`An ItemDeserializer for type ${type} is not registered.`);
        }

        return deserializer;
    }

    /**
     * @param json The "raw" json object from JSON:API response; must contain key "data"
     */
    public consume(json: JsonApiPayload): Deserializer {
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

/**
 * Returns a Deserializer with the given ItemDeserializers registered.
 */
export function getDeserializer(itemDeserializers: ItemDeserializer<any>[]): Deserializer {
    const deserializer: Deserializer = new Deserializer();

    itemDeserializers.forEach((itemDeserializer: ItemDeserializer<any>) => {
        deserializer.registerItemDeserializer(itemDeserializer);
    });

    return deserializer;
}
