class APIFeatures {
  constructor(query, queryString, currentUserId, collabTask) {
    this.currentUserId = currentUserId;
    this.query = query;
    this.queryString = queryString;
    this.collabTask = collabTask;
  }

  filter() {
    const queryObj = { ...this.queryString };
    // excluding certain fields from query string
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // function escapeRegex(text) {
    //   return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    // }

    // if (this.currentUserId && queryObj.name) {
    //   const searchTerm = queryObj.name.toLowerCase(); // Ensure case-insensitive search
    //   // const nameRegex = new RegExp(`^${searchTerm}.*`, "i"); // Case-insensitive search
    //   const nameRegex = new RegExp(escapeRegex(searchTerm), "gi");

    //   this.query = this.query.find({
    //     creator: this.currentUserId,
    //     name: nameRegex,
    //   });
    //   return this;
    // }

    // For current users task
    if (this.currentUserId && !this.collabTask) {
      this.query = this.query.find({
        creator: this.currentUserId,
        isCollabTask: false,
      });
      // return this;
    }

    // For collab task
    if (this.currentUserId && this.collabTask) {
      this.query = this.query.find({
        $or: [
          {
            creator: this.currentUserId,
          },
          {
            taskMembers: this.currentUserId,
          },
        ],
        isCollabTask: true,
      });
    }

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));

    // // Log final Mongoose query for debugging
    // console.log(this.query.toString());

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.collation({ locale: "en" }).sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      console.log(fields);
      this.query = this.query.select(fields); // operation of selecting certain field name is called projecting
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    // setting defaults
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // page=2&limit=10
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
