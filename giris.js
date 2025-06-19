// const express = require('express');
// const mysql = require('mysql');
// const cors = require('cors');
// const path = require('path');

// const app = express();
// const port = 3000;

// app.use(cors());
// app.use(express.json());
// app.use(express.static(path.join(__dirname, 'proje')));


// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'proje', 'giris.html'));
// });

// const connection = mysql.createConnection({
//   host: '10.33.22.208',
//   user: 'root',
//   password: 'Bel33.Mez33',
//   database: 'talep'
// });

// connection.connect(err => {
//   if (err) {
//     console.error('MySQL bağlantı hatası:', err);
//   } else {
//     console.log('MySQL bağlantısı başarılı.');
//   }
// });

// // Login endpoint
// app.post('/giris', (req, res) => {
//   const { kullanici_adi, sifre } = req.body;

//   if (!kullanici_adi || !sifre) {
//     return res.status(400).json({ basarili: false, mesaj: "Kullanıcı adı ve şifre gereklidir." });
//   }

//   const sorgu = "SELECT * FROM kullanici WHERE kullanici_adi = ? AND sifre_hash = ?";

//   connection.query(sorgu, [kullanici_adi, sifre], (err, results) => {
//     if (err) {
//       console.error("Veritabanı hatası:", err);
//       return res.status(500).json({ basarili: false, mesaj: "Sunucu hatası." });
//     }

//     if (results.length > 0) {
//       res.json({ basarili: true, mesaj: "Giriş başarılı." });
//     } else {
//       res.json({ basarili: false, mesaj: "Kullanıcı adı veya şifre hatalı." });
//     }
//   });
// });

// app.listen(port, () => {
//   console.log(`Sunucu http://localhost:${port} üzerinde çalışıyor`);
// });




