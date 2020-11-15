const multer = require('multer')

const uploadSinggle = () => {
    // buat diskStorage
    let diskStorage = multer.diskStorage({
        // buat destinasi nyimpen file nya
        destination : (req, file, next) => {
            next(null, 'public/avatar')
        },
        // buat penamaan filenya
        filename : (req, file, next) => {
            next(null, 'PIMG-' + Date.now() + '.' + file.mimetype.split('/')[1])
        }
    })

    // buat filtering berdasarkan hanya image yg boleh masuk
    let fileFilter = (req, file, next) => {
        try {
            if(file.mimetype.includes('image') === false) throw 'File Must Be An Image'
            next(null, true)
        } catch (error) {
            req.bebas = error
            next(null, false)
        }
    }

    // buat limit size 
    let upload = multer({storage : diskStorage, fileFilter : fileFilter, limits: { fieldSize: 2 * 1024 * 1024 }}).single('image')
    return upload
}

module.exports = uploadSinggle