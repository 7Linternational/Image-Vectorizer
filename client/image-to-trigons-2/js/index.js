$(document).ready(function() {

    $("#file-input").on('change', Trigons.selectImages);
    $("#imageURL").val("https://images.unsplash.com/photo-1473042904451-00171c69419d?auto=format&fit=crop&w=1975&q=80");
    $(".submitBtn").on("click", Trigons.makeVector);
    var clipboard = new Clipboard('.copyBtn');


});

var Trigons = {
    controls: {},
    imgCache: [],
    makeVector: function(isLocal) {
        var url = $("#imageURL").val();
        var _isLocal = isLocal || false;
        if (isLocal === true) {
            url = Trigons.imgCache[0];
        }

        // validation //
        if (url === "") {
            return false;
        }

        $("#trigonImg").css("display", "none");
        $.ajax({
            crossOrigin: false,
            dataType: "json",
            type: 'POST',
            url: "http://185.168.193.196:3000/convert", //"http://localhost:3000/convert", //"http://185.168.193.194:3000/convert",
            //"https://s3-us-west-2.amazonaws.com/s.cdpn.io/1581715/sample_copy.json",
            data: { url: url, cutoff: Number($("#quality").val()), local: _isLocal },
            success: function(data) {
                var _dat = data;
                //window.console.log(_dat);
                Trigons.init(_dat);
                $(".loader").removeClass("hidden").addClass("hidden");
            }
        });

        $(".loader").removeClass("hidden");
    },
    mainInit: function(data) {
        var canvasName = "my-canvas" + _.uniqueId("_result_");
        jQuery("body").append('<canvas id="' + canvasName + '"></canvas>');
        var config = {
            width: data.width,
            height: data.height,
            type: Phaser.AUTO,
            parent: canvasName,
            scene: {
                create: create,
                update: update
            }
        };

        Trigons.game = new Phaser.Game(config);

        function create() {
            Trigons.phaserObj = this;
            //  The world is 3200 x 600 in size
            //this.cameras.main.setBounds(0, 0, data.width, data.height);
            var cursors = this.input.keyboard.createCursorKeys();
            var controlConfig = {
                camera: this.cameras.main,
                left: cursors.left,
                right: cursors.right,
                up: cursors.up,
                down: cursors.down,
                zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
                zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
                acceleration: 0.01,
                maxSpeed: 1.0
            };

            Trigons.controls = this.cameras.addSmoothedKeyControl(controlConfig);

            this.input.keyboard.events.on(
                "KEY_DOWN_Z",
                function(event) {
                    this.cameras.main.rotation += 0.01;
                },
                0,
                this
            );

            this.input.keyboard.events.on(
                "KEY_DOWN_X",
                function(event) {
                    this.cameras.main.rotation -= 0.01;
                },
                0,
                this
            );
        }

        function update(time, delta) {
            Trigons.controls.update(delta);
        }
    },
    init: function(data) {
        window.console.log("init");

        if (Trigons.game !== undefined) {
            Trigons.game.destroy = function() {
                this.renderer.destroy();
                this.loop.stop();
                this.canvas.remove();
                window.game = null;
            };
            Trigons.game.destroy();
            $("canvas").remove();
            Trigons.game = null;
            window.game = null;
        }


        //Trigons.mainInit();
        //Trigons.game.width = data.width;
        //Trigons.game.height = data.height;
        //$("canvas").attr("width", data.width);
        //$("canvas").attr("height", data.height);


        Trigons.mainInit(data);
        /// Actual triangles renderer ///
        var graphics = Trigons.phaserObj.add.graphics({
            lineStyle: { width: 4, color: "#00ff00" },
            fillStyle: { color: Trigons.rgbToNum(255, 255, 255) }
        });
        _.forEach(data.tris, function(o) {

            graphics.fillStyle(Trigons.rgbToNum(o.r, o.g, o.b));
            var triangle = new Phaser.Geom.Triangle(
                o.x0,
                o.y0,
                o.x1,
                o.y1,
                o.x2,
                o.y2
            );

            // graphics.strokeTriangleShape(triangle);

            graphics.fillTriangleShape(triangle);
        });

        graphics.generateTexture('triGraphics');
        graphics.clear();
        var image = Trigons.phaserObj.add.image(0, 0, 'triGraphics').setOrigin(0);
        image.width = data.width;
        image.height = data.height;
        Trigons.game.renderer.snapshot(function(image) {
            $("canvas").css("display", "none");
            $(image).addClass("trigonImg").attr("id", "trigonImg");
            $("#trigonImg").remove();
            var elem = $("body").append(image);
            Trigons.toDataURL(document.getElementById('trigonImg'), function(dataUrl) {
                $("#base64Output").val(dataUrl);
                //$("#imageURL").val("");
            }, "image/jpeg");
        }, 'image/jpeg', 1.0);
        //$("#finalImg").attr("src", jpegUrl);


    },
    rgbToNum: function(r, g, b) {
        return "0x" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    selectImages: function(e) {
        Trigons.imgCache = [];
        var img = e.target.files[0];
        $("#imageURL").val($("#file-input").val());
        if (img) {
            if (img.size > (1048576 * 10)) {
                //window.console.log("large image");
                return false;
            }
            //window.console.log(img);
            if (/^image\//i.test(img.type)) {
                Trigons.readFile(img, 0);
            } else {
                alert('Not a valid image!');
            }
        }
    },
    readFile: function(file, index) {

        var reader = new FileReader();
        reader.onloadend = (function(file, count) {
            return function(e) {
                //window.console.log(reader, count);
                Trigons.imgCache.push(reader.result.replace("data:image/jpeg;base64,", "").replace("data:image/png;base64,", ""));
                //window.console.log(Trigons.imgCache);
                Trigons.makeVector(true);
            }
        })(file, index);
        reader.readAsDataURL(file);
    },
    toDataURL: function(src, callback, outputFormat) {
        var img = src;
        img.crossOrigin = 'Anonymous';

        //var canvas = document.createElement('canvas');
        //var ctx = canvas.getContext('2d');
        var dataURL = $("#trigonImg").attr("src");
        //ctx.drawImage(img, 0, 0, img.width, img.height);
        //window.console.log(img, img.width, img.height);
        //
        callback(dataURL);
    }
};