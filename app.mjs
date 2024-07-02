import express from "express";
import cors from "cors";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

app.get("/artists", async (req, res) => {
  const artistName = req.query.name;
  const artistNamePattern = `%${artistName}%`;
  try {
    const result = await connectionPool.query(
      `SELECT * FROM artists
       WHERE name LIKE LOWER($1)
       OR $1 = null
       OR $1 = ''
      `,
      [artistNamePattern]
    );
    return res.status(200).json(result.rows);
  } catch {
    return res.status(500).json({
      message: "Server could not read data due to database connection",
    });
  }
});

app.get("/albums", async (req, res) => {
  try {
    const result = await connectionPool.query(
      `SELECT *
       FROM artists
       INNER JOIN albums
       ON artists.artist_id = albums.artist_id`
    );
    return res.status(200).json(result.rows);
  } catch {
    return res.status(500).json({
      message: "Server could not read data due to database connection",
    });
  }
});

app.get("/library", async (req, res) => {
  try {
    const result = await connectionPool.query(
      `SELECT *
       FROM artists
       INNER JOIN albums
       ON artists.artist_id = albums.artist_id`
    );
    return res.status(200).json(result.rows);
  } catch {
    return res.status(500).json({
      message: "Server could not read data due to database connection",
    });
  }
});

app.post("/library/artists", async (req, res) => {
  const newArtist = { ...req.body };
  try {
    await connectionPool.query(
      `
        INSERT INTO artists (name, image)
        values ($1, $2)`,
      [newArtist.name, newArtist.image]
    );
    const findNewArtistId = await connectionPool.query(
      `
        SELECT artist_id FROM artists
        ORDER BY artist_id DESC
        LIMIT 1;`
    );
    return res.status(201).json(findNewArtistId.rows);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

app.post("/library/albums/:artist_id", async (req, res) => {
  const artistId = req.params.artist_id;
  const newAlbum = { ...req.body };
  try {
    await connectionPool.query(
      `
        INSERT INTO albums (artist_id, title, album_cover, url)
        values ($1, $2, $3, $4)`,
      [artistId, newAlbum.title, newAlbum.album_cover, newAlbum.url]
    );
    return res
      .status(201)
      .json({ message: "Album has been added sucessfully" });
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
