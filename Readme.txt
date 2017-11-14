Install mongodb dari website (for windows) , pilih community edition , kemudian download & install.
utk import database :
1. pindahkan hrcusers.json to C:/Program Files/MongoDB/Server/3.4/bin
2. di command line , ketik "cd C:/Program Files/MongoDB/Server/3.4/bin" (no doublequote)
3. kemudian ketik "mongoimport.exe -d hrc -c users --file hrcusers.json" (no doublequote)

utk start database (sebelum jalankan index.js) :
1. di command line , type "cd C:/Program Files/MongoDB/Server/3.4/bin" (no doublequote)
2. ketk "mongod.exe"

utk buka mongoshell (database editor utk mongodb)
1. di command line , ketik "cd C:/Program Files/MongoDB/Server/3.4/bin" (no doublequote)
2. ketik "mongo.exe"
3. buka schema/document dgn ketik "use hrc"
4. utk melihat isi data users dalam db , ketik "db.users.find()"


Package manager : npm (secara default telah disediakan nodejs, jd tidak perlu install lagi)

utk gbr, bisa diletakkan di folder /public/assets , jadi utk memanggil gbr , panggil <img src="/assets/..." /> (... utk nama file gbr)

