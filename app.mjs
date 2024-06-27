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

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
