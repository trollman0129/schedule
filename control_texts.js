var num = 0;

function generateTexts() {
    num ++;
    var context = document.createElement("ul");
    context.style.display = "flex";
    context.id = `context_${num}`;
    var date_context = document.createElement("div");

    var context_num = document.createElement("h2");
    context_num.innerHTML = num;
    date_context.appendChild(context_num);
    var live_context = document.createElement("label");

    var date_text = document.createElement("div");
    date_text.innerHTML = "<p>日付</p>";
    var date = document.createElement("input");
    date.type = "text";
    date.id = `date_${num}`;

    var live_text = document.createElement("label");
    live_text.innerHTML = "<p>ライブ名</p>";
    var live = document.createElement("input");
    live.id = `live_${num}`;
    live.type = "text";

    var small_text = document.createElement("label");
    small_text.innerHTML = "<p>詳細</p>";
    var small = document.createElement("input");
    small.id = `small_${num}`;
    small.type = "text";

    var cancel = document.createElement("button");
    cancel.id = `cancel_${num}`;
    cancel.className = "cancel-button";
    cancel.innerHTML = "x";
    cancel.onclick = function() {
        if(num > 1){
            let n = parseInt(this.id.split("_")[1]);
            console.log(n);
            for (let i = n + 1; i <= num; i++) {
                let elem = document.getElementById(`context_${i}`);
                if (elem) {
                    elem.id = `context_${i - 1}`;
                    let btn = elem.querySelector(`#cancel_${i}`);
                    if (btn) btn.id = `cancel_${i - 1}`;
                    let h2 = elem.querySelector("h2");
                    if (h2) h2.innerHTML = i - 1;
                    let dateInput = document.getElementById(`date_${i}`);
                    if (dateInput) dateInput.id = `date_${i - 1}`;
                    let liveInput = document.getElementById(`live_${i}`);
                    if (liveInput) liveInput.id = `live_${i - 1}`;
                    let smallInput = document.getElementById(`small_${i}`);
                    if (smallInput) smallInput.id = `small_${i - 1}`;
                }
            }

            num --;
            document.getElementById(`context_${n}`).remove();
        }
    }

    context.appendChild(context_num);
    context.appendChild(date_text);
    context.appendChild(date);
    context.appendChild(live_text);
    context.appendChild(live);
    context.appendChild(small_text);
    context.appendChild(small);
    context.appendChild(cancel);
    document.body.appendChild(context);
}

function generateImage(){
    var defaultFontSize = 72;
    
    var font = new FontFace('NagomiGokubosoGothic', 'url(NagomiGokubosoGothic-ExtraLight.otf)');
    font.load().then(function(loadedFont) {
        document.fonts.add(loadedFont);
        
        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');

            var canvasWidth = Number(img.naturalWidth || img.width);
            var canvasHeight = Number(img.naturalHeight || img.height);
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            
            ctx.drawImage(img, 0, 0);
            
            var text = "";
            for (let i = 1; i <= num; i++) {
                var dateVal = document.getElementById(`date_${i}`) ? document.getElementById(`date_${i}`).value : "";
                var liveVal = document.getElementById(`live_${i}`) ? document.getElementById(`live_${i}`).value : "";
                var smallVal = document.getElementById(`small_${i}`) ? document.getElementById(`small_${i}`).value : "";

                text += '<s>' + dateVal + '<br>';
                text += '<s100>' + liveVal + '<br>';
                text += '<s>' + smallVal;
                if (i < num && smallVal) text += '<br>';
            }

            var tokens = parseControlCharacters(text, defaultFontSize);
            
            var lineHeight = defaultFontSize * 1.2;
            var lineCount = 1;
            tokens.forEach(token => {
                if (token.text === '\n') lineCount++;
            });
            
            var totalBlockHeight = (lineCount - 1) * lineHeight;
            
            var textY = (canvasHeight / 2) - (totalBlockHeight / 2) + (defaultFontSize / 3) + 50;
            
            console.log(`キャンバスの高さ: ${canvasHeight}px`);
            console.log(`テキストの全高: ${totalBlockHeight}px`);
            console.log(`計算された開始位置(textY): ${textY}`);

            if (isNaN(textY)) {
                console.error("textYがNaNになったため、中央に強制リセットしました。");
                textY = canvasHeight / 2;
            }
            var topPadding = 100; 
            if (textY < topPadding) {
                console.warn("テキストが長すぎるため、上揃えに調整しました。");
                textY = topPadding;
            }
            
            var textX = 0; 
            
            ctx.fillStyle = 'white';
            ctx.textAlign = 'left';
            
            tokens.forEach(function(token) {
                if (token.text === '\n') {
                    textX = 0;
                    textY += lineHeight + 30;
                } else {
                    ctx.font = token.size + 'px NagomiGokubosoGothic';
                    ctx.fillStyle = token.color;
                    ctx.fillText(token.text, textX, textY);
                    textX += ctx.measureText(token.text).width;
                }
            });
            
            canvas.toBlob(function(blob) {
                if (blob) {
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = 'schedule_image.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
            });
        };
        img.src = 'n.png';
    }).catch(function(error) {
        console.error('フォントのロードに失敗しました:', error);
    });
}

function parseControlCharacters(text, defaultSize) {
    var tokens = [];
    var currentSize = defaultSize;
    var currentColor = 'white';
    var i = 0;
    var currentText = '';
    
    while (i < text.length) {
        if (text[i] === '<') {
            if (currentText.length > 0) {
                tokens.push({
                    text: currentText,
                    size: currentSize,
                    color: currentColor
                });
                currentText = '';
            }
            
            var tagEnd = text.indexOf('>', i);
            if (tagEnd !== -1) {
                var tag = text.substring(i + 1, tagEnd);
                
                if (tag === 'br') {
                    tokens.push({
                        text: '\n',
                        size: currentSize,
                        color: currentColor
                    });
                }
                else if (tag[0] === 's') {
                    if (tag.length > 1) {
                        currentSize = parseInt(tag.substring(1));
                    } else {
                        currentSize = defaultSize;
                    }
                }
                else if (tag[0] === 'r') {
                    if (tag.length > 1) {
                        currentColor = 'rgb(' + tag.substring(1) + ')';
                    } else {
                        currentColor = 'white';
                    }
                }
                
                i = tagEnd + 1;
            } else {
                currentText += text[i];
                i++;
            }
        } else {
            currentText += text[i];
            i++;
        }
    }
    
    if (currentText.length > 0) {
        tokens.push({
            text: currentText,
            size: currentSize,
            color: currentColor
        });
    }
    
    return tokens;
}

window.onload = function() {
    generateTexts();
}