const mongoose = require("mongoose");

// Register a one-time handler to drop problematic indexes when connected
mongoose.connection.once("connected", async () => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection("directmessages");

    // Get all indexes
    const indexes = await collection.indexes();

    // Drop all non-standard indexes except _id_ to clean up
    for (const index of indexes) {
      if (index.name !== "_id_") {
        try {
          await collection.dropIndex(index.name);
          console.log("Dropped index:", index.name);
        } catch (err) {
          console.log("Could not drop index", index.name, err.message);
        }
      }
    }

    console.log("Finished cleaning up DirectMessage indexes");
  } catch (err) {
    console.error("Error managing indexes:", err);
  }
});

const DirectMessageSchema = new mongoose.Schema(
  {
    sender_id: {
      type: String,
      required: true,
    },
    receiver_id: {
      type: String,
      required: true,
    },
    room_id: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      enum: ["text", "image", "video"],
      default: "text",
    },
    timestamp: {
      type: Number,
      default: Date.now,
    },
    sender_name: {
      type: String,
    },
    sender_pic: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
    // Explicitly set these fields to undefined to prevent conflicts
    senderId: {
      type: String,
      select: false,
    },
    receiverId: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    // Prevent mongoose from trying to use fields that aren't in the schema
    strict: true,
    strictQuery: true,
  }
);

// Create just the necessary indexes after cleaning up
DirectMessageSchema.index({ room_id: 1, timestamp: 1 });
DirectMessageSchema.index({ receiver_id: 1, read: 1 });
DirectMessageSchema.index(
  {
    sender_id: 1,
    receiver_id: 1,
    content: 1,
    timestamp: 1,
  },
  { unique: true }
);

const DirectMessage = mongoose.model("DirectMessage", DirectMessageSchema);

module.exports = DirectMessage;
