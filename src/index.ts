import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import { dbConnect } from "./db/connext";
import FavYoutubeModal from "./db/fav-youtube-modal";
import { isValidObjectId } from "mongoose";
import { stream, streamText, streamSSE } from "hono/streaming";

const app = new Hono();

//middlewares

app.use(poweredBy());
app.use(logger());

dbConnect()
  .then(() => {
    //Get the List
    app.get("/", async (c) => {
      const doc = await FavYoutubeModal.find();
      return c.json(
        doc.map((d) => d.toObject()),
        200
      );
    });
    // creating a Document
    app.post("/", async (c) => {
      const formData = await c.req.json();
      if (!formData.thumbnailUrl) delete formData.thumbnailUrl;

      const favYoutubeVidObj = new FavYoutubeModal(formData);
      try {
        const doc1 = await favYoutubeVidObj.save();
        return c.json(doc1.toObject(), 201);
      } catch (error) {
        return c.json((error as any)?.message || "internal server error", 500);
      }
    });

    // view document by Id
    app.get("/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) {
        return c.json("Invalid Id", 400);
      }
      const doc2 = FavYoutubeModal.findById(id);
      if (!doc2) {
        return c.json("Document not found", 404);
      }
      return c.json(doc2, 200);
    });

    app.get("/d/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) {
        return c.json("Invalid Id", 400);
      }
      const doc3 = await FavYoutubeModal.findById(id);
      if (!doc3) {
        return c.json("Document not found", 404);
      }

      return streamText(c, async (s) => {
        s.onAbort(() => {
          console.log("Aborted!");
        });
        for (let i = 0; i < doc3.description.length; i++) {
          await s.write(doc3.description[i]);
          await s.sleep(1000);
        }
      });
    });

    app.patch("/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) {
        return c.json("Invalid Id", 400);
      }
      const doc4 = await FavYoutubeModal.findById(id);
      if (!doc4) {
        return c.json("Document not found", 404);
      }
      const formData = await c.req.json();
      if (!formData.thumbnailUrl) delete formData.thumbnailUrl;
      try {
        const updatedData = await FavYoutubeModal.findByIdAndUpdate(
          id,
          formData,
          {
            new: true,
          }
        );
        return c.json(updatedData?.toObject(), 200);
      } catch (error) {
        return c.json((error as any)?.message || "internal server error", 500);
      }
    });

    app.delete("/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) {
        return c.json("Invalid Id", 400);
      }
      try {
        const deletedDoc = await FavYoutubeModal.findByIdAndDelete(id);
        return c.json(deletedDoc?.toObject(), 200);
      } catch (error) {
        return c.json((error as any)?.message || "internal server error", 500);
      }
    });
  })
  .catch((err) => {
    app.get("/*", (c) => {
      return c.text("Error connecting to database");
    });
    app.onError((err, c) => {
      return c.text(`Error connecting to database: ${err.message}`);
    });
  });

export default app;
