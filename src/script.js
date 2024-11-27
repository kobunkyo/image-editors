const divUpload = document.getElementById("upload-image");
const divResult = document.getElementById("result");

const submitBtn = document.getElementById("submit");
const goBackBtn = document.getElementById("back");

let inputFile = document.getElementById("file-image");
let imageFile;

let original = document.getElementById("original");
let transform = document.getElementById("transform");

const option = document.getElementById("select-process");

var canvas, context;

function InitImage(){
    imageFile = inputFile.files[0];
    original.src = URL.createObjectURL(imageFile);
}

function InitCanvas(){
    canvas = document.getElementById("canvas-hidden");
    context = canvas.getContext ("2d");
    // Mengatur image ukuran canvas agar sesuai dengan image yang ada
    canvas.height = original.height;
    canvas.width = (original.height/original.naturalHeight)*original.naturalWidth;

    // Draw image yang ada source aslinya
    context.drawImage(original, 0, 0, canvas.width, canvas.height);
}

function RGBtoGrayscale(r, g, b){
    // NTSC formula
    return (0.299 * r) + (0.587 * g) + (0.114 * b);
}

function Grayscale(){
    InitCanvas();

    // Mengambil buffer pada image yang telah digambar
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Melakukan manipulasi data dari buffer yang telah diambil
    const pixels = imageData.data;
    for (let i = 0; i < pixels.length; i += 4 ){
        const r = pixels[i];
        const g = pixels[i+1];
        const b = pixels[i+2];
        const grayscale = RGBtoGrayscale(r, g, b);
        pixels[i] = grayscale;
        pixels[i+1] = grayscale;
        pixels[i+2] = grayscale;
    }

    // Menaruh data yang sudah diubah ke gambar yang berada di canvas
    context.putImageData(imageData, 0, 0);

    // Mengembalikan gambar yang sudah dioleh dalam bentuk URL dari canvas ke tag <img> pada HTML
    return canvas.toDataURL();
}

function BoxBlur(){
    // Melakukan inisialisasi untuk apa saja yang akan dihitung nantinya
    InitCanvas();
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    const blurRadius = 15; // Blur radius (semakin besar semakin menjadi blur dan semakin lama iterasi yang dilakukan)

    // Data pixel original di duplikasi agar dapat melakukan perhitungan untuk blur
    const orginalPixels = pixels;

    // Y adalah row dan X adalah column
    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){
            let r=0, g=0, b=0;
            let count = 0;

            // dy dan dx adalah offset terhadap pixel
            for(let dy = -blurRadius; dy <= blurRadius; dy++){
                for(let dx = -blurRadius; dx <= blurRadius; dx++){
                    
                    // nx dan ny adalah koordinat yang harus dipertimbangakan oleh kernel
                    const nx = x + dx;
                    const ny = y + dy;

                    // Untuk memastikan kernel berada dalam radius dari gambar
                    if(nx >= 0 && nx < width && ny >=0 && ny < height){
                        // Menghitung rata-rata nilai yang akan dijadikan hasil untuk blur
                        const i = (ny * width + nx) * 4;
                        r += orginalPixels[i];
                        g += orginalPixels[i+1];
                        b += orginalPixels[i+2];
                        count++;
                    }
                }
            }
            // Menetapkan warna pixel sehingga menghasilkan blur
            const i = (y * width + x) * 4;
            pixels[i] = r / count;
            pixels[i+1] = g / count;
            pixels[i+2] = b / count;
        }
    }

    // Proses yang sama seperti RGB to Grayscale
    context.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
}

// Saat ada input gambar maka mengambil file dan dimasukkan ke dalam tag <img> yang akan digunakan untuk tag <canvas>
inputFile.onchange = function(){
    InitImage();
}

submitBtn.addEventListener("click", function(){
    // Jika ada image file maka lakukan pengolahan gambar
    if(imageFile){
        if(option.value == "grayscale"){
            transform.src = Grayscale();
        }else if(option.value == "blur"){
            transform.src = BoxBlur();
        }
        divUpload.style.display = "none";
        divResult.style.display = "flex";
        inputFile.value = '';
    }else{
        window.alert("Input your image please");
    }
    

});

goBackBtn.addEventListener("click", function(){
    divUpload.style.display = "flex";
    divResult.style.display = "none";
})

