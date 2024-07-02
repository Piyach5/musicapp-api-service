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

app.post("/addtolibrary", async (req, res) => {
  const newArtist = { ...req.body };
  try {
    const result = await connectionPool.query(
      `
        INSERT INTO artists (name, image)
        values ($1, $2)
        RETURNING artist_id
        `,
      [newArtist.name, newArtist.image]
    );

    const newArtistId = result.rows[0].artist_id;

    await connectionPool.query(
      ` 
        INSERT INTO albums (artist_id, title, album_cover, url)
        values ($1, $2, $3, $4)`,
      [newArtistId, newArtist.title, newArtist.album_cover, newArtist.url]
    );
    return res.status(201).json({ message: "Add to library successfully" });
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

app.put("/library/:artistId", async (req, res) => {
  const artistId = req.params.artistId;
  const newAlbum = { ...req.body };
  try {
    await connectionPool.query(
      `UPDATE albums
       SET title = $1, 
       url = $2,
       album_cover = $3
       WHERE artist_id = $4`,
      [newAlbum.title, newAlbum.album_cover, newAlbum.url, artistId]
    );
    return res.status(200).json({ message: "Album Updated Successfully" });
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

app.delete("/library/:artistId", async (req, res) => {
  const artistId = req.params.artistId;
  try {
    await connectionPool.query(`DELETE FROM artists WHERE artist_id = $1`, [
      artistId,
    ]);
    return res.status(200).json({ message: "Artist Deleted Successfully" });
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
