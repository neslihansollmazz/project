const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// HTML dosyasını sun
app.use(express.static(__dirname));

// MySQL bağlantısı
const db = mysql.createConnection({
    host: "10.33.22.208",
    user: "root",
    password: "Bel33.Mez33",
    database: "harcama_takip"
});

// Personel verisi
app.get("/personel", (req, res) => {
    db.query("SELECT * FROM personel", (err, result) => {
        if (err) return res.json({ Error: err });
        return res.json(result);
    });
});

app.listen(8080, () => {
    console.log("API 8080 portunda çalışıyor");
});
