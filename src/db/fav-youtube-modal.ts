import { Schema, model } from "mongoose";

interface IFavYoutubeModalSchema {
  title: string;
  description: string;
  thumbnailUrl?: string;
  watched: boolean;
  youtuberName: string;
}

const FavYoutubeModalSchema = new Schema<IFavYoutubeModalSchema>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: "https://via.placeholder.com/150",
    required: false,
  },
  watched: {
    type: Boolean,
    default: false,
    required: true,
  },
  youtuberName: {
    type: String,
    required: true,
  },
});

const FavYoutubeModal = model("favYoutube", FavYoutubeModalSchema);

export default FavYoutubeModal;
