import { Query } from "mongoose";

export class QueryBuilder<T> {
    public modelQuery: Query<T[], T>;
    public readonly query: Record<string, string>;

    constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
        this.modelQuery = modelQuery;
        this.query = query;
    }

    search(searchableFields: string[]): this {
        const search = this.query.search;
        if (!search) return this;
        const searchTerm = {
            $or: searchableFields.map(field => ({
                [field]: { $regex: search, $options: "i" }
            }))
        };
        this.modelQuery = this.modelQuery.find(searchTerm);
        return this;
    };
};