import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { stream, streamText, streamSSE } from "hono/streaming";
let videos = [];

const app = new Hono();

app.get("/", (c) => {
  return c.html("<h1>Hello World Hono</h1>");
});

app.post("/videos", async (c) => {
  const { videoName, channelName, duration } = await c.req.json();

  const newVideo = {
    id: uuidv4(),
    videoName,
    channelName,
    duration,
  };
  videos.push(newVideo);
  return c.json(newVideo);
});
// Read All data (using stream)

app.get("/videos", async (c) => {
  return streamText(c, async (stream) => {
    for (const video of videos) {
      await stream.writeln(JSON.stringify(video));
      await stream.sleep(1000);
    }
  });
});

// Read By Id
app.get("/videos/:id", (c) => {
  const { id } = c.req.param();
  const video = videos.find((video) => video.id === id);
  if (!video) {
    return c.status(404).json({ message: "Video not found" });
  }
  return c.json(video);
});

// update
app.put("/videos/:id", async (c) => {
  const { id } = c.req.param();
  const index = videos.findIndex((video) => video.id === id);
  if (index === -1) {
    return c.status(404).json({ message: "Video not found" });
  }
  const { videoName, channelName, duration } = await c.req.json();
  videos[index] = {
    ...videos[index],
    videoName,
    channelName,
    duration,
  };
  return c.json(videos[index]);
});

// Delete
app.delete("/videos/:id", (c) => {
  const { id } = c.req.param();
  videos = videos.filter((video) => video.id !== id);
  return c.json({ message: "Video Deleted" });
});
// delete all
app.delete("/videos", (c) => {
  videos = [];
  return c.json({ message: "All videos deleted" });
});

export default app;
