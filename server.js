const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'güvenlik123'; // Dilersen daha karmaşık yap


const app = express();
const port = 3000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'proje')));



const connection = mysql.createConnection({
  host: '10.33.22.208',
  user: 'root',
  password: 'Bel33.Mez33',
  database: 'talep'
});

connection.connect(err => {
  if (err) {
    console.error('MySQL bağlantı hatası:', err);
  } else {
    console.log('MySQL bağlantısı başarılı.');
  }
});


// Kullanıcıları getiren endpoint
app.get('/kullanici', (req, res) => {
  const query = 'SELECT *  FROM kullanici';
  connection.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});


// Kayıt endpoint'i
app.post('/register', (req, res) => {
  const { kullanici_adi, sifre, eposta, tam_adi, telefon } = req.body;

  // Basit kontrol (zorunlu alanlar kontrolü)
  if (!kullanici_adi || !sifre || !eposta || !tam_adi) {
    return res.status(400).json({ mesaj: 'Lütfen zorunlu alanları doldurun.' });
  }

  // MySQL INSERT sorgusu
  const query = 'INSERT INTO kullanici (kullanici_adi, sifre_hash, eposta, tam_adi, telefon) VALUES (?, ?, ?, ?, ?)';
  
  // Şifre hashleme yok, direkt koyuyoruz (geliştirebilirsin)
  connection.query(query, [kullanici_adi, sifre, eposta, tam_adi, telefon || null], (err, result) => {
    if (err) {
      console.error('Veritabanı hatası:', err);
      return res.status(500).json({ mesaj: 'Kayıt sırasında hata oluştu.' });
    }
    res.json({ mesaj: 'Kayıt başarılı!' });
  });
});
app.post('/login', (req, res) => {
  const { kullanici_adi, sifre } = req.body;

  if (!kullanici_adi || !sifre) {
    return res.status(400).json({ basarili: false, mesaj: "Kullanıcı adı ve şifre gereklidir." });
  }

  const sorgu = "SELECT * FROM kullanici WHERE kullanici_adi = ? AND sifre_hash = ?";

  connection.query(sorgu, [kullanici_adi, sifre], (err, results) => {
    if (err) {
      console.error("Veritabanı hatası:", err);
      return res.status(500).json({ basarili: false, mesaj: "Sunucu hatası." });
    }

    if (results.length > 0) {
      const user = results[0];

      // Token oluştur
      const token = jwt.sign(
        { kullanici_adi: user.kullanici_adi, rol: user.rol || 'kullanici' },
        JWT_SECRET,
        { expiresIn: '2h' } // 2 saat geçerli
      );

      res.json({
        basarili: true,
        mesaj: "Giriş başarılı.",
        token: token,
        kullanici: {
          id: user.id,
          kullanici_adi: user.kullanici_adi,
          rol: user.rol || 'kullanici'
        }
      });
    } else {
      res.json({ basarili: false, mesaj: "Kullanıcı adı veya şifre hatalı." });
    }
  });
});



app.post('/sikayet', (req, res) => {
  const { aciklama, adres, tur } = req.body;

  if (!aciklama || !adres || !tur) {
    return res.status(400).json({ mesaj: "Açıklama, adres ve tür zorunludur." });
  }

  const query = "INSERT INTO sikayet (aciklama, adres, tur) VALUES (?, ?, ?)";
  connection.query(query, [aciklama, adres, tur], (err, result) => {
    if (err) {
      console.error("Sikayet kayıt hatası:", err);
      return res.status(500).json({ mesaj: "Kayıt sırasında hata oluştu." });
    }

    res.json({ mesaj: "Şikayet/Talep başarıyla kaydedildi.", id: result.insertId });
  });
})
// Şikayetleri tarihe göre getir (admin paneli için)
app.get('/admin/sikayetler', (req, res) => {
  const query = 'SELECT * FROM sikayet ORDER BY created_time DESC';
  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ mesaj: 'Veritabanı hatası' });
    res.json(results);
  });
});

// Şikayeti tamamlanmış olarak işaretle (finish_time güncelle)
app.put('/admin/sikayetler/:id/bitir', (req, res) => {
  const { id } = req.params;
  const query = `UPDATE sikayet SET finish_time = NOW() WHERE id = ?`;

  connection.query(query, [id], (err, result) => {
    if (err) {
      console.error('Güncelleme hatası:', err);
      return res.status(500).json({ mesaj: 'Şikayet güncellenirken hata oluştu.' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ mesaj: 'Şikayet bulunamadı.' });
    }
    res.json({ mesaj: 'Şikayet başarıyla tamamlandı.' });
  });
});
// Şifre değiştirme endpoint'i
app.post('/sifre_degistir', (req, res) => {
  const { kullanici_adi, eski_sifre, yeni_sifre, yeni_sifre_tekrar } = req.body;

  // Gerekli alanlar kontrolü
  if (!kullanici_adi || !eski_sifre || !yeni_sifre || !yeni_sifre_tekrar) {
    return res.status(400).json({ mesaj: 'Lütfen tüm alanları doldurun.' });
  }

  // Yeni şifreler eşleşiyor mu?
  if (yeni_sifre !== yeni_sifre_tekrar) {
    return res.status(400).json({ mesaj: 'Yeni şifreler uyuşmuyor.' });
  }

  // Kullanıcının mevcut şifresini doğrula
  const kontrolSorgusu = 'SELECT * FROM kullanici WHERE kullanici_adi = ? AND sifre_hash = ?';

  connection.query(kontrolSorgusu, [kullanici_adi, eski_sifre], (err, results) => {
    if (err) {
      console.error('Veritabanı hatası:', err);
      return res.status(500).json({ mesaj: 'Sunucu hatası' });
    }

    if (results.length === 0) {
      return res.status(401).json({ mesaj: 'Mevcut şifre yanlış veya kullanıcı bulunamadı.' });
    }

    // Şifre güncelleme
    const guncelleSorgusu = 'UPDATE kullanici SET sifre_hash = ? WHERE kullanici_adi = ?';

    connection.query(guncelleSorgusu, [yeni_sifre, kullanici_adi], (err, result) => {
      if (err) {
        console.error('Şifre güncelleme hatası:', err);
        return res.status(500).json({ mesaj: 'Şifre güncellenemedi.' });
      }

      res.json({ mesaj: 'Şifre başarıyla güncellendi.' });
    });
  });
});



app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} üzerinde çalışıyor`);
});
