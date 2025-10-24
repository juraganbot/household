import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISearchHistory extends Document {
  email: string;
  searchedAt: Date;
  resultsCount: number;
  blockedCount: number;
  ipAddress?: string;
  userAgent?: string;
}

const SearchHistorySchema = new Schema<ISearchHistory>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    searchedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
    blockedCount: {
      type: Number,
      default: 0,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: false,
    collection: 'search_history',
  }
);

SearchHistorySchema.index({ email: 1, searchedAt: -1 });
SearchHistorySchema.index({ searchedAt: -1 });

const SearchHistory: Model<ISearchHistory> =
  mongoose.models.SearchHistory || mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);

export default SearchHistory;
