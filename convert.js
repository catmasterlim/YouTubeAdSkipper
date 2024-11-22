const sharp = require('sharp');
const path = require('path');
const sizes = [16, 48, 128];

sizes.forEach(size => {
  sharp(path.join(__dirname, 'icons', 'icon.svg'))
    .resize(size, size)
    .toFile(path.join(__dirname, 'icons', `icon${size}.png`))
    .catch(err => console.error(err));
}); 