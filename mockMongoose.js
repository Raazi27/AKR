const counters = {}; // Store for auto-increment counters

class MockQuery {
    constructor(data) {
        this.data = data || [];
    }
    sort() { return this; }
    populate() { return this; }
    then(resolve, reject) { resolve(this.data); }
    catch(reject) { }
}

const db = {}; // In-memory database: { collectionName: [docs] }

const createMockModel = (modelName, schema) => {
    if (!db[modelName]) db[modelName] = [];

    class MockModel {
        constructor(data) {
            this._id = Math.random().toString(36).substr(2, 9);
            Object.assign(this, data);
        }

        async save() {
            db[modelName].push(this);
            return this;
        }

        static find(query) {
            let result = db[modelName];
            if (query) {
                result = result.filter(item => {
                    for (let key in query) {
                        if (query[key] instanceof RegExp) {
                            if (!query[key].test(item[key])) return false;
                        } else if (typeof query[key] === 'object') {
                            // Handle simple $or
                            if (query[key].$or) {
                                return query[key].$or.some(cond => {
                                    const k = Object.keys(cond)[0];
                                    const v = cond[k];
                                    if (v instanceof RegExp) return v.test(item[k]);
                                    return item[k] == v;
                                });
                            }
                            // Handle $inc (special case for findOneAndUpdate)
                        } else {
                            if (item[key] != query[key]) return false;
                        }
                    }
                    return true;
                });
            }
            return new MockQuery(result);
        }

        static findOne(query) {
            const res = this.find(query);
            // Extract result from MockQuery immediately (hacky but works for sync array filter)
            return {
                then: (resolve) => resolve(res.data[0] || null)
            };
        }

        static findById(id) {
            const item = db[modelName].find(d => d._id === id);
            return {
                populate: () => ({ then: (resolve) => resolve(item) }),
                then: (resolve) => resolve(item)
            };
        }

        static findByIdAndUpdate(id, update, options) {
            let item = db[modelName].find(d => d._id === id);

            // Handle upsert for counters
            if (!item && options && options.upsert) {
                item = { _id: id, ...update }; // simplified
                if (modelName === 'Counter') {
                    // specifically handle counter structure
                    item = { id: query.id, seq: 0 };
                    // Wait, findOneAndUpdate is usually called with query, not ID for counters
                }
                db[modelName].push(item);
            }

            if (item) {
                if (update.$inc) {
                    for (let key in update.$inc) {
                        item[key] = (item[key] || 0) + update.$inc[key];
                    }
                }
                Object.assign(item, update); // simple merge
            }
            return {
                then: (resolve) => resolve(item)
            };
        }

        static findOneAndUpdate(query, update, options) {
            // Specific mock for Counter model
            let item = db[modelName].find(d => {
                for (let k in query) if (d[k] != query[k]) return false;
                return true;
            });

            if (!item && options && options.upsert) {
                item = { ...query, seq: 0 };
                db[modelName].push(item);
            }

            if (item && update.$inc) {
                for (let key in update.$inc) item[key] = (item[key] || 0) + update.$inc[key];
            }

            return { then: (resolve) => resolve(item) };
        }

        static findByIdAndDelete(id) {
            const index = db[modelName].findIndex(d => d._id === id);
            if (index > -1) db[modelName].splice(index, 1);
            return { then: (resolve) => resolve(true) };
        }
    }

    return MockModel;
};

module.exports = createMockModel;
